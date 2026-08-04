import { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

/**
 * ボイスルームの参加・退出と、参加者間のWebRTCメッシュ音声通話を管理するフック。
 * シグナリングは VoiceSignal エンティティ経由で行う。
 */
export function useVoiceRoom(roomId, me) {
  const [members, setMembers] = useState([]);
  const [muted, setMuted] = useState(false);
  const [micError, setMicError] = useState(null);
  const [joined, setJoined] = useState(false);

  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const myMemberIdRef = useRef(null);
  const knownMembersRef = useRef(new Set());
  const pendingIceRef = useRef({});
  const containerRef = useRef(null);
  const mutedRef = useRef(false);
  const countedRef = useRef(false);

  // リモート音声再生用の隠しコンテナ
  useEffect(() => {
    const div = document.createElement("div");
    div.style.display = "none";
    document.body.appendChild(div);
    containerRef.current = div;
    return () => div.remove();
  }, []);

  useEffect(() => {
    if (!roomId || !me) return;
    let cancelled = false;
    let unsubMembers, unsubSignal;

    const createPeer = (peerId) => {
      if (peersRef.current[peerId]) return peersRef.current[peerId];
      const pc = new RTCPeerConnection(ICE_SERVERS);
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "");
      containerRef.current.appendChild(audio);
      pc.ontrack = (e) => { audio.srcObject = e.streams[0]; };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          base44.entities.VoiceSignal.create({
            room_id: roomId, from_id: me.id, to_id: peerId, type: "ice",
            payload: JSON.stringify(e.candidate.toJSON())
          }).catch(() => {});
        }
      };
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
      }
      peersRef.current[peerId] = pc;
      return pc;
    };

    const callPeer = async (peerId) => {
      const pc = createPeer(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await base44.entities.VoiceSignal.create({
          room_id: roomId, from_id: me.id, to_id: peerId, type: "offer",
          payload: JSON.stringify(offer)
        });
      } catch (e) {}
    };

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
      } catch (e) {
        setMicError("マイクへのアクセスに失敗しました。ブラウザの許可設定を確認してください。");
      }

      try {
        const member = await base44.entities.VoiceRoomMember.create({
          room_id: roomId, status: "joined", is_speaker: true, is_muted: false, is_host: false
        });
        if (cancelled) {
          base44.entities.VoiceRoomMember.update(member.id, { status: "left" }).catch(() => {});
          return;
        }
        myMemberIdRef.current = member.id;
        setJoined(true);
        base44.entities.VoiceRoom.updateMany({ id: roomId }, { $inc: { members_count: 1 } }).catch(() => {});
        countedRef.current = true;
      } catch (e) {
        return;
      }

      const existing = await base44.entities.VoiceRoomMember.filter({ room_id: roomId, status: "joined" }, "-created_date", 50);
      const others = existing.filter((m) => m.id !== myMemberIdRef.current);
      setMembers(others);
      others.forEach((m) => {
        knownMembersRef.current.add(m.id);
        const peerId = m.created_by_id;
        if (peerId && me.id < peerId) callPeer(peerId);
      });

      unsubMembers = base44.entities.VoiceRoomMember.subscribe((event) => {
        const d = event.data;
        if (!d || d.room_id !== roomId) return;
        if (d.id === myMemberIdRef.current) return;
        if (event.type === "create") {
          if (knownMembersRef.current.has(d.id)) return;
          knownMembersRef.current.add(d.id);
          setMembers((prev) => (prev.some((m) => m.id === d.id) ? prev : [...prev, d]));
          const peerId = d.created_by_id;
          if (peerId && me.id < peerId) callPeer(peerId);
        } else if (event.type === "update") {
          if (d.status === "left") {
            knownMembersRef.current.delete(d.id);
            setMembers((prev) => prev.filter((m) => m.id !== d.id));
            const peerId = d.created_by_id;
            const pc = peersRef.current[peerId];
            if (pc) { pc.close(); delete peersRef.current[peerId]; }
          } else {
            setMembers((prev) => prev.map((m) => (m.id === d.id ? d : m)));
          }
        }
      });

      unsubSignal = base44.entities.VoiceSignal.subscribe(async (event) => {
        if (event.type !== "create") return;
        const sig = event.data;
        if (!sig || sig.to_id !== me.id || sig.room_id !== roomId) return;
        const peerId = sig.from_id;
        try {
          if (sig.type === "offer") {
            const pc = createPeer(peerId);
            await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.payload)));
            (pendingIceRef.current[peerId] || []).forEach((c) => pc.addIceCandidate(c).catch(() => {}));
            pendingIceRef.current[peerId] = [];
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await base44.entities.VoiceSignal.create({
              room_id: roomId, from_id: me.id, to_id: peerId, type: "answer",
              payload: JSON.stringify(answer)
            });
          } else if (sig.type === "answer") {
            const pc = peersRef.current[peerId];
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.payload)));
              (pendingIceRef.current[peerId] || []).forEach((c) => pc.addIceCandidate(c).catch(() => {}));
              pendingIceRef.current[peerId] = [];
            }
          } else if (sig.type === "ice") {
            const pc = peersRef.current[peerId];
            const candidate = new RTCIceCandidate(JSON.parse(sig.payload));
            if (pc && pc.remoteDescription) {
              pc.addIceCandidate(candidate).catch(() => {});
            } else {
              (pendingIceRef.current[peerId] = pendingIceRef.current[peerId] || []).push(candidate);
            }
          }
        } catch (e) {}
        base44.entities.VoiceSignal.delete(sig.id).catch(() => {});
      });
    })();

    return () => {
      cancelled = true;
      if (unsubMembers) unsubMembers();
      if (unsubSignal) unsubSignal();
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (myMemberIdRef.current) {
        base44.entities.VoiceRoomMember.update(myMemberIdRef.current, { status: "left" }).catch(() => {});
        myMemberIdRef.current = null;
      }
      if (countedRef.current) {
        base44.entities.VoiceRoom.updateMany({ id: roomId }, { $inc: { members_count: -1 } }).catch(() => {});
        countedRef.current = false;
      }
      base44.entities.VoiceSignal.deleteMany({ room_id: roomId, from_id: me.id }).catch(() => {});
      base44.entities.VoiceSignal.deleteMany({ room_id: roomId, to_id: me.id }).catch(() => {});
      knownMembersRef.current = new Set();
      pendingIceRef.current = {};
      setJoined(false);
      setMembers([]);
    };
  }, [roomId, me?.id]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    if (myMemberIdRef.current) {
      base44.entities.VoiceRoomMember.update(myMemberIdRef.current, { is_muted: next }).catch(() => {});
    }
  }, []);

  return { members, muted, micError, joined, toggleMute };
}