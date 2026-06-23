'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Реальная 3D-сцена (WebGL/Three.js): фасеточный «кристалл» — метафора актива.
 * Медленное вращение + парение + параллакс от курсора, неоновые цветные источники
 * света на тёмном фоне. Полная очистка ресурсов, уважение к prefers-reduced-motion.
 */
export function Hero3D({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = () => mount.clientWidth;
    const height = () => mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    mount.appendChild(renderer.domElement);

    // Геометрия — икосаэдр (фасеточный кристалл)
    const geometry = new THREE.IcosahedronGeometry(1.7, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0b0d1f'),
      metalness: 0.9,
      roughness: 0.18,
      flatShading: true,
      emissive: new THREE.Color('#1a1140'),
      emissiveIntensity: 0.4,
    });
    const crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Неоновая проволочная обводка поверх
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: new THREE.Color('#7C5CFF'), transparent: true, opacity: 0.25 }),
    );
    crystal.add(wire);

    // Освещение — неоновая палитра бренда
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const lights: THREE.PointLight[] = [
      new THREE.PointLight(0x7c5cff, 80, 30), // violet
      new THREE.PointLight(0x3dd6f5, 70, 30), // cyan
      new THREE.PointLight(0xff4d8d, 55, 30), // magenta
    ];
    lights[0].position.set(5, 3, 5);
    lights[1].position.set(-6, -2, 4);
    lights[2].position.set(0, 5, -4);
    lights.forEach((l) => scene.add(l));

    // Частицы-искры вокруг
    const starCount = 220;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 4 + Math.random() * 5;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      starPos[i * 3 + 2] = r * Math.cos(p);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0x9db0ff, size: 0.03, transparent: true, opacity: 0.7 }),
    );
    scene.add(stars);

    // Параллакс от курсора
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.6;
    };
    window.addEventListener('pointermove', onMove);

    const onResize = () => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      if (!reduce) {
        crystal.rotation.y = t * 0.25;
        crystal.rotation.x = Math.sin(t * 0.3) * 0.2;
        crystal.position.y = Math.sin(t * 0.8) * 0.12;
        stars.rotation.y = t * 0.04;
      }
      camera.position.x += (target.x - camera.position.x) * 0.05;
      camera.position.y += (-target.y - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden role="presentation" />;
}
