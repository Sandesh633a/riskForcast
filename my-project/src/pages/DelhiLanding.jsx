import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LuMapPin, LuShield, LuBuilding, LuUsers, LuTreePine, LuDroplets, LuWind, LuChevronDown, LuArrowRight, LuBrainCircuit, LuTarget, LuTriangleAlert, LuChartBar, LuActivity, LuRadar, LuGlobe, LuZap } from 'react-icons/lu';


import indiaGate from "/images/GateWayOfIndia.jpeg";
import chandni from "/images/ChandniChowk.jpeg";
import skyline from "/images/DelhiSkyLine.jpeg";
import tpmap from "/images/tpmap.jpg";
import yamuna from "/images/yamuna.jpg";
import qutubMinar from "/images/qutubMinar.jpg";
import lotusTemple from "/images/lotusTemple.jpg";
import redFort from "/images/redFort.jpeg";
import connaught from "/images/connaughtPlace.jpg";
import platformArchitecture from "/images/platformArchitecture.jpg";
import smog from "/images/smog.jpg";
import yamunaPollution from "/images/yamunaPollution.jpg";
import delhiMetro from "/images/delhiMetro.jpg";
import lodhiGarden from "/images/lodhiGarden.jpg";
import smartCity from "/images/smartCity.jpg";




/* ══════════════════════════════════════════
   PARTICLE CANVAS — neural network background
   ══════════════════════════════════════════ */
function ParticleCanvas() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight * 3;
        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 2 + 0.5, a: Math.random() * 0.25 + 0.05,
        }));
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 220, 150, ${p.a})`; ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(80, 180, 130, ${0.05 * (1 - dist / 130)})`; ctx.lineWidth = 0.6; ctx.stroke();
                    }
                }
            }
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight * 3; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ── Scroll-reveal hook ── */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
        obs.observe(el); return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

/* ── 3D Tilt Card ── */
function TiltCard({ children, className = '', intensity = 8 }) {
    const cardRef = useRef(null);
    const handleMove = useCallback((e) => {
        const c = cardRef.current; if (!c) return;
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02,1.02,1.02)`;
    }, [intensity]);
    const handleLeave = useCallback(() => { if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)'; }, []);
    return <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`transition-transform duration-300 ease-out ${className}`} style={{ transformStyle: 'preserve-3d' }}>{children}</div>;
}

/* ── Section with reveal ── */
function Section({ children, className = '', id }) {
    const [ref, vis] = useReveal();
    return <section ref={ref} id={id} className={`transition-all duration-[1000ms] ease-out ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14'} ${className}`}>{children}</section>;
}

/* ── Image Slot ── */
// function ImageSlot({ caption, aspect = '16/9', className = '' }) {
//     return (
//         <TiltCard className={className}>
//             <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] group" style={{ aspectRatio: aspect }}>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#4a4f5c] group-hover:text-[#6a7080] transition-all duration-500">
//                     <svg className="w-10 h-10 opacity-25 group-hover:opacity-40 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
//                     <span className="text-[11px] font-semibold tracking-wider uppercase">{caption}</span>
//                 </div>
//                 <div className="absolute inset-0 border border-white/[0.02] rounded-2xl pointer-events-none"></div>
//             </div>
//         </TiltCard>
//     );
// }

function ImageSlot({ caption, image, aspect = '16/9', className = '' }) {
    return (
        <TiltCard className={className}>
            <div 
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] group"
                style={{ aspectRatio: aspect }}
            >
                {/* Background Image */}
                {image && (
                    <img
                        src={image}
                        alt={caption}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Caption */}
                <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-sm font-semibold tracking-wide uppercase">
                        {caption}
                    </span>
                </div>

                {/* Border effect */}
                <div className="absolute inset-0 border border-white/[0.05] rounded-2xl pointer-events-none"></div>
            </div>
        </TiltCard>
    );
}




/* ── Issue Card with glow ── */
function IssueCard({ icon: Icon, title, desc, color }) {
    return (
        <TiltCard>
            <div className="group p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] hover:border-white/[0.12] transition-all duration-500 h-full relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ backgroundColor: color + '20' }}></div>
                <div className="relative flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', border: `1px solid ${color}30`, boxShadow: `0 0 25px ${color}15` }}>
                        <Icon size={20} style={{ color }} />
                    </div>
                    <h4 className="text-[15px] font-bold text-white">{title}</h4>
                </div>
                <p className="relative text-[13px] text-[#8a8f9d] leading-relaxed">{desc}</p>
            </div>
        </TiltCard>
    );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN LANDING                                               */
/* ═══════════════════════════════════════════════════════════ */
export default function DelhiLanding() {
    const videoRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY || document.documentElement.scrollTop);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#08090c]">
            <ParticleCanvas />

            {/* ══════════════ HERO — 100vh ══════════════ */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Video — more visible now */}
                <video ref={videoRef} autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'brightness(0.45) saturate(1.1) contrast(1.15)', transform: `scale(1.08) translateY(${scrollY * 0.12}px)` }}>
                    <source src="/videos/delhi-hero.mp4" type="video/mp4" />
                </video>

                {/* Lighter overlays — video shows through */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#08090c]/60 via-transparent to-[#08090c]/90"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_40%,#08090c_100%)]"></div>

                {/* Scan-line texture for cinematic feel */}
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>

                {/* ── Floating live badges (left side) ── */}
                <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10" style={{ opacity: Math.max(0, 1 - scrollY / 500) }}>
                    {[
                        { icon: LuRadar, label: 'AI Active', value: 'LIVE', color: '#34d399' },
                        { icon: LuActivity, label: 'Zones', value: '10', color: '#60a5fa' },
                        { icon: LuZap, label: 'Models', value: '9', color: '#fbbf24' },
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 group"
                            style={{ animationDelay: `${i * 200}ms`, animation: 'floatY 5s ease-in-out infinite' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: b.color + '15', boxShadow: `0 0 15px ${b.color}20` }}>
                                <b.icon size={16} style={{ color: b.color }} />
                            </div>
                            <div>
                                <div className="text-[10px] text-[#6a7080] uppercase tracking-wider font-semibold">{b.label}</div>
                                <div className="text-sm font-black text-white font-mono">{b.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Floating metrics (right side) ── */}
                <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10" style={{ opacity: Math.max(0, 1 - scrollY / 500) }}>
                    {[
                        { label: 'Confidence', value: '97%', color: '#34d399' },
                        { label: 'Avg Risk', value: '20.4', color: '#f87171' },
                        { label: 'Forecast', value: 'D+7', color: '#a78bfa' },
                    ].map((m, i) => (
                        <div key={i} className="text-right px-4 py-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500"
                            style={{ animationDelay: `${i * 300 + 100}ms`, animation: 'floatY 6s ease-in-out infinite' }}>
                            <div className="text-[10px] text-[#6a7080] uppercase tracking-wider font-semibold">{m.label}</div>
                            <div className="text-lg font-black font-mono" style={{ color: m.color }}>{m.value}</div>
                        </div>
                    ))}
                </div>

                {/* ── Center content ── */}
                <div className="relative z-10 text-center px-8 max-w-5xl mx-auto" style={{ transform: `translateY(${-scrollY * 0.25}px)`, opacity: Math.max(0, 1 - scrollY / 700) }}>
                    <div className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full border border-[#34d399]/20 bg-[#34d399]/[0.06] backdrop-blur-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_12px_#34d399]"></span>
                        <span className="text-[11px] font-bold text-[#34d399] uppercase tracking-[0.25em]">Urban Risk Intelligence Platform</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] mb-6">
                        <span className="block text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">Protecting</span>
                        <span className="block landing-text-gradient drop-shadow-[0_0_60px_rgba(52,211,153,0.2)]">Delhi's Future</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#8a8f9d] max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                        AI-powered environmental risk forecasting for India's capital — predicting air, water, and urban threats across <span className="text-[#34d399] font-semibold">10 critical zones</span> before they become crises.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
                        <Link to="/overview"
                            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#34d399] hover:bg-[#2ec48a] text-[#08090c] font-black text-sm tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:shadow-[0_0_50px_rgba(52,211,153,0.4)] hover:-translate-y-0.5">
                            Enter Command Center <LuArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#discover"
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl text-[#c0c4cf] hover:text-white hover:border-white/[0.25] hover:bg-white/[0.06] font-semibold text-sm tracking-wide transition-all duration-300">
                            Discover Delhi <LuChevronDown size={18} />
                        </a>
                    </div>

                    {/* ── Quick stats bar ── */}
                    <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/[0.06]">
                        {[
                            { label: 'Zones Monitored', val: '10', color: '#60a5fa' },
                            { label: 'ML Models', val: '9', color: '#a78bfa' },
                            { label: 'Forecast Range', val: 'D+7', color: '#fbbf24' },
                            { label: 'AI Confidence', val: '97%', color: '#34d399' },
                        ].map((s, i) => (
                            <div key={i} className="text-center px-2">
                                <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.val}</div>
                                <div className="text-[9px] text-[#6a7080] uppercase tracking-wider font-semibold">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 landing-bounce z-10" style={{ opacity: Math.max(0, 1 - scrollY / 200) }}>
                    <div className="w-6 h-10 rounded-full border-2 border-white/[0.15] flex items-start justify-center p-1.5">
                        <div className="w-1.5 h-3 rounded-full bg-[#34d399] animate-scroll-dot"></div>
                    </div>
                    <span className="text-[10px] text-[#6a7080] uppercase tracking-[0.3em] font-semibold">Scroll</span>
                </div>
            </section>

            {/* ══════════════ DELHI AT A GLANCE ══════════════ */}
            <Section id="discover" className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block text-[10px] font-black text-[#34d399] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#34d399]/20 bg-[#34d399]/[0.06]">The Capital</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">Delhi at a Glance</h2>
                    <p className="text-[#8a8f9d] max-w-2xl mx-auto text-[15px] leading-relaxed">
                        The National Capital Territory — a living mega-city of contradictions: ancient heritage alongside modern chaos, 20 million people navigating some of the world's most polluted air.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-16">
                    {[
                        { value: '20M+', label: 'Population', icon: LuUsers, color: '#60a5fa' },
                        { value: '1,484', label: 'Sq Km Area', icon: LuMapPin, color: '#34d399' },
                        { value: '11', label: 'Districts', icon: LuBuilding, color: '#a78bfa' },
                        { value: '3,000+', label: 'Years of History', icon: LuShield, color: '#fbbf24' },
                        { value: '#1', label: 'Most Polluted Capital', icon: LuWind, color: '#f87171' },
                    ].map((s, i) => (
                        <TiltCard key={i}>
                            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-[#111318] to-[#0a0c10] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 group relative overflow-hidden">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-transparent to-transparent" style={{ background: `radial-gradient(circle at 50% 100%, ${s.color}08, transparent 70%)` }}></div>
                                <s.icon size={24} className="transition-colors duration-500" style={{ color: s.color }} />
                                <span className="text-2xl font-black text-white font-mono tracking-tight relative">{s.value}</span>
                                <span className="text-[10px] text-[#6a7080] text-center uppercase tracking-[0.2em] font-bold relative">{s.label}</span>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ImageSlot caption="India Gate at dawn" aspect="4/3" />
                    <ImageSlot caption="Chandni Chowk street life" aspect="4/3" />
                    <ImageSlot caption="Modern Delhi skyline" aspect="4/3" />
                </div> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    <ImageSlot 
        caption="India Gate at dawn" 
        aspect="4/3"
        image={indiaGate}
    />
    <ImageSlot 
        caption="Chandni Chowk street life" 
        aspect="4/3"
        image={chandni}
    />
    <ImageSlot 
        caption="Modern Delhi skyline" 
        aspect="4/3"
        image={skyline}
    />
</div>
            </Section>

            {/* ══════════════ GEOGRAPHY & POLITICS ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <span className="inline-block text-[10px] font-black text-[#60a5fa] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/[0.06]">Geographical Context</span>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">The Geography of Risk</h2>
                        <div className="space-y-4 text-[15px] text-[#8a8f9d] leading-relaxed">
                            <p>Delhi sits on the Indo-Gangetic plain along the banks of the <span className="text-[#60a5fa] font-semibold">Yamuna River</span>. Its geography creates unique vulnerabilities: landlocked air traps pollutants during <span className="text-[#f87171] font-semibold">winter inversions</span>, the Yamuna's declining water quality threatens millions, and monsoon flooding disrupts low-lying areas.</p>
                            <p>The terrain ranges from the <span className="text-[#34d399] font-semibold">Aravalli Ridge</span> in the south — Delhi's last green lung — to the dense urban sprawl of East Delhi. Each zone experiences dramatically different risk profiles based on industrial density and proximity to water bodies.</p>
                            <p>Delhi operates as a <span className="text-[#a78bfa] font-semibold">Union Territory</span> with a unique dual-governance structure, making data-driven decision support systems critically important.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <ImageSlot caption="Delhi topographic map" image={tpmap} aspect="16/10" />
                        <ImageSlot caption="Yamuna River through Delhi" image={yamuna} aspect="16/10" />
                    </div>
                </div>
            </Section>

            {/* ══════════════ HISTORY TIMELINE ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block text-[10px] font-black text-[#fbbf24] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/[0.06]">Past → Present</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">3,000 Years of Delhi</h2>
                    <p className="text-[#8a8f9d] max-w-2xl mx-auto text-[15px] leading-relaxed">From the Mahabharata's Indraprastha to modern New Delhi — built, destroyed, and rebuilt seven times.</p>
                </div>

                <div className="relative ml-6 pl-10 border-l-2 border-white/[0.06] flex flex-col gap-12 mb-16">
                    {[
                        { era: 'Ancient', year: '~1000 BCE', text: 'Indraprastha, the legendary capital of the Pandavas. Archaeological evidence at Purana Qila confirms continuous settlement for over 3,000 years.', color: '#34d399' },
                        { era: 'Medieval', year: '1206–1526', text: 'The Delhi Sultanate — Qutub Minar, Tughlaqabad Fort, Hauz Khas. Five dynasties established Delhi as the power center of the subcontinent.', color: '#fbbf24' },
                        { era: 'Mughal', year: '1526–1857', text: "Shah Jahan's Shahjahanabad with the Red Fort and Jama Masjid. The Mughals created the dense urban fabric of Chandni Chowk.", color: '#f87171' },
                        { era: 'Colonial', year: '1911–1947', text: "Lutyens' New Delhi — wide boulevards contrasting sharply with Old Delhi's organic lanes. The imperial capital was designed to project power.", color: '#60a5fa' },
                        { era: 'Modern', year: '1947–Now', text: 'Population exploded from 1.4M to 20M+. Rapid urbanization created the environmental crises — air, water, heat, floods — we combat today.', color: '#a78bfa' },
                    ].map((item, i) => {
                        const [ref, vis] = useReveal();
                        return (
                            <div key={i} ref={ref} className={`relative transition-all duration-700 ${vis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: `${i * 120}ms` }}>
                                <div className="absolute -left-[calc(2.5rem+7px)] w-3.5 h-3.5 rounded-full border-2 bg-[#08090c]" style={{ borderColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}></div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg" style={{ color: item.color, backgroundColor: item.color + '12', border: `1px solid ${item.color}25` }}>{item.era}</span>
                                    <span className="text-xs text-[#6a7080] font-mono font-bold">{item.year}</span>
                                </div>
                                <p className="text-[14px] text-[#8a8f9d] leading-relaxed">{item.text}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <ImageSlot caption="Red Fort" image={redFort} aspect="1/1" />
                    <ImageSlot caption="Qutub Minar" image={qutubMinar} aspect="1/1" />
                    <ImageSlot caption="Lotus Temple" image={lotusTemple} aspect="1/1" />
                    <ImageSlot caption="Connaught Place" image={connaught} aspect="1/1" />
                </div>
            </Section>

            {/* ══════════════ CURRENT CHALLENGES ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block text-[10px] font-black text-[#f87171] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#f87171]/20 bg-[#f87171]/[0.06]">Critical Issues</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">Why Delhi Needs This</h2>
                    <p className="text-[#8a8f9d] max-w-2xl mx-auto text-[15px] leading-relaxed">A convergence of environmental crises measured in hospital admissions, school closures, and lives lost.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    <IssueCard icon={LuWind} title="Air Quality Crisis" color="#f87171" desc="AQI regularly crosses 400+ in winter. PM2.5 exceeds WHO limits by 15-20x. Every Delhiite loses ~11.9 years of life expectancy." />
                    <IssueCard icon={LuDroplets} title="Water Stress" color="#60a5fa" desc="The Yamuna leaves Delhi biologically dead. 28% of water supply lost to leakage. Groundwater drops 1-2m per year." />
                    <IssueCard icon={LuBuilding} title="Unplanned Urbanization" color="#fbbf24" desc="1,700+ unauthorized colonies. Industrial zones mix with residential. Construction dust = 30% of particulate pollution." />
                    <IssueCard icon={LuTreePine} title="Vanishing Green Cover" color="#34d399" desc="Green cover declined from 26% to under 20% in a decade. The Aravalli Ridge faces continuous encroachment." />
                    <IssueCard icon={LuTriangleAlert} title="Flood Vulnerability" color="#f87171" desc="200,000+ in flood-prone Yamuna zones. 2023 floods submerged parts of the city for the first time in 45 years." />
                    <IssueCard icon={LuUsers} title="Social Vulnerability" color="#a78bfa" desc="30% live in slums with minimal disaster preparedness. Environmental risks are borne disproportionately by the poor." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ImageSlot caption="Delhi smog covering the city" image={smog} aspect="16/9" />
                    <ImageSlot caption="Yamuna river pollution" image={yamunaPollution} aspect="16/9" />
                </div>
            </Section>

            {/* ══════════════ DELHI'S STRENGTHS ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block text-[10px] font-black text-[#34d399] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#34d399]/20 bg-[#34d399]/[0.06]">Positive Momentum</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">Delhi's Strengths</h2>
                    <p className="text-[#8a8f9d] max-w-2xl mx-auto text-[15px] leading-relaxed">A city of remarkable resilience, innovation, and cultural richness.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {[
                        { title: "World's Largest Metro Network", desc: '6M passengers daily, 3.9 lakh tonnes CO2 reduced annually. Phase IV adds 65km.', color: '#34d399' },
                        { title: 'Electric Vehicle Revolution', desc: 'Highest EV adoption in India. 25% electric target by 2030.', color: '#60a5fa' },
                        { title: 'Real-Time Air Monitoring', desc: '100+ CPCB stations provide continuous data. Enables AI-driven forecasting.', color: '#fbbf24' },
                        { title: 'Heritage Conservation', desc: 'UNESCO sites, 174 ASI-protected monuments, active restoration programs.', color: '#a78bfa' },
                    ].map((item, i) => (
                        <TiltCard key={i}>
                            <div className="p-7 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111318] to-[#0d0f13] hover:border-white/[0.12] transition-all duration-500 h-full relative overflow-hidden group">
                                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ backgroundColor: item.color + '15' }}></div>
                                <div className="w-1 h-8 rounded-full mb-4" style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}40` }}></div>
                                <h4 className="text-[15px] font-bold text-white mb-3 relative">{item.title}</h4>
                                <p className="text-[13px] text-[#8a8f9d] leading-relaxed relative">{item.desc}</p>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ImageSlot caption="Delhi Metro" image={delhiMetro} aspect="4/3" />
                    <ImageSlot caption="Lodhi Garden greenery" image={lodhiGarden} aspect="4/3" />
                    <ImageSlot caption="Smart city initiatives" image={smartCity} aspect="4/3" />
                </div>
            </Section>

            {/* ══════════════ ABOUT PROJECT ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="inline-block text-[10px] font-black text-[#a78bfa] uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full border border-[#a78bfa]/20 bg-[#a78bfa]/[0.06]">About This Project</span>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Urban Risk Intelligence</h2>
                        <p className="text-[15px] text-[#8a8f9d] leading-relaxed mb-6">ML models trained on real environmental data predict risk scores across <span className="text-[#34d399] font-semibold">10 zones</span>, combining three dimensions:</p>

                        <div className="flex flex-col gap-3 mb-8">
                            {[
                                { label: 'Air Risk (40%)', desc: 'PM2.5, PM10, NO₂, humidity, wind speed, rainfall', color: '#f87171' },
                                { label: 'Water Risk (30%)', desc: 'Water quality index, reservoir levels, drainage', color: '#60a5fa' },
                                { label: 'Urban Risk (30%)', desc: 'Violations, industrial density, green cover, population', color: '#fbbf24' },
                            ].map((item, i) => (
                                <TiltCard key={i}>
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#111318] to-[#0d0f13] border border-white/[0.06]">
                                        <div className="w-1.5 h-12 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 14px ${item.color}50` }}></div>
                                        <div>
                                            <span className="text-[14px] font-bold text-white">{item.label}</span>
                                            <p className="text-[12px] text-[#6a7080] mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                        <p className="text-[15px] text-[#8a8f9d] leading-relaxed">Predictions for <span className="text-[#fbbf24] font-semibold">D+1</span>, <span className="text-[#fbbf24] font-semibold">D+3</span>, and <span className="text-[#fbbf24] font-semibold">D+7</span> horizons enable both crisis response and policy planning.</p>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-5">
                            {[
                                { icon: LuBrainCircuit, val: '9', label: 'ML Models', color: '#a78bfa' },
                                { icon: LuTarget, val: '10', label: 'City Zones', color: '#34d399' },
                                { icon: LuChartBar, val: '3', label: 'Horizons', color: '#fbbf24' },
                                { icon: LuShield, val: '97%', label: 'Confidence', color: '#60a5fa' },
                            ].map((s, i) => (
                                <TiltCard key={i}>
                                    <div className="p-7 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#111318] to-[#0a0c10] text-center group hover:border-white/[0.15] transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 50%, ${s.color}08, transparent 70%)` }}></div>
                                        <s.icon size={28} className="mx-auto mb-3 relative transition-colors duration-500" style={{ color: s.color }} />
                                        <div className="text-2xl font-black text-white font-mono relative">{s.val}</div>
                                        <div className="text-[10px] text-[#6a7080] uppercase tracking-[0.2em] mt-1 font-bold relative">{s.label}</div>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                        <ImageSlot caption="Platform architecture" image={platformArchitecture} aspect="16/10" />
                    </div>
                </div>
            </Section>

            {/* ══════════════ CTA ══════════════ */}
            <Section className="relative py-28 px-6 md:px-16 max-w-4xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] p-14 md:p-20 text-center">
                    <div className="absolute inset-0 landing-gradient-animate"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,#08090c_75%)]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">Ready to Explore?</h2>
                        <p className="text-[15px] text-[#8a8f9d] max-w-lg mx-auto mb-10 leading-relaxed">Real-time predictions, interactive heatmaps, AI simulations — discover what the data reveals.</p>
                        <Link to="/overview"
                            className="group inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-[#34d399] hover:bg-[#2ec48a] text-[#08090c] font-black tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:shadow-[0_0_60px_rgba(52,211,153,0.4)] hover:-translate-y-1 text-base">
                            Launch Platform <LuArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </Section>

            <div className="h-16"></div>
        </div>
    );
}
