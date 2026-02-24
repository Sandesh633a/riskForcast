import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/* ── Risk Ring: rotating torus with domain color ── */
function RiskRing({ radius, value, color, speed }) {
    const ref = useRef();
    const thickness = 0.08 + (value / 100) * 0.14;

    useFrame((_, dt) => {
        if (ref.current) {
            ref.current.rotation.x += speed * dt * 0.5;
            ref.current.rotation.y += speed * dt * 0.3;
        }
    });

    return (
        <mesh ref={ref}>
            <torusGeometry args={[radius, thickness, 16, 64, Math.PI * 2 * Math.min(value / 100, 1)]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
                transparent
                opacity={0.75}
                roughness={0.3}
                metalness={0.6}
            />
        </mesh>
    );
}

/* ── Center Sphere: glass-like sphere ── */
function CenterSphere({ risk }) {
    const ref = useRef();
    // Use a neutral sphere color (dark blue/gray) so the text overlay is always readable
    const sphereColor = '#2D3748';

    useFrame((state) => {
        if (ref.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial
                color={sphereColor}
                emissive="#1A202C"
                emissiveIntensity={0.3}
                roughness={0.15}
                metalness={0.8}
                transparent
                opacity={0.92}
            />
        </mesh>
    );
}

/* ── Floating data particles ── */
function DataParticles({ count = 40 }) {
    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 2.0 + Math.random() * 1.2;
            arr[i] = r * Math.sin(phi) * Math.cos(theta);
            arr[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i + 2] = r * Math.cos(phi);
        }
        return arr;
    }, [count]);

    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.06;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#0094CC"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

/* ── Wireframe dodecahedron ── */
function WireframeDodeca() {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.07;
            ref.current.rotation.z = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <mesh ref={ref}>
            <dodecahedronGeometry args={[2.3, 0]} />
            <meshStandardMaterial
                color="#0094CC"
                wireframe
                transparent
                opacity={0.06}
            />
        </mesh>
    );
}

/* ── Orbital dots ── */
function OrbitalDots({ radius = 2.0, count = 6, color = '#00A87A', speed = 0.2 }) {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * speed;
        }
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }, (_, i) => {
                const angle = (i / count) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ── Floating animation wrapper ── */
function FloatingGroup({ children }) {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
        }
    });

    return <group ref={ref}>{children}</group>;
}

/* ── Scene Composition ── */
function Scene({ air, water, urban, finalRisk }) {
    return (
        <>
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} intensity={0.9} color="#ffffff" />
            <pointLight position={[-3, -3, 2]} intensity={0.35} color="#0094CC" />
            <directionalLight position={[0, 3, 5]} intensity={0.4} />

            <FloatingGroup>
                <RiskRing radius={1.6} value={air} color="#00A87A" speed={0.3} />
                <RiskRing radius={1.25} value={water} color="#008B8B" speed={-0.4} />
                <RiskRing radius={0.9} value={urban} color="#2B6CB0" speed={0.5} />
                <CenterSphere risk={finalRisk} />
                <WireframeDodeca />
                <DataParticles count={60} />
                <OrbitalDots radius={1.8} count={8} color="#0094CC" speed={0.15} />
                <OrbitalDots radius={1.45} count={5} color="#00A87A" speed={-0.1} />
            </FloatingGroup>

            {/* Risk text overlay — always white text on the dark sphere */}
            <Html center position={[0, 0, 2]} zIndexRange={[10, 0]}>
                <div style={{
                    textAlign: 'center',
                    pointerEvents: 'none',
                    fontFamily: 'var(--font-display)',
                    width: 120,
                }}>
                    <div style={{
                        fontSize: 40,
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        textShadow: '0 2px 16px rgba(0,0,0,0.5), 0 0 40px rgba(0,148,204,0.3)',
                    }}>
                        {finalRisk.toFixed(1)}
                    </div>
                    <div style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginTop: 4,
                        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    }}>
                        Final Risk
                    </div>
                </div>
            </Html>
        </>
    );
}

export default function RiskRadial3D({ air = 0.5, water = 0.5, urban = 0.5, finalRisk = 0.5 }) {
    return (
        <div style={{ width: 320, height: 320, position: 'relative' }}>
            {/* Decorative outer rings */}
            <svg style={{
                position: 'absolute', inset: -14, width: 'calc(100% + 28px)', height: 'calc(100% + 28px)',
                pointerEvents: 'none', opacity: 0.15,
            }} viewBox="0 0 348 348">
                <circle cx="174" cy="174" r="170" fill="none" stroke="#0094CC" strokeWidth="0.5" strokeDasharray="8 4" />
                <circle cx="174" cy="174" r="160" fill="none" stroke="#00A87A" strokeWidth="0.3" strokeDasharray="4 8" />
                <circle cx="174" cy="174" r="148" fill="none" stroke="#2B6CB0" strokeWidth="0.3" strokeDasharray="2 6" />
            </svg>

            {/* Label: "FINAL RISK" at top */}
            <div style={{
                position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.14em', color: 'var(--text-muted)',
                zIndex: 5, whiteSpace: 'nowrap',
            }}>
                Risk Gauge
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ borderRadius: '50%' }}>
                <Scene air={air} water={water} urban={urban} finalRisk={finalRisk} />
            </Canvas>

            {/* Domain legend */}
            <div style={{
                position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 14, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
                {[
                    { label: 'Air', color: '#00A87A' },
                    { label: 'Water', color: '#008B8B' },
                    { label: 'Urban', color: '#2B6CB0' },
                ].map(d => (
                    <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
