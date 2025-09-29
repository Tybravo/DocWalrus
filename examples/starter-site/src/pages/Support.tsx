import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from '../components/WalletModal';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LinkAny = Link as unknown as React.ComponentType<any>;

const Support = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [network, setNetwork] = useState('mainnet');
  const navigate = useNavigate();
  
  // Updated wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // WebGL Background component (same as in Configuration.tsx)
  const WebGLBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const gl = canvas.getContext('webgl');
      if (!gl) return;
      
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
        
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
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
          
          vec2 pos = st * 3.0;
          pos.x += u_time * 0.1;
          pos.y += sin(u_time * 0.2) * 0.1;
          
          float n1 = fbm(pos + u_time * 0.05);
          float n2 = fbm(pos * 2.0 - u_time * 0.03);
          float n3 = fbm(pos * 4.0 + u_time * 0.02);
          
          float lines = sin(st.y * 50.0 + u_time) * 0.1;
          
          float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          pattern += lines * 0.3;
          
          vec2 center = vec2(0.5, 0.4);
          float dist = distance(st, center);
          float radial = 1.0 - smoothstep(0.0, 0.8, dist);
          
          vec3 cyan = vec3(0.0, 1.0, 1.0);
          vec3 orange = vec3(0.956, 0.635, 0.380);
          vec3 deep_blue = vec3(0.039, 0.102, 0.184);
          
          vec3 color = mix(deep_blue, cyan, pattern * radial * 0.3);
          color = mix(color, orange, (pattern + lines) * radial * 0.2);
          
          float sparkle = noise(st * 50.0 + u_time * 2.0);
          sparkle = smoothstep(0.98, 1.0, sparkle);
          color += sparkle * 0.5;
          
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

  // Custom code block component with cyan glow and copy button
  const CodeBlock = ({ children }: { children: React.ReactNode }) => {
    const [copied, setCopied] = useState(false);
    const text = typeof children === 'string'
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>
        <pre className="p-4 overflow-x-auto">
          <code>{text}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white">
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Replace inline header with Header component */}
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
              DocWalrus Support
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-lg md:text-xl text-faint"
            >
              Get help and resources for your DocWalrus documentation site
            </motion.p>
          </div>

          {/* Support Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glass rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Community Support</h2>
              <p>
                The DocWalrus community is here to help you succeed with your documentation or blog site. 
                Connect with other developers and get assistance through our official channels:
              </p>
              
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>
                  <strong className="text-orange-300">Discord Community</strong>: Join our active Discord server for real-time help, discussions, and announcements.
                  <div className="mt-2">
                    <a href="https://discord.gg/docwalrus" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/30 transition-colors">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.317 4.369a1.913 1.913 0 00-1.55-.385c-1.338.49-2.49 1.2-3.378 1.963-.962.82-1.81 1.72-2.52 2.652a9.442 9.442 0 00-.864-1.03c-.28-.31-.58-.61-.89-.89a.18.18 0 00-.06-.05c-.02-.02-.04-.03-.06-.05a1.88 1.88 0 00-1.03-.44 1.82 1.82 0 00-1.02.44c-.31.28-.61.58-.89.89a9.5 9.5 0 00-.86 1.03c-.71-.93-1.56-1.83-2.52-2.65C5.027 6.289 3.873 5.58 2.536 5.09a1.913 1.913 0 00-1.55.385 1.93 1.93 0 00-.6 1.55c.02.43.12.84.29 1.23.17.4.4.79.68 1.18.28.4.6.8.92 1.2.32.4.62.8.92 1.2.3.4.58.8.84 1.18.26.4.50.79.72 1.18.22.4.42.8.6 1.2.18.4.32.8.44 1.2.12.4.20.8.24 1.2s.02.8-.02 1.2a1.93 1.93 0 00.6 1.55c.43.43 1.02.6 1.55.6.43 0 .84-.12 1.23-.29.4-.17.79-.4 1.18-.68.4-.28.8-.6 1.2-.92.4-.32.8-.62 1.2-.92.4-.3.8-.58 1.18-.84.4-.26.79-.5 1.18-.72.4-.22.8-.42 1.2-.6.4-.18.8-.32 1.2-.44.4-.12.8-.2 1.2-.24.4-.04.8-.02 1.2.02a1.93 1.93 0 001.55-.6c.43-.43.6-1.02.6-1.55s-.12-.84-.29-1.23a14.5 14.5 0 00-2.4-4.64c-.3-.4-.6-.8-.92-1.2s-.62-.8-.92-1.2a10.8 10.8 0 00-.84-1.18c-.26-.4-.5-.79-.72-1.18a8.7 8.7 0 00-.6-1.2c-.18-.4-.32-.8-.44-1.2a1.93 1.93 0 00-.24-1.2zM8.4 13.4c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm7.2 0c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
                      </svg>
                      Join Discord Community
                    </a>
                  </div>
                </li>
                <li>
                  <strong className="text-orange-300">GitHub Discussions</strong>: Browse and participate in technical discussions, feature requests, and bug reports.
                  <div className="mt-2">
                    <a href="https://github.com/docwalrus/docwalrus/discussions" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/30 transition-colors">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub Discussions
                    </a>
                  </div>
                </li>
                <li>
                  <strong className="text-orange-300">X (Twitter)</strong>: Follow us for announcements, tips, and community highlights.
                  <div className="mt-2">
                    <a href="https://x.com/docwalrus" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg hover:bg-cyan-500/30 transition-colors">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Follow on X
                    </a>
                  </div>
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-cyan-300">Troubleshooting Guides</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Installation Issues</h3>
              <p>If you're experiencing problems with installation:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you have Node.js version 16.x or higher installed</li>
                <li>Check your npm cache with <code className="bg-black/30 px-2 py-1 rounded">npm cache verify</code></li>
                <li>Try installing with the force flag: <code className="bg-black/30 px-2 py-1 rounded">npm install -g @docwalrus/cli --force</code></li>
                <li>For Windows users, run your terminal as Administrator</li>
                <li>Check for conflicting global packages with <code className="bg-black/30 px-2 py-1 rounded">npm list -g --depth=0</code></li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Wallet Connection Issues</h3>
              <p>If you're having trouble connecting your wallet:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure your SUI wallet extension is up to date</li>
                <li>Try clearing your browser cache and cookies</li>
                <li>Check if your wallet has the correct network selected (testnet/mainnet)</li>
                <li>Verify the wallet configuration file exists at <code className="bg-black/30 px-2 py-1 rounded">~/.docwalrus/wallet.json</code></li>
                <li>Try reconnecting your wallet through the DocWalrus interface</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Deployment Failures</h3>
              <p>Common deployment issues and solutions:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you have sufficient SUI tokens for gas fees</li>
                <li>Verify you have WAL tokens for storage payments</li>
                <li>Check your build output for errors before deploying</li>
                <li>Try increasing the gas budget with <code className="bg-black/30 px-2 py-1 rounded">--gas-budget 20000000</code></li>
                <li>Verify network connectivity and try again if the network is congested</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-cyan-300">Documentation Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-black/20 border border-cyan-400/20 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-shadow">
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">Getting Started Guide</h3>
                  <p className="text-sm text-faint mb-4">Complete walkthrough for new users to set up their first DocWalrus site.</p>
                  <a href="/get-started" className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center">
                    View Guide
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                
                <div className="bg-black/20 border border-cyan-400/20 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-shadow">
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">API Reference</h3>
                  <p className="text-sm text-faint mb-4">Detailed documentation of all DocWalrus APIs and configuration options.</p>
                  <a href="/docs/api" className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center">
                    View API Docs
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                
                <div className="bg-black/20 border border-cyan-400/20 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-shadow">
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">Theme Customization</h3>
                  <p className="text-sm text-faint mb-4">Learn how to customize the look and feel of your DocWalrus site.</p>
                  <a href="/docs/themes" className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center">
                    View Theming Guide
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                
                <div className="bg-black/20 border border-cyan-400/20 rounded-xl p-6 hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-shadow">
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">Plugin Development</h3>
                  <p className="text-sm text-faint mb-4">Create custom plugins to extend DocWalrus functionality.</p>
                  <a href="/docs/plugins" className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center">
                    View Plugin Guide
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-cyan-300">FAQ</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">How do I update DocWalrus to the latest version?</h3>
                  <p>To update the DocWalrus CLI to the latest version, run:</p>
                  <CodeBlock>npm update -g @docwalrus/cli</CodeBlock>
                  <p className="mt-2">For project dependencies, navigate to your project directory and run:</p>
                  <CodeBlock>npm update</CodeBlock>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">Can I use DocWalrus with my existing documentation?</h3>
                  <p>
                    Yes! DocWalrus supports importing existing documentation in various formats, including Markdown, MDX, HTML, and more.
                    Use the import command to bring in your existing content:
                  </p>
                  <CodeBlock>docwalrus import --source ./my-existing-docs --format markdown</CodeBlock>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">How do I add search functionality to my site?</h3>
                  <p>
                    DocWalrus includes built-in search capabilities. Enable it in your configuration file:
                  </p>
                  <CodeBlock>
{`// docwalrus.config.js
module.exports = {
  // ... other config
  search: {
    enabled: true,
    indexFullContent: true,
    placeholder: "Search documentation..."
  }
}`}
                  </CodeBlock>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">How much does it cost to deploy on Walrus?</h3>
                  <p>
                    Deploying to Walrus requires WAL tokens for storage costs. The exact amount depends on your site size.
                    For most documentation sites (under 50MB), you'll need approximately 10-20 WAL tokens.
                    You can check current rates on the <a href="https://walrus.site/pricing" className="text-cyan-300 hover:underline">Walrus pricing page</a>.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-cyan-300">Contact Support</h2>
              <p>
                Need personalized help? Our support team is ready to assist you with any issues or questions.
              </p>
              
              <div className="mt-6 bg-black/20 border border-cyan-400/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-300 mb-4">Support Channels</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-300 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-faint">For technical issues and account questions</p>
                      <a href="mailto:support@docwalrus.com" className="text-cyan-300 hover:text-cyan-200 text-sm">support@docwalrus.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-300 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-faint">Available Monday-Friday, 9am-5pm UTC</p>
                      <a href="https://docwalrus.com/chat" className="text-cyan-300 hover:text-cyan-200 text-sm">Start Chat Session</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-cyan-300 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Feature Requests</h4>
                      <p className="text-sm text-faint">Suggest new features or improvements</p>
                      <a href="https://github.com/docwalrus/docwalrus/issues/new?template=feature_request.md" className="text-cyan-300 hover:text-cyan-200 text-sm">Submit Feature Request</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Support;