import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function TrainingGlobe({ points = [] }) {
  const mountRef = useRef(null);
  const buildRef = useRef(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const mount = mountRef.current;
    let width = mount.clientWidth || 600;
    let height = mount.clientHeight || 420;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const R = 1;
    const group = new THREE.Group();
    scene.add(group);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(R, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x0a1018 })
    );
    group.add(sphere);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.001, 36, 24),
      new THREE.MeshBasicMaterial({ color: 0x1f3d2a, wireframe: true, transparent: true, opacity: 0.45 })
    );
    group.add(wire);

    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.09, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.07, side: THREE.BackSide })
    );
    scene.add(atm);

    const markers = new THREE.Group();
    group.add(markers);

    const markerColor = new THREE.Color(0xccff00);

    function build() {
      while (markers.children.length) {
        const c = markers.children[0];
        c.geometry?.dispose?.();
        c.material?.dispose?.();
        markers.remove(c);
      }
      const pts = pointsRef.current || [];
      pts.forEach((p) => {
        if (p.lat == null || p.lng == null) return;
        const pos = latLngToVector3(p.lat, p.lng, R * 1.02);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.018, 12, 12),
          new THREE.MeshBasicMaterial({ color: markerColor })
        );
        dot.position.copy(pos);
        dot.userData.phase = Math.random() * Math.PI * 2;
        markers.add(dot);

        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 16, 16),
          new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.22 })
        );
        glow.position.copy(pos);
        glow.userData.phase = Math.random() * Math.PI * 2;
        glow.userData.isGlow = true;
        markers.add(glow);
      });
    }
    buildRef.current = build;
    build();

    let dragging = false;
    let px = 0, py = 0;
    const onDown = (e) => {
      dragging = true;
      const t = e.touches ? e.touches[0] : e;
      px = t.clientX; py = t.clientY;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      group.rotation.y += (t.clientX - px) * 0.005;
      group.rotation.x += (t.clientY - py) * 0.005;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x));
      px = t.clientX; py = t.clientY;
    };
    const onUp = () => { dragging = false; };
    const el = renderer.domElement;
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onUp);

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!dragging) group.rotation.y += 0.0016;
      markers.children.forEach((c) => {
        const s = 1 + Math.sin(t * 2.2 + c.userData.phase) * 0.35;
        if (c.userData.isGlow) {
          c.scale.setScalar(s * 1.25);
          c.material.opacity = 0.12 + Math.abs(Math.sin(t * 2.2 + c.userData.phase)) * 0.22;
        } else {
          c.scale.setScalar(s);
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = mount.clientWidth || 600;
      height = mount.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onUp);
      mount.removeChild(el);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (buildRef.current) buildRef.current();
  }, [points]);

  return <div ref={mountRef} className="w-full h-[420px] md:h-[560px]" />;
}