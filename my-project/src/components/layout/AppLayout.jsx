import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

/* ── Animated 3D depth background for the command center ── */
function DepthBackground() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h;

        const resize = () => {
            w = canvas.width = canvas.parentElement.offsetWidth;
            h = canvas.height = canvas.parentElement.offsetHeight;
        };
        resize();

        // Floating orbs — large glowing circles that drift slowly
        const orbs = [
            { x: 0.15, y: 0.85, r: 280, color: [52, 211, 153], speed: 0.0003, phase: 0 },      // emerald bottom-left
            { x: 0.85, y: 0.12, r: 220, color: [96, 165, 250], speed: 0.0004, phase: 1.5 },     // blue top-right
            { x: 0.5, y: 0.5, r: 300, color: [167, 139, 250], speed: 0.00025, phase: 3 },       // purple center
            { x: 0.75, y: 0.7, r: 180, color: [251, 191, 36], speed: 0.00035, phase: 4.5 },     // gold bottom-right
            { x: 0.2, y: 0.3, r: 200, color: [248, 113, 113], speed: 0.0003, phase: 2.2 },      // red top-left
        ];

        // Small floating particles
        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random(), y: Math.random(),
            vx: (Math.random() - 0.5) * 0.0002,
            vy: (Math.random() - 0.5) * 0.0002,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random() * 0.15 + 0.03,
        }));

        let t = 0;
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            t += 1;

            // Draw large ambient orbs
            orbs.forEach(orb => {
                const ox = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.08) * w;
                const oy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.06) * h;
                const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
                gradient.addColorStop(0, `rgba(${orb.color.join(',')}, 0.06)`);
                gradient.addColorStop(0.5, `rgba(${orb.color.join(',')}, 0.02)`);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
            });

            // Draw grid overlay
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
            ctx.lineWidth = 0.5;
            const gridSize = 60;
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Draw small particles
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52, 211, 153, ${p.a})`;
                ctx.fill();
            });

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = (particles[i].x - particles[j].x) * w;
                    const dy = (particles[i].y - particles[j].y) * h;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x * w, particles[i].y * h);
                        ctx.lineTo(particles[j].x * w, particles[j].y * h);
                        ctx.strokeStyle = `rgba(52, 211, 153, ${0.03 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        window.addEventListener('resize', resize);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

export default function AppLayout({ children }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    // Full-screen mode for landing page — no sidebar, no navbar
    const isLanding = location.pathname === '/delhi';

    if (isLanding) {
        return (
            <div className="h-screen w-screen bg-[#08090c] text-[#f0f1f4] overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#08090c] text-[#f0f1f4] overflow-hidden">
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                    {/* 3D animated depth background */}
                    <DepthBackground />
                    <div className="max-w-7xl mx-auto w-full relative z-[1]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
