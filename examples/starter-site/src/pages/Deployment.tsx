import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from '../components/WalletModal';
import { Link } from 'react-router-dom';

// Add imports for Header and Footer
import Header from '../components/Header';
import Footer from '../components/Footer';

const LinkAny = Link as unknown as React.ComponentType<any>;

const Deployment = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [network, setNetwork] = useState('mainnet');
  const navigate = useNavigate();
  
  // Updated wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // WebGL Background component
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
              DocWalrus Deployment Guide
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-lg md:text-xl text-faint"
            >
              Deploy your DocWalrus documentation or blog sites on Walrus
            </motion.p>
          </div>

          {/* Deployment Guide Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="prose prose-invert max-w-3xl mx-auto"
          >
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Prerequisites</h2>
              <p>Before deploying your DocWalrus site to Walrus, ensure you have:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Node.js</strong>: Version 16.x or higher</li>
                <li><strong>Package Manager</strong>: npm, yarn, or pnpm</li>
                <li><strong>SUI Wallet</strong>: A connected SUI wallet with your private key</li>
                <li><strong>SUI Tokens</strong>: Some SUI tokens for deployment transactions (only needed for testnet/mainnet deployment)</li>
                <li><strong>WAL Tokens</strong>: Required for storage payments on the Walrus network</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 1: Connect Your Wallet</h2>
              <p>DocWalrus requires a connected SUI wallet for deployment and certain features.</p>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Connect via DocWalrus Platform</strong>:
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Click the "Connect Wallet" button in the top navigation</li>
                    <li>Select your preferred wallet provider (Sui Wallet, Ethos, etc.)</li>
                    <li>Follow the prompts to connect your wallet</li>
                    <li>This creates a configuration file at <code className="bg-black/30 px-2 py-1 rounded">~/.docwalrus/wallet.json</code></li>
                  </ul>
                </li>
                <li>
                  <strong>Verify Connection</strong>:
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Your wallet address should appear in the top navigation</li>
                    <li>The CLI will use this connection for deployment operations</li>
                  </ul>
                </li>
              </ol>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 2: Install Required Tools</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">DocWalrus CLI</h3>
              <p>Install the DocWalrus CLI globally:</p>
              
              <CodeBlock>npm install -g @docwalrus/cli</CodeBlock>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Walrus CLI (Optional)</h3>
              <p>For advanced Walrus storage operations:</p>
              
              <CodeBlock>npm install -g @walrus-labs/cli</CodeBlock>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Walrus Site Builder (Windows)</h3>
              <p>For Windows users, install the Walrus Site Builder:</p>
              
              <CodeBlock>npm install -g @walrus-labs/site-builder</CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 3: Create and Configure Your Site</h2>
              <p>If you haven't already created a DocWalrus site:</p>
              
              <CodeBlock>docwalrus create my-docs</CodeBlock>
              
              <p>Navigate to your project directory:</p>
              
              <CodeBlock>cd my-docs</CodeBlock>
              
              <p>Install dependencies:</p>
              
              <CodeBlock>npm install</CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 4: Development and Build</h2>
              <p>Start the development server to preview your site:</p>
              
              <CodeBlock>npm run dev</CodeBlock>
              
              <p>Build your site for production:</p>
              
              <CodeBlock>npm run build</CodeBlock>
              
              <p>This creates a <code className="bg-black/30 px-2 py-1 rounded">build</code> directory with optimized files ready for deployment.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 5: Deploy to Walrus Storage</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Option 1: Using DocWalrus CLI (Recommended)</h3>
              <p>The simplest way to deploy is using the built-in deploy command:</p>
              
              <CodeBlock>npm run deploy</CodeBlock>
              
              <p>This command will:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Check for a connected wallet</li>
                <li>Build your site if needed</li>
                <li>Upload files to Walrus storage</li>
                <li>Deploy site metadata to the SUI blockchain</li>
                <li>Provide you with a deployment URL</li>
              </ol>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Option 2: Manual Deployment (Advanced)</h3>
              <p>For more control, you can use the Walrus Site Builder directly:</p>
              
              <p>For Mac/Linux:</p>
              <CodeBlock>walrus-site-builder publish --dir ./build</CodeBlock>
              
              <p>For Windows:</p>
              <CodeBlock>site-builder publish --dir ./build</CodeBlock>
              
              <p>You'll be prompted for your wallet private key if not already configured.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 6: Access Your Deployed Site</h2>
              <p>After successful deployment, you'll receive a URL to access your site:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Walrus URL</strong>: <code className="bg-black/30 px-2 py-1 rounded">https://walrus.site/[SITE_ID]</code></li>
                <li><strong>SUI Name Service</strong>: If you've configured a SUI domain, it will be accessible via <code className="bg-black/30 px-2 py-1 rounded">https://[YOUR-DOMAIN].sui</code></li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 7: Custom Domain Configuration (Optional)</h2>
              <p>To use a custom domain with your DocWalrus site:</p>
              
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Register a SUI Name</strong>:
                  <CodeBlock>sui client register-sui-name --name yourdomain --gas-budget 10000000</CodeBlock>
                </li>
                <li>
                  <strong>Link to Your Deployment</strong>:
                  <CodeBlock>sui client link-sui-name --name yourdomain --address [SITE_ID] --gas-budget 10000000</CodeBlock>
                </li>
                <li>
                  <strong>Access Your Site</strong>: Your site will be available at <code className="bg-black/30 px-2 py-1 rounded">https://yourdomain.sui</code>
                </li>
              </ol>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Troubleshooting Deployment Issues</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Wallet Connection Issues</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure your wallet is connected via the DocWalrus platform</li>
                <li>Check that <code className="bg-black/30 px-2 py-1 rounded">~/.docwalrus/wallet.json</code> exists</li>
                <li>Try reconnecting your wallet if deployment fails</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Transaction Failures</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you have sufficient SUI tokens for gas fees</li>
                <li>Verify you have WAL tokens for storage payments</li>
                <li>Check network congestion and try again later</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">Build Errors</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Run <code className="bg-black/30 px-2 py-1 rounded">npm run build</code> separately to identify build issues</li>
                <li>Check for TypeScript errors with <code className="bg-black/30 px-2 py-1 rounded">npm run tsc</code></li>
                <li>Ensure all dependencies are installed with <code className="bg-black/30 px-2 py-1 rounded">npm install</code></li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  );
};

export default Deployment;
