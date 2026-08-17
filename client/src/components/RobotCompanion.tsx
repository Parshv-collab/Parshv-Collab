import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export default function RobotCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = motionPreference.matches;
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.35, 7.2);
    camera.lookAt(0, 0.35, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const robot = new THREE.Group();
    robot.position.set(0, -0.35, 0);
    scene.add(robot);

    const obsidian = new THREE.MeshStandardMaterial({ color: 0x0d1410, metalness: 0.68, roughness: 0.3 });
    const edge = new THREE.MeshStandardMaterial({ color: 0x34463a, metalness: 0.72, roughness: 0.24 });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xd9ffd2, emissive: 0x39ff14, emissiveIntensity: 2.8, metalness: 0.1, roughness: 0.12 });
    const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x1e8b28, emissive: 0x39ff14, emissiveIntensity: 1.6, metalness: 0.42, roughness: 0.26 });

    const body = new THREE.Group();
    const bodyMesh = new THREE.Mesh(new RoundedBoxGeometry(1.65, 1.35, 1.3, 6, 0.18), obsidian);
    bodyMesh.castShadow = true; bodyMesh.receiveShadow = true; body.add(bodyMesh);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32), coreMaterial);
    core.rotation.set(Math.PI / 2, 0, Math.PI / 4); core.position.set(0, 0.02, 0.69); body.add(core);
    body.position.y = -0.45; robot.add(body);

    const head = new THREE.Group();
    head.position.y = 0.95;
    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.18, 1.32, 6, 0.2), obsidian);
    headMesh.castShadow = true; headMesh.receiveShadow = true; head.add(headMesh);
    const faceplate = new THREE.Mesh(new RoundedBoxGeometry(1.42, 0.78, 0.08, 5, 0.11), new THREE.MeshStandardMaterial({ color: 0x090a10, metalness: 0.5, roughness: 0.24 }));
    faceplate.position.set(0, -0.02, 0.68); head.add(faceplate);
    const eyeGeometry = new THREE.SphereGeometry(0.14, 24, 16);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial); leftEye.position.set(-0.3, 0.02, 0.76); head.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial); rightEye.position.set(0.3, 0.02, 0.76); head.add(rightEye);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 24), edge); neck.position.y = -0.72; neck.castShadow = true; head.add(neck);
    robot.add(head);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.8, 64), new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -1.2; ground.scale.set(1, 0.48, 1); scene.add(ground);

    scene.add(new THREE.HemisphereLight(0x88aa8f, 0x050507, 1.05));
    const key = new THREE.DirectionalLight(0xd5efd4, 2.8); key.position.set(3, 5, 5); key.castShadow = true; scene.add(key);
    const purple = new THREE.PointLight(0x39ff14, 4.5, 5); purple.position.set(0, -1, 1.8); scene.add(purple);

    const target = new THREE.Vector2();
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => { reducedMotion.current = event.matches; if (event.matches) { target.set(0, 0); head.rotation.set(0, 0, 0); } };
    motionPreference.addEventListener?.("change", onMotionPreferenceChange);
    const onPointerMove = (event: PointerEvent) => { if (reducedMotion.current) return; target.x = (event.clientX / window.innerWidth - 0.5) * 0.9; target.y = (event.clientY / window.innerHeight - 0.5) * -0.55; };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => { const width = canvas.clientWidth || 280; const height = canvas.clientHeight || 360; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    let frame = 0;
    const render = () => { frame = requestAnimationFrame(render); if (!reducedMotion.current) { head.rotation.y += (target.x - head.rotation.y) * 0.08; head.rotation.x += (target.y - head.rotation.x) * 0.08; } else { head.rotation.set(0, 0, 0); } renderer.render(scene, camera); };
    render();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("resize", resize); motionPreference.removeEventListener?.("change", onMotionPreferenceChange); renderer.dispose(); scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach(material => material.dispose()); else object.material.dispose(); } }); };
  }, []);

  return <div aria-label="Interactive 3D robot" className="three-robot"><canvas ref={canvasRef} /></div>;
}
