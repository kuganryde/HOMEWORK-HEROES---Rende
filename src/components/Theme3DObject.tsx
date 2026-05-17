import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Wireframe, PresentationControls, Environment, Trail } from '@react-three/drei';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// Cached Geometries & Materials
const geoSphere = new THREE.SphereGeometry(1, 32, 32);
const geoTorus = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
const geoPoints = new THREE.SphereGeometry(2, 32, 32);
const geoIcosahedron = new THREE.IcosahedronGeometry(1.2, 0);
const geoBox1 = new THREE.BoxGeometry(1.5, 0.2, 2);
const geoBox2 = new THREE.BoxGeometry(1.4, 0.18, 1.9);
const geoCylinder = new THREE.CylinderGeometry(0.02, 0.05, 1, 8);
const geoBallTorus = new THREE.TorusGeometry(0.81, 0.02, 16, 100);

const matBlue = new THREE.MeshStandardMaterial({ color: "#3b82f6", emissive: "#3b82f6", emissiveIntensity: 0.5 });
const matYellow = new THREE.MeshStandardMaterial({ color: "#facc15", emissive: "#facc15", emissiveIntensity: 0.5 });
const matOrbit = new THREE.MeshBasicMaterial({ color: "#94a3b8", transparent: true, opacity: 0.3 });
const matRed = new THREE.MeshStandardMaterial({ color: "#ef4444" });
const matGreen = new THREE.MeshStandardMaterial({ color: "#10b981" });
const matOrange = new THREE.MeshStandardMaterial({ color: "#f59e0b" });
const matPointsYellow = new THREE.PointsMaterial({ color: "#facc15", size: 0.05, sizeAttenuation: true, depthWrite: false, transparent: true });
const matMathHover = new THREE.MeshStandardMaterial({ color: "#3b82f6", transparent: true, opacity: 0.8, wireframe: true });
const matMath = new THREE.MeshStandardMaterial({ color: "#8b5cf6", transparent: true, opacity: 0.8 });
const matBronze = new THREE.MeshStandardMaterial({ color: "#b45309", metalness: 0.6, roughness: 0.4 });
const matPointsSilver = new THREE.PointsMaterial({ color: "#d4d4d8", size: 0.03, sizeAttenuation: true, depthWrite: false, transparent: true, opacity: 0.6 });
const matBookCover = new THREE.MeshStandardMaterial({ color: "#4f46e5" });
const matBookPages = new THREE.MeshStandardMaterial({ color: "#f8fafc" });
const matPen = new THREE.MeshStandardMaterial({ color: "#facc15", metalness: 0.8, roughness: 0.2 });
const matBall = new THREE.MeshStandardMaterial({ color: "#ea580c", roughness: 0.4, metalness: 0.1 });
const matBlack = new THREE.MeshBasicMaterial({ color: "#000000" });

const Atom = () => {
  const [active, setActive] = useState(false);
  const e1 = useRef<THREE.Mesh>(null), e2 = useRef<THREE.Mesh>(null), e3 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3;
    if (e1.current) e1.current.position.set(Math.sin(t) * 1.5, Math.cos(t) * 1.5, 0);
    if (e2.current) e2.current.position.set(Math.sin(t + Math.PI) * 1.5, 0, Math.cos(t + Math.PI) * 1.5);
    if (e3.current) e3.current.position.set(0, Math.sin(t + Math.PI / 2) * 1.5, Math.cos(t + Math.PI / 2) * 1.5);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group onClick={() => setActive(!active)}>
        <mesh geometry={geoSphere} material={active ? matYellow : matBlue} scale={0.4} />
        <mesh geometry={geoTorus} material={matOrbit} rotation={[0, 0, Math.PI / 4]} />
        <mesh geometry={geoTorus} material={matOrbit} rotation={[Math.PI / 4, 0, 0]} />
        <mesh geometry={geoTorus} material={matOrbit} rotation={[0, Math.PI / 4, 0]} />
        <mesh ref={e1} geometry={geoSphere} material={matRed} scale={0.1} />
        <mesh ref={e2} geometry={geoSphere} material={matGreen} scale={0.1} />
        <mesh ref={e3} geometry={geoSphere} material={matOrange} scale={0.1} />
        {active && <points geometry={geoPoints} material={matPointsYellow} />}
      </group>
    </Float>
  );
};

const MathShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <PresentationControls global rotation={[0, 0, 0]} polar={[-Math.PI / 2, Math.PI / 2]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1}>
        <mesh ref={meshRef} geometry={geoIcosahedron} material={hovered ? matMathHover : matMath} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
          <Wireframe stroke="#ffffff" thickness={0.02} />
        </mesh>
      </Float>
    </PresentationControls>
  );
};

const HistoryGlobe = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.2; });
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} geometry={geoSphere} material={matBronze} scale={1.2} />
      <points geometry={geoPoints} material={matPointsSilver} scale={1.25} />
    </Float>
  );
};

const EnglishBook = () => {
  const penRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (penRef.current) {
      const t = clock.getElapsedTime();
      penRef.current.position.set(Math.sin(t * 2) * 0.5, Math.cos(t * 4) * 0.2 + 0.5, Math.cos(t * 2) * 0.5);
      penRef.current.rotation.z = Math.sin(t * 4) * 0.2 - Math.PI / 4;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[0, -0.5, 0]} rotation={[0.2, -0.2, 0]}>
          <mesh geometry={geoBox1} material={matBookCover} />
          <mesh geometry={geoBox2} material={matBookPages} position={[0.05, 0, 0]} />
        </group>
      </Float>
      <Trail width={0.2} color="#facc15" length={20} decay={1} local={false}>
        <mesh ref={penRef} geometry={geoCylinder} material={matPen} position={[0, 0.5, 0]} />
      </Trail>
    </group>
  );
};

const BouncingBall = () => {
  const [ref, api] = useSphere(() => ({ mass: 1, position: [0, 2, 0], args: [0.8] }));
  return (
    <mesh ref={ref as any} geometry={geoSphere} material={matBall} scale={0.8} onClick={() => {
      api.velocity.set(0, 5, 0);
      api.angularVelocity.set(Math.random() * 5, Math.random() * 5, Math.random() * 5);
    }}>
      <mesh geometry={geoBallTorus} material={matBlack} />
      <mesh geometry={geoBallTorus} material={matBlack} rotation={[Math.PI / 2, 0, 0]} />
    </mesh>
  );
};

const Floor = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -1.5, 0] }));
  return <mesh ref={ref as any} visible={false} />;
};

const SportsBall = () => (
  <group>
    <Environment preset="studio" />
    <Physics gravity={[0, -9.8, 0]}>
      <BouncingBall />
      <Floor />
    </Physics>
  </group>
);

const SceneContent = React.memo(({ theme }: { theme: string }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      {theme === 'science' && <Atom />}
      {theme === 'math' && <MathShape />}
      {theme === 'history' && <HistoryGlobe />}
      {theme === 'english' && <EnglishBook />}
      {theme === 'sports' && <SportsBall />}
    </>
  );
});

export const Theme3DObject = ({ theme }: { theme: string }) => (
  <div className="w-32 h-32 absolute -top-8 -right-8 pointer-events-auto z-0">
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
      <React.Suspense fallback={<mesh><boxGeometry /><meshBasicMaterial color="white" wireframe /></mesh>}>
        <SceneContent theme={theme} />
      </React.Suspense>
    </Canvas>
  </div>
);
