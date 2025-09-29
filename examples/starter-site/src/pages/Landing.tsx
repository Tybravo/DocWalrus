import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@docwalrus/theme';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LinkAny = Link as unknown as React.ComponentType<any>;

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDocMenuOpen, setIsDocMenuOpen] = useState(false);
  
  // Close doc menu when clicking outside
  const docMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (docMenuRef.current && !docMenuRef.current.contains(event.target as Node)) {
        setIsDocMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // WebGL Shader Background
  const WebGLBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Fix: Explicitly cast to WebGLRenderingContext
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        console.warn('WebGL not supported, falling back to canvas');
        return;
      }

      const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        
        // Noise function
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        // Fractal noise
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          st.x *= u_resolution.x / u_resolution.y;
          
          // Create flowing patterns
          vec2 pos = st * 3.0;
          pos.x += u_time * 0.1;
          pos.y += sin(u_time * 0.2) * 0.1;
          
          // Generate noise-based patterns
          float n1 = fbm(pos + u_time * 0.05);
          float n2 = fbm(pos * 2.0 - u_time * 0.03);
          float n3 = fbm(pos * 4.0 + u_time * 0.02);
          
          // Create flowing energy lines
          float lines = sin(pos.x * 10.0 + u_time) * sin(pos.y * 8.0 + u_time * 0.7);
          lines = smoothstep(0.0, 0.1, abs(lines));
          
          // Combine patterns
          float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          pattern += lines * 0.3;
          
          // Create radial gradient
          vec2 center = vec2(0.5, 0.4);
          float dist = distance(st, center);
          float radial = 1.0 - smoothstep(0.0, 0.8, dist);
          
          // Color mixing - cyan to orange gradient
          vec3 cyan = vec3(0.0, 1.0, 1.0);
          vec3 orange = vec3(0.956, 0.635, 0.380); // rgba(244, 162, 97)
          vec3 deep_blue = vec3(0.039, 0.102, 0.184); // Deep space background
          
          // Mix colors based on pattern and position
          vec3 color = mix(deep_blue, cyan, pattern * radial * 0.3);
          color = mix(color, orange, (pattern + lines) * radial * 0.2);
          
          // Add some sparkle effects
          float sparkle = noise(st * 50.0 + u_time * 2.0);
          sparkle = smoothstep(0.98, 1.0, sparkle);
          color += sparkle * 0.5;
          
          // Final alpha for transparency
          float alpha = (pattern * radial + sparkle) * 0.6;
          
          gl_FragColor = vec4(color, alpha);
        }
      `;

      const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        
        return shader;
      };

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) return;
      
      const program = gl.createProgram();
      if (!program) return;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return;
      }
      
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
      const positions = [
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      
      const handleResize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();
      
      let startTime = Date.now();
      let animationFrameId: number;
      
      const render = () => {
        const currentTime = (Date.now() - startTime) / 1000;
        
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        gl.uniform1f(timeUniformLocation, currentTime);
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        animationFrameId = requestAnimationFrame(render);
      };
      
      render();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (program) gl.deleteProgram(program);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
      };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
  };



  // Custom SVG icons for SUI tools with DocWalrus orange color
  const DeepBookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(244, 162, 97)" strokeWidth="1.5" className="w-20 h-20 mx-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18m18-18v18" />
    </svg>
  );

  const SealIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(244, 162, 97)" strokeWidth="1.5" className="w-20 h-20 mx-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m0 0l-3-3m3 3l3-3" />
      <circle cx="12" cy="8" r="1" fill="rgb(244, 162, 97)" />
    </svg>
  );

  const WalrusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(244, 162, 97)" strokeWidth="1.5" className="w-20 h-20 mx-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5" />
      <circle cx="12" cy="18" r="1" fill="rgb(244, 162, 97)" />
    </svg>
  );

  // Real websites hosted on Walrus with actual data
  const hostedSites = [
    {
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      suiNs: 'docs.suiwallet.com',
      date: '2024-01-15',
      version: 'v2.1.0',
      contributors: 8,
      url: 'https://docs.suiwallet.com'
    },
    {
      img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
      suiNs: 'api.movestudio.xyz',
      date: '2024-02-20',
      version: 'v1.3.2',
      contributors: 5,
      url: 'https://api.movestudio.xyz'
    },
    {
      img: 'https://images.unsplash.com/photo-1463194537334-3940784aa69a?w=400&h=300&fit=crop',
      suiNs: 'support.cetus.zone',
      date: '2024-06-18',
      version: 'v4.2.1',
      contributors: 15,
      url: 'https://support.cetus.zone'
    },
    {
      img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      suiNs: 'learn.aftermath.finance',
      date: '2024-07-22',
      version: 'v3.7.0',
      contributors: 7,
      url: 'https://learn.aftermath.finance'
    },
    {
      img: 'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=400&h=300&fit=crop',
      suiNs: 'docs.turbos.finance',
      date: '2024-05-10',
      version: 'v2.5.3',
      contributors: 12,
      url: 'https://docs.turbos.finance'
    },
    {
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      suiNs: 'help.suiswap.app',
      date: '2024-03-05',
      version: 'v1.8.4',
      contributors: 9,
      url: 'https://help.suiswap.app'
    }
  ];

  // Sui tools data with custom SVG icons
  const suiTools = [
    { 
      title: 'DeepBook', 
      desc: 'High-throughput DEX on Sui.', 
      link: 'https://deepbook.tech',
      icon: <DeepBookIcon />
    },
    { 
      title: 'Seal', 
      desc: 'Data protection in Walrus.', 
      link: 'https://walrus.xyz/seal',
      icon: <SealIcon />
    },
    { 
      title: 'Walrus', 
      desc: 'Decentralized storage.', 
      link: 'https://walrus.xyz',
      icon: <WalrusIcon />
    },
  ];

  return (
    <div className="min-h-screen text-white bg-deep-space relative overflow-hidden">
      {/* Use Header component */}
      <Header />
      
      {/* Add padding to prevent content from hiding under the fixed header */}
      <div className="pt-12"></div>
      
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <WebGLBackground />
        </div>

        {/* Add ParticlesJS on top of WebGL background with higher z-index */}
        <div className="absolute inset-0 -z-5">
          <ParticlesBackground />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-4 pb-24 flex justify-center">
          <div className="max-w-3xl text-center">
            {/* Reduced Hero Title Font Size */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-6xl font-extrabold leading-tigh"
              style={{ color: 'rgb(244, 162, 97)' }}
            >
              Build Blog And Documentation That Lives Forever On-Chain
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
                href="#"
                className="btn-secondary-glass rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Explore Docs
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hosted Sites Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-cyan-300">Sites Hosted on Docwalrus</h2>
          <p className="mt-4 text-faint max-w-2xl mx-auto">
            Discover amazing documentation and blogs powered by our decentralized platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {hostedSites.map((site, index) => (
            <motion.div
              key={site.suiNs}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="glass rounded-lg hover-glow-cyan-orange transition-all duration-300 p-6"
            >
              <div className="flex items-center justify-center h-48 w-full rounded-lg bg-cyan-400/20 border border-cyan-300/40 mx-auto mb-4 overflow-hidden">
                <img src={site.img} alt={site.suiNs} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-center text-cyan-300">{site.suiNs}</h3>
              <p className="text-sm text-faint text-center mt-2">
                Version {site.version} • {site.contributors} Contributors
              </p>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-glass rounded-xl px-4 py-2 text-sm mt-4 block text-center"
              >
                Visit Site
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Sui Tools Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-cyan-300">Sui Ecosystem Tools</h2>
          <p className="mt-4 text-faint max-w-2xl mx-auto">
            Essential tools and services that work seamlessly with Docwalrus
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {suiTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="w-full sm:flex-1 glass rounded-lg hover-glow-cyan-orange transition-all duration-300 p-4 md:p-6 text-center"
            >
              {/* Custom SVG Icon */}
              {tool.icon}
              <h3 className="font-semibold text-cyan-300 text-base md:text-lg">{tool.title}</h3>
              <p className="text-xs md:text-sm text-faint mt-2">{tool.desc}</p>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-glass rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm mt-3 md:mt-4 inline-block"
              >
                Learn More
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Use Footer component */}
      {/* <Footer /> */}
    </div>
  );
};

export default Landing;


// ParticlesJS Component
const ParticlesBackground: React.FC = () => {
  useEffect(() => {
    // TypeScript now recognizes particlesJS on window
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        "particles": {
          "number": {
            "value": 80,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": { "value": "#00FFFF" }, // Cyan color for molecules
          "shape": {
            "type": "circle",
            "stroke": { "width": 0, "color": "#000000" },
            "polygon": { "nb_sides": 5 }
          },
          "opacity": {
            "value": 0.5,
            "random": false,
            "anim": { "enable": false }
          },
          "size": {
            "value": 4, // Smaller size for molecule effect
            "random": true,
            "anim": { "enable": false }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#00FFFF", // Cyan color for lines
            "opacity": 0.5,
            "width": 2 
          },
          "move": {
            "enable": true,
            "speed": 3,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": { "enable": true, "mode": "repulse" },
            "onclick": { "enable": true, "mode": "push" },
            "resize": true
          },
          "modes": {
            "repulse": { "distance": 100, "duration": 0.4 },
            "push": { "particles_nb": 4 }
          }
        },
        "retina_detect": true
      });
    }
    
    return () => {
      // Clean up particles when component unmounts
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom.forEach((dom) => dom.pJS.fn.vendors.destroypJS());
        window.pJSDom = [];
      }
    };
  }, []);
  
  return <div id="particles-js" className="absolute inset-0 z-0"></div>;
};
