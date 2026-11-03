import { useEffect, useRef } from "react";

/** Browser-only Three.js backdrop: slow golden particle field + wire ring. Loaded after hydration. */
export function LandingScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};
    import("three").then((THREE) => {
      if (disposed || !host) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 9;

      const probe = document.createElement('span');
      probe.style.color = 'var(--lp-gold)';
      host.appendChild(probe);
      const gold = new THREE.Color(getComputedStyle(probe).color);
      probe.remove();
      const count = window.innerWidth < 640 ? 180 : 360;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 3 + Math.random() * 5;
        const a = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
        pos[i * 3 + 2] = Math.sin(a) * r - 2;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: gold, size: 0.035, transparent: true, opacity: 0.7 }));
      scene.add(points);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.35 }),
      );
      ring.rotation.x = 1.2;
      scene.add(ring);
      const ring2 = ring.clone();
      ring2.scale.setScalar(1.25);
      ring2.rotation.x = 1.35;
      const mat2 = ring.material.clone();
      mat2.opacity = 0.15;
      ring2.material = mat2;
      scene.add(ring2);

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      let mx = 0, my = 0;
      const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
      window.addEventListener("pointermove", onMove);
      let raf = 0, visible = true, lastFrame = 0;
      const tick = (t: number) => {
        raf = 0;
        if (!visible || document.hidden || disposed) return;
        if (!reduce && t - lastFrame < 32) { raf = requestAnimationFrame(tick); return; }
        lastFrame = t;
        const s = t / 1000;
        points.rotation.y = s * 0.04;
        ring.rotation.z = s * 0.15;
        ring2.rotation.z = -s * 0.1;
        camera.position.x += (mx * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (-my * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (!reduce) raf = requestAnimationFrame(tick);
      };
      const resume = () => {
        if (!visible || document.hidden) { cancelAnimationFrame(raf); raf = 0; }
        else if (!raf) raf = requestAnimationFrame(tick);
      };
      const observer = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); resume(); });
      observer.observe(host);
      document.addEventListener('visibilitychange', resume);
      resume();
      cleanup = () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        document.removeEventListener('visibilitychange', resume);
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        geo.dispose();
        points.material.dispose();
        ring.geometry.dispose();
        ring.material.dispose();
        mat2.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }).catch(() => { /* The presentation remains usable without WebGL. */ });
    return () => { disposed = true; cleanup(); };
  }, []);
  return <div ref={ref} className="lp-scene" aria-hidden="true" />;
}
