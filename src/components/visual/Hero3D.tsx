'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Фотореалистичный хромированный 3D-объект (в духе металлических рендеров
 * platacard.mx): studio-отражения через RoomEnvironment, мягкое вращение,
 * парение и параллакс. Прозрачный фон — светлая страница просвечивает.
 */
export function Hero3D({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = () => mount.clientWidth || 1;
    const height = () => mount.clientHeight || 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width() / height(), 0.1, 100);
    camera.position.set(0, 0, 6.4);

    // Студийное окружение для отражений на хроме.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envTex;

    // Хромированный «узел» — текучий, переливающийся металл (iridescence).
    const geometry = new THREE.TorusKnotGeometry(1.12, 0.4, 280, 44);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#dfe2e8'),
      metalness: 1,
      roughness: 0.14,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 480],
    });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Тёплый акцентный свет (оттенок оранжевого в бликах).
    const warm = new THREE.PointLight(0xff7a3c, 18, 40);
    warm.position.set(4, 2, 4);
    scene.add(warm);
    const cool = new THREE.PointLight(0x88a0ff, 10, 40);
    cool.position.set(-5, -2, 3);
    scene.add(cool);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Параллакс к курсору
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.5;
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
        knot.rotation.y = t * 0.4;
        knot.rotation.x = Math.sin(t * 0.35) * 0.3;
        knot.rotation.z = Math.cos(t * 0.22) * 0.18;
        knot.position.y = Math.sin(t * 0.8) * 0.12;
        // «Перетекание»: мягкое неравномерное дыхание объёма.
        const s = 1 + Math.sin(t * 0.9) * 0.05;
        knot.scale.set(s, 1 + Math.cos(t * 0.7) * 0.05, s);
        material.iridescenceIOR = 1.3 + Math.sin(t * 0.5) * 0.15;
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
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden role="presentation" />;
}
