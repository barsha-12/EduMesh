import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function KnowledgeOrb({ avgScore = 50 }) {
  const containerRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const size = 200;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const emissiveIntensity = 0.1 + (avgScore / 100) * 1.9;
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x6366f1,
      emissiveIntensity,
      roughness: 0.3,
      metalness: 0.7,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 1.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xe8a2a2, 0.8, 10);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);

    // Glow ring
    const ringGeometry = new THREE.TorusGeometry(1.3, 0.02, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Animation
    let animationId;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.003;

      sphere.rotation.y = time;
      sphere.rotation.x = Math.sin(time * 0.5) * 0.1;

      // Pulsing glow
      material.emissiveIntensity = emissiveIntensity + Math.sin(time * 3) * 0.15;

      ring.rotation.z = time * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [avgScore]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div ref={containerRef} className="w-[200px] h-[200px]" />
      {showTooltip && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
          Knowledge Level: {avgScore}%
        </div>
      )}
    </div>
  );
}
