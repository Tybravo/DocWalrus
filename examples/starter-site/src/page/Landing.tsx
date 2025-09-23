import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Navbar } from '@docwalrus/theme';

const Landing = () => {
  // D3-powered blockchain background
  const BlockchainBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resize();
      window.addEventListener('resize', resize);

      const nodeCount = 48;
      type NodeDatum = d3.SimulationNodeDatum & { id: number; radius: number; fx?: number; fy?: number };
      type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & { source: number | NodeDatum; target: number | NodeDatum };

      const nodes: NodeDatum[] = d3.range(nodeCount).map((i) => ({
        id: i,
        radius: i % 9 === 0 ? 5.5 : Math.random() * 3 + 1.5,
      }));

      const links: LinkDatum[] = d3.range(nodeCount).map(() => ({
        source: Math.floor(Math.random() * nodeCount),
        target: Math.floor(Math.random() * nodeCount),
      }));

      const simulation = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-28))
        .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).distance(60).strength(0.5))
        .force('center', d3.forceCenter(canvas.width / (2 * dpr), canvas.height / (2 * dpr)))
        .force('collision', d3.forceCollide<NodeDatum>().radius((d) => d.radius + 2))
        .alpha(0.9)
        .alphaDecay(0.02);

      const cyan = 'rgba(0, 255, 255, 0.7)';
      const orange = 'rgba(244, 162, 97, 0.8)';

      const draw = () => {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);

        const radial = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.8);
        radial.addColorStop(0, 'rgba(0, 255, 255, 0.04)');
        radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(173, 216, 230, 0.45)';
        links.forEach((l) => {
          const s = l.source as NodeDatum;
          const t = l.target as NodeDatum;
          ctx.beginPath();
          ctx.moveTo(s.x || 0, s.y || 0);
          ctx.lineTo(t.x || 0, t.y || 0);
          ctx.stroke();
        });

        nodes.forEach((n, idx) => {
          const x = n.x || 0;
          const y = n.y || 0;
          const isPulse = idx % 9 === 0;
          const r = n.radius + (isPulse ? Math.sin(Date.now() / 450 + idx) * 0.9 : 0);

          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
          grad.addColorStop(0, cyan);
          grad.addColorStop(1, orange);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      const ticked = () => {
        draw();
      };

      simulation.on('tick', ticked);

      let raf = 0;
      const animate = () => {
        draw();
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', resize);
        simulation.stop();
        cancelAnimationFrame(raf);
      };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
  };

  // Site data for the grid
  const hostedSites = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        img: '/placeholder.png',
        suiNs: `dev${(i + 1).toString().padStart(2, '0')}.sui`,
        date: '2025-09-23',
        version: `v${(1 + (i % 3))}.0.${i % 5}`,
        contributors: 2 + (i % 7),
      })),
    []
  );

  // Sui tools data
  const suiTools = [
    { img: '/deepbook.png', title: 'DeepBook', desc: 'High-throughput DEX on Sui.', link: 'https://deepbook.tech' },
    { img: '/seal.png', title: 'Seal', desc: 'Data protection in Walrus.', link: 'https://walrus.xyz/seal' },
    { img: '/walrus.png', title: 'Walrus', desc: 'Decentralized storage.', link: 'https://walrus.xyz' },
  ];

  return (
    <div className="min-h-screen text-white bg-deep-space relative overflow-hidden">
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 pt-5">
          <div className="glass-nav rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-400/20 border border-cyan-300/40 shadow-[0_0_18px_rgba(0,255,255,0.35)]" />
              <span className="font-semibold tracking-wide">Docwalrus</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <a href="/docs" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Documentation</a>
              <a href="/blog" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Blog</a>
              <a href="/pricing" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Pricing</a>
              <a href="/explore" className="text-faint hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Explore</a>
            </nav>
            <div className="flex items-center space-x-3">
              <a href="/get-started" className="btn-secondary-glass rounded-xl px-4 py-2 text-sm">Get Started</a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <BlockchainBackground />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 flex justify-center">
          <div className="max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight"
            >
              Build Documentation That Lives Forever On-Chain
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-lg md:text-xl text-faint"
            >
              Docwalrus lets you host, secure, and scale your docs on decentralized Walrus storage.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <a
                href="/get-started"
                className="btn-primary-glow rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Get Started
              </a>
              <a
                href="/docs"
                className="btn-secondary-glass rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Explore Docs
              </a>
            </motion.div>

            <div className="mt-10 w-full max-w-2xl glass rounded-2xl p-4 mx-auto">
              <div className="text-xs text-faint">
                Fully transparent, permanent, and verifiable documentation — powered by Sui + Walrus.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-soft mx-4 md:mx-auto md:max-w-7xl" />

      <section className="relative py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Sites Hosted on Walrus</h2>
            <a href="/explore" className="text-sm text-faint hover:text-white">Explore all</a>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {hostedSites.map((site, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -6 }}
                className="glass-card-orange rounded-2xl overflow-hidden hover-glow-cyan-orange transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={site.img}
                    alt={site.suiNs}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A2F]/80 to-transparent" />
                </div>
                <div className="p-4 text-[#0A1A2F]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{site.suiNs}</h3>
                    <span className="text-xs opacity-80">{site.version}</span>
                  </div>
                  <div className="mt-2 text-xs opacity-80">
                    Hosted: {site.date} • Contributors: {site.contributors}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sui Tools Showcase */}
      <section className="py-16 bg-[#0A1A2F]/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Explore Sui Ecosystem Tools</h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto"
          >
            {suiTools.map((tool, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -6 }}
                className="w-full sm:w-64 glass rounded-lg hover-glow-cyan-orange transition-all duration-300 p-6 text-center"
              >
                <img src={tool.img} alt={tool.title} className="h-24 w-auto mx-auto mb-4 rounded" />
                <h3 className="font-semibold text-cyan-300 text-lg">{tool.title}</h3>
                <p className="text-sm text-faint mt-2">{tool.desc}</p>
                <a href={tool.link} target="_blank" rel="noopener noreferrer" className="btn-secondary-glass rounded-xl px-4 py-2 text-sm mt-4 inline-block">Learn More</a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10 bg-[#0A1A2F]/60 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-center gap-6">
            <div className="font-semibold text-lg">Docwalrus</div>
            <div className="flex items-center gap-6">
              <a href="https://x.com/docwalrus" target="_blank" rel="noopener noreferrer" className="text-faint hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://discord.gg/docwalrus" target="_blank" rel="noopener noreferrer" className="text-faint hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.369a1.913 1.913 0 00-1.55-.385c-1.338.49-2.49 1.2-3.378 1.963-.962.82-1.81 1.72-2.52 2.652a9.442 9.442 0 00-.864-1.03c-.28-.31-.58-.61-.89-.89a.18.18 0 00-.06-.05c-.02-.02-.04-.03-.06-.05a1.88 1.88 0 00-1.03-.44 1.82 1.82 0 00-1.02.44c-.31.28-.61.58-.89.89a9.5 9.5 0 00-.86 1.03c-.71-.93-1.56-1.83-2.52-2.65C5.027 6.289 3.873 5.58 2.536 5.09a1.913 1.913 0 00-1.55.385 1.93 1.93 0 00-.6 1.55c.02.43.12.84.29 1.23.17.4.4.79.68 1.18.28.4.6.8.92 1.2.32.4.62.8.92 1.2.3.4.58.8.84 1.18.26.4.5.79.72 1.18.22.4.42.8.6 1.2.18.4.32.8.44 1.2.12.4.2.8.24 1.2s.02.8-.02 1.2a1.93 1.93 0 00.6 1.55c.43.43 1.02.6 1.55.6.43 0 .84-.12 1.23-.29.4-.17.79-.4 1.18-.68.4-.28.8-.6 1.2-.92.4-.32.8-.62 1.2-.92.4-.3.8-.58 1.18-.84.4-.26.79-.5 1.18-.72.4-.22.8-.42 1.2-.6.4-.18.8-.32 1.2-.44.4-.12.8-.2 1.2-.24.4-.04.8-.02 1.2.02a1.93 1.93 0 001.55-.6c.43-.43.6-1.02.6-1.55s-.12-.84-.29-1.23a14.5 14.5 0 00-2.4-4.64c-.3-.4-.6-.8-.92-1.2s-.62-.8-.92-1.2a10.8 10.8 0 00-.84-1.18c-.26-.4-.5-.79-.72-1.18a8.7 8.7 0 00-.6-1.2c-.18-.4-.32-.8-.44-1.2a1.93 1.93 0 00-.24-1.2zM8.4 13.4c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm7.2 0c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-xs text-faint">
            © 2025 Docwalrus. All rights reserved. Built on Sui & Walrus.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
