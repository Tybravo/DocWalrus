import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from '../components/WalletModal';
import { Link } from 'react-router-dom';
const LinkAny = Link as unknown as React.ComponentType<any>;
import Header from '../components/Header';
import Footer from '../components/Footer';

function Installation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get current account from dApp Kit
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // WebGL Shader Background
  const WebGLBackground: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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

      // Create shader function
      const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      // Create program
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      // Set up geometry
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

      // Resize function
      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };

      resize();
      window.addEventListener('resize', resize);

      // Animation loop
      let animationId: number;
      const animate = (time: number) => {
        gl.useProgram(program);
        
        // Clear and set up
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Set uniforms
        if (timeLocation !== null) {
          gl.uniform1f(timeLocation, time * 0.001);
        }
        if (resolutionLocation !== null) {
          gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        }

        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
        if (program) gl.deleteProgram(program);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
      };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
  };

  // Custom code block component with cyan glow and copy button
  const CodeBlock = ({ children }: { children: React.ReactNode }) => {
    const [copied, setCopied] = useState(false);
    const text =
      typeof children === 'string'
        ? children.trim()
        : Array.isArray(children)
        ? children.join('').trim()
        : (children as any)?.props?.children?.toString()?.trim?.() ?? '';

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (e) {
        console.error('Failed to copy', e);
      }
    };

    return (
      <div className="relative code-block rounded-lg border border-cyan-400/40 bg-black/30 shadow-[0_0_14px_rgba(0,255,255,0.28)] hover:shadow-[0_0_20px_rgba(0,255,255,0.38)] transition-shadow my-3">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 transition-colors"
          aria-label="Copy code"
          title={copied ? 'Copied!' : 'Copy'}
        >
          {copied ? (
            // Check icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            // Clipboard icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a2 2 0 00-2 2v1h2V4h6v1h2V4a2 2 0 00-2-2H6z" />
              <path d="M4 7a2 2 0 012-2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
            </svg>
          )}
        </button>
        <pre className="m-0 p-4 overflow-x-auto">
          <code className="text-white whitespace-pre">{text}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white bg-deep-space relative overflow-hidden">
      {/* Wallet Modal */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Use Header component */}
      <Header />

      {/* Add padding to prevent content from hiding under the fixed header */}
      <div className="pt-0"></div>
      
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <WebGLBackground />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-8 pb-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight"
              style={{ color: 'rgb(244, 162, 97)' }}
            >
              DocWalrus Installation Guide
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-lg md:text-xl text-faint"
            >
              Everything you need to build and deploy your documentation on Docwalrus
            </motion.p>
          </div>

          {/* Installation Guide Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glass rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Introduction</h2>
              <p>
                Welcome to DocWalrus, a decentralized documentation platform built on the SUI blockchain. 
                This guide will walk you through the process of installing and setting up your own 
                documentation or blog site using DocWalrus.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Prerequisites</h2>
              <p>Before you begin, ensure you have the following:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Node.js</strong>: Version 16.x or higher</li>
                <li><strong>Package Manager</strong>: npm, yarn, or pnpm (pnpm 10.x+ recommended)</li>
                <li><strong>SUI Wallet</strong>: A SUI blockchain wallet (Sui Wallet, Suiet, Ethos, etc.)</li>
                <li><strong>SUI Tokens</strong>: Some SUI tokens for deployment transactions (only needed for testnet/mainnet deployment)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 1: Connect Your SUI Wallet</h2>
              <p>
                DocWalrus requires a connected SUI wallet for deployment and certain features. 
                You must connect your wallet before creating a site.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Connect Your Wallet on DocWalrus Platform</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Visit <a href="https://docwalrus.com/get-started" className="text-cyan-300 hover:text-cyan-200 underline">https://docwalrus.com/get-started</a></li>
                <li>Click the "Connect Wallet" button in the top-right corner</li>
                <li>Select your preferred wallet provider (Sui Wallet, Suiet, Ethos, etc.)</li>
                <li>Approve the connection request in your wallet</li>
                <li>Select your preferred network (testnet or mainnet)</li>
              </ol>
              
              <div className="bg-cyan-900/30 border-l-4 border-cyan-400 p-4 my-6 rounded">
                <p className="text-sm">
                  <strong>Important</strong>: This connection process automatically creates a wallet configuration file at 
                  <code className="bg-black/30 px-2 py-1 rounded mx-1">~/.docwalrus/wallet.json</code> 
                  that the CLI will use to verify your wallet connection.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 2: Install the DocWalrus CLI</h2>
              <p>Install the DocWalrus CLI globally using your preferred package manager:</p>
              
              <p className="mt-4 mb-2">With npm:</p>
              <CodeBlock>npm install -g @docwalrus/cli</CodeBlock>
              
              <p className="mt-4 mb-2">Or with yarn:</p>
              <CodeBlock>yarn global add @docwalrus/cli</CodeBlock>
              
              <p className="mt-4 mb-2">Or with pnpm:</p>
              <CodeBlock>pnpm add -g @docwalrus/cli</CodeBlock>
              
              <p className="mt-4 mb-2">Verify the installation:</p>
              <CodeBlock>docwalrus --version</CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 3: Create a New DocWalrus Site</h2>
              <p>Create a new DocWalrus site using the CLI:</p>
              
              <CodeBlock>docwalrus create my-docs</CodeBlock>
              
              <div className="bg-cyan-900/30 border-l-4 border-cyan-400 p-4 my-6 rounded">
                <p className="text-sm">
                  <strong>Note</strong>: The CLI will automatically verify your wallet connection before creating the site. 
                  If your wallet is not connected, you'll be prompted to connect it first by visiting the DocWalrus platform.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Available Templates</h3>
              <p>DocWalrus offers three installation templates to suit different needs:</p>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong>Standard Template</strong> (Default): Complete documentation site with all features
                  <CodeBlock>docwalrus create my-docs --template standard</CodeBlock>
                </li>
                <li>
                  <strong>Minimal Template</strong>: Lightweight version with essential features only
                  <CodeBlock>docwalrus create my-docs --template minimal</CodeBlock>
                </li>
                <li>
                  <strong>Blog Template</strong>: Optimized for blog-style documentation
                  <CodeBlock>docwalrus create my-docs --template blog</CodeBlock>
                </li>
              </ol>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 4: Navigate to Your Project</h2>
              <p>Once the site is created, navigate to your project directory:</p>
              
              <CodeBlock>cd my-docs</CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 5: Install Dependencies</h2>
              <p>Install the project dependencies:</p>
              
              <p className="mt-4 mb-2">With npm:</p>
              <CodeBlock>npm install</CodeBlock>
              
              <p className="mt-4 mb-2">Or with yarn:</p>
              <CodeBlock>yarn</CodeBlock>
              
              <p className="mt-4 mb-2">Or with pnpm:</p>
              <CodeBlock>pnpm install</CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Available Commands</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><code className="bg-black/30 px-2 py-1 rounded">npm run dev</code>: Start the development server</li>
                <li><code className="bg-black/30 px-2 py-1 rounded">npm run build</code>: Build the site for production</li>
                <li><code className="bg-black/30 px-2 py-1 rounded">npm run preview</code>: Preview the production build locally</li>
                <li><code className="bg-black/30 px-2 py-1 rounded">npm run deploy</code>: Deploy the site to SUI blockchain storage (requires wallet connection)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Wallet Connection Verification</h2>
              <p>DocWalrus uses a "Single Source of Truth" approach for wallet connections:</p>
              
              <ol className="list-decimal pl-6 space-y-2">
                <li>When you connect your wallet on the DocWalrus platform, it creates a configuration file at <code className="bg-black/30 px-2 py-1 rounded">~/.docwalrus/wallet.json</code></li>
                <li>The CLI checks this file to verify your wallet connection before creating sites or deploying content</li>
                <li>If you disconnect your wallet on the platform, it will also remove this file, ensuring consistency across interfaces</li>
              </ol>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Build or Installation Errors</h2>
              <p>If you encounter build errors:</p>
              
              <ol className="list-decimal pl-6 space-y-2">
                <li>Ensure all dependencies are installed: <code className="bg-black/30 px-2 py-1 rounded">npm install</code></li>
                <li>Check for TypeScript errors: <code className="bg-black/30 px-2 py-1 rounded">npm run tsc</code></li>
                <li>Verify your Node.js version is compatible (16.x or higher)</li>
                <li>Clear your node_modules and reinstall: <code className="bg-black/30 px-2 py-1 rounded">rm -rf node_modules && npm install</code></li>
              </ol>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Footer component */}
      {/* <Footer /> */}
    </div>
  );
};

export default Installation;