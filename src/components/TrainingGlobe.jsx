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

// Subsolar point (where the sun is directly overhead) from current UTC time.
function sunDirection(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const decl = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * Math.PI / 180);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const subsolarLng = -((utcHours - 12) * 15);
  return latLngToVector3(decl, subsolarLng, 1).normalize();
}

const DAY_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const NIGHT_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

const EARTH_VERT = `
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const EARTH_FRAG = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform vec3 sunDirection;
uniform float dayReady;
uniform float nightReady;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  float intensity = dot(normalize(vNormalW), normalize(sunDirection));
  float dayWeight = smoothstep(-0.18, 0.22, intensity);
  vec3 dayTex = texture2D(dayTexture, vUv).rgb;
  vec3 day = mix(vec3(0.12, 0.18, 0.26), dayTex, dayReady) * 1.3;
  // night side: dim terrain (so it's not pure black) + city lights
  vec3 dimTerrain = dayTex * 0.30;
  vec3 cityLights = mix(vec3(0.0), texture2D(nightTexture, vUv).rgb * 1.8, nightReady);
  vec3 night = mix(vec3(0.06, 0.08, 0.12), dimTerrain + cityLights, dayReady);
  vec3 color = mix(night, day, dayWeight);
  // soft twilight band
  float twilight = (1.0 - abs(dayWeight - 0.5) * 2.0) * 0.20;
  color += vec3(0.32, 0.16, 0.06) * twilight;
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function TrainingGlobe({ points = [] }) {
  const mountRef = useRef(null);
  const buildRef = useRef(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const mount = mountRef.current;
    let width = mount.clientWidth || 600;
    let height = mount.clientHeight || 460;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 3.6);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const el = renderer.domElement;
    el.style.touchAction = "none";
    mount.appendChild(el);

    const R = 1;
    const group = new THREE.Group();
    // face the sunlit hemisphere toward the camera initially
    const sun0 = sunDirection(new Date());
    group.rotation.y = -Math.atan2(sun0.x, sun0.z);
    scene.add(group);

    // Day/night earth shader
    const earthUniforms = {
      dayTexture: { value: null },
      nightTexture: { value: null },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      dayReady: { value: 0 },
      nightReady: { value: 0 }
    };
    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), earthMat);
    group.add(earth);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(DAY_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.dayTexture.value = tex;
      earthUniforms.dayReady.value = 1;
    });
    loader.load(NIGHT_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.nightTexture.value = tex;
      earthUniforms.nightReady.value = 1;
    });

    // subtle grid overlay
    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x2a4a3a, wireframe: true, transparent: true, opacity: 0.08 })
    );
    group.add(grid);

    // atmosphere rim glow
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.14, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.12, side: THREE.BackSide })
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
        const pos = latLngToVector3(p.lat, p.lng, R * 1.012);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.022, 14, 14),
          new THREE.MeshBasicMaterial({ color: markerColor })
        );
        dot.position.copy(pos);
        dot.userData.phase = Math.random() * Math.PI * 2;
        markers.add(dot);

        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 16, 16),
          new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.28 })
        );
        glow.position.copy(pos);
        glow.userData.phase = Math.random() * Math.PI * 2;
        glow.userData.isGlow = true;
        markers.add(glow);
      });
    }
    buildRef.current = build;
    build();

    // interaction state
    let dragging = false;
    let pinching = false;
    let px = 0, py = 0;
    let pinchDist = 0;
    const MIN_Z = 1.12, MAX_Z = 6;

    const onDown = (e) => {
      dragging = true;
      pinching = false;
      const t = e.touches ? e.touches[0] : e;
      px = t.clientX; py = t.clientY;
    };
    const onMove = (e) => {
      if (pinching) return;
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      group.rotation.y += (t.clientX - px) * 0.005;
      group.rotation.x += (t.clientY - py) * 0.005;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x));
      px = t.clientX; py = t.clientY;
    };
    const onUp = () => { dragging = false; pinching = false; pinchDist = 0; };

    // touch with pinch zoom + prevent page scroll
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinching = true;
        dragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDist = Math.hypot(dx, dy);
      } else if (e.touches.length === 1) {
        onDown(e);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchDist) {
          camera.position.z = Math.max(MIN_Z, Math.min(MAX_Z, camera.position.z - (dist - pinchDist) * 0.01));
        }
        pinchDist = dist;
      } else if (e.touches.length === 1 && dragging) {
        e.preventDefault();
        onMove(e);
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length === 0) { onUp(); }
      else if (e.touches.length === 1) { pinching = false; pinchDist = 0; px = e.touches[0].clientX; py = e.touches[0].clientY; dragging = true; }
    };

    // wheel zoom (prevent page scroll)
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(MIN_Z, Math.min(MAX_Z, camera.position.z + e.deltaY * 0.004));
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!dragging && !pinching) group.rotation.y += 0.0012;
      // live sun position from current time
      earthUniforms.sunDirection.value.copy(sunDirection(new Date()));
      markers.children.forEach((c) => {
        const s = 1 + Math.sin(t * 2.2 + c.userData.phase) * 0.4;
        if (c.userData.isGlow) {
          c.scale.setScalar(s * 1.3);
          c.material.opacity = 0.14 + Math.abs(Math.sin(t * 2.2 + c.userData.phase)) * 0.26;
        } else {
          c.scale.setScalar(s);
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = mount.clientWidth || 600;
      height = mount.clientHeight || 460;
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
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      mount.removeChild(el);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (buildRef.current) buildRef.current();
  }, [points]);

  return <div ref={mountRef} className="w-full h-[460px] md:h-[600px]" />;
}