import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';  // Updated import
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from '../components/WalletModal';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LinkAny = Link as unknown as React.ComponentType<any>;

const Configuration = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [network, setNetwork] = useState('mainnet');
  const navigate = useNavigate();
  
  // Updated wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // WebGL Background component (same as in Installation.tsx)
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
      gl.useProgram(program);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

      let startTime = Date.now();
      let animationFrameId: number;

      const render = () => {
        const time = (Date.now() - startTime) * 0.001;
        gl.uniform1f(timeLocation, time);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameId = requestAnimationFrame(render);
      };

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      };

      window.addEventListener('resize', handleResize);
      handleResize();
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
              DocWalrus Configuration Guide
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-lg md:text-xl text-faint"
            >
              Learn how to configure and customize your DocWalrus documentation site
            </motion.p>
          </div>

          {/* Configuration Guide Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glass rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">Step 1: Configure Your Project</h2>
              <p>After installing DocWalrus, you'll need to configure your project settings:</p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">1. Navigate to Project Directory</h3>
              <p>First, ensure you're in your project directory:</p>
              <CodeBlock>cd my-docs</CodeBlock>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">2. Create Environment File</h3>
              <p>Create a .env file by copying the example template:</p>
              <CodeBlock>cp .env.example .env</CodeBlock>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-orange-300">3. Configure Environment Settings</h3>
              <p>Edit the .env file with your preferred settings:</p>
              <CodeBlock>
{`# Site Configuration
SITE_NAME="My Documentation"
SITE_DESCRIPTION="My awesome documentation site"
SITE_URL="https://docs.example.com"

# Deployment Settings
NETWORK="mainnet"  # or "testnet"
GAS_BUDGET=10000000

# Analytics (Optional)
ENABLE_ANALYTICS=false
ANALYTICS_ID=""

# Search Configuration (Optional)
ENABLE_SEARCH=true
SEARCH_API_KEY=""
`}
              </CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 2: Start Development Server</h2>
              <p>Start the local development server using your preferred package manager:</p>

              <p className="mt-4 mb-2">With npm:</p>
              <CodeBlock>npm run dev</CodeBlock>

              <p className="mt-4 mb-2">With yarn:</p>
              <CodeBlock>yarn dev</CodeBlock>

              <p className="mt-4 mb-2">With pnpm:</p>
              <CodeBlock>pnpm dev</CodeBlock>

              <p className="mt-4">Your DocWalrus site will be available at <code className="bg-black/30 px-2 py-1 rounded">http://localhost:3000</code> (or another port if 3000 is in use).</p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 3: Project Structure</h2>
              <p>After installation, your project will have the following structure:</p>

              <CodeBlock>
{`my-docs/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── content/      # Documentation content (MDX files)
│   ├── layouts/      # Page layouts
│   ├── pages/        # Page components
│   ├── styles/       # CSS styles
│   ├── utils/        # Utility functions
│   └── App.tsx       # Main application component
├── .env              # Environment variables
├── docwalrus.config.js # DocWalrus configuration
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration`}
              </CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Step 4: Documentation Structure</h2>
              <p>Your documentation content is organized in the <code className="bg-black/30 px-2 py-1 rounded">src/content</code> directory:</p>

              <CodeBlock>
{`src/content/
├── docs/            # Documentation pages
│   ├── intro.mdx    # Introduction
│   ├── guides/      # User guides
│   └── api/         # API documentation
└── blog/            # Blog posts
    ├── index.mdx    # Blog listing
    └── posts/       # Blog articles`}
              </CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Configuration Options</h2>
              <p>The <code className="bg-black/30 px-2 py-1 rounded">docwalrus.config.js</code> file contains your site configuration:</p>

              <CodeBlock>
{`module.exports = {
  // Site metadata
  title: 'My Documentation',
  description: 'Comprehensive guides and documentation',
  
  // Theme configuration
  theme: {
    primaryColor: '#00b4d8',
    darkMode: 'system', // 'system', 'dark', or 'light'
  },
  
  // Navigation
  navbar: {
    logo: '/logo.svg',
    items: [
      { label: 'Docs', to: '/docs' },
      { label: 'API', to: '/api' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  
  // Footer configuration
  footer: {
    style: 'dark',
    links: [
      {
        title: 'Docs',
        items: [
          { label: 'Getting Started', to: '/docs/intro' },
          { label: 'API Reference', to: '/api' },
        ],
      },
    ],
  },
  
  // Search configuration
  search: {
    enabled: true,
    type: 'local', // 'local' or 'algolia'
  },
}`}
              </CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Blog Configuration</h2>
              <p>To configure the blog features, update your configuration:</p>

              <CodeBlock>
{`module.exports = {
  // ... other config options
  blog: {
    enabled: true,
    postsPerPage: 10,
    showReadingTime: true,
    showAuthor: true,
    showDate: true,
    // Author information
    authors: {
      default: {
        name: 'Your Name',
        title: 'Developer',
        url: 'https://github.com/yourusername',
        imageUrl: '/img/authors/default.jpg',
      },
    },
  },
}`}
              </CodeBlock>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-cyan-300">Theme Customization</h2>
              <p>Customize your site's appearance by modifying the theme settings:</p>

              <CodeBlock>
{`// src/styles/custom.css
:root {
  --dw-primary: #00b4d8;
  --dw-secondary: #0077b6;
  --dw-success: #2ec4b6;
  --dw-warning: #ff9f1c;
  --dw-error: #e71d36;
  
  /* Dark mode colors */
  --dw-dark-bg: #0A1A2F;
  --dw-dark-text: #e6f1ff;
  
  /* Light mode colors */
  --dw-light-bg: #ffffff;
  --dw-light-text: #1a1a1a;
}`}
              </CodeBlock>

              <div className="bg-cyan-900/30 border-l-4 border-cyan-400 p-4 my-6 rounded">
                <p className="text-sm">
                  <strong>Tip:</strong> You can use CSS variables to maintain consistent styling across your documentation site.
                  These variables are automatically applied to both light and dark modes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}

    </div>
  );
};

export default Configuration;