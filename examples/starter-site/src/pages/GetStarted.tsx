import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@docwalrus/theme';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { formatWalletAddress } from '../utils/walletUtils';
import WalletModal from '../components/WalletModal';

// Icons for the cards
const InstallationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(244, 162, 97)">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ConfigurationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(244, 162, 97)">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// New Deployment Icon (cloud upload icon)
const DeploymentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(244, 162, 97)">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgb(244, 162, 97)">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// WebGL Shader Background (reused from Landing.tsx)
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
        
        // Create line patterns
        float lines = sin(st.y * 50.0 + u_time) * 0.1;
        
        // Combine patterns
        float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
        pattern += lines * 0.3;
        
        // Create radial gradient
        vec2 center = vec2(0.5, 0.4);
        float dist = distance(st, center);
        float radial = 1.0 - smoothstep(0.0, 0.8, dist);
        
        // Define colors
        vec3 cyan = vec3(0.0, 1.0, 1.0);
        vec3 orange = vec3(0.956, 0.635, 0.380);
        vec3 deep_blue = vec3(0.039, 0.102, 0.184);
        
        // Mix colors based on patterns
        vec3 color = mix(deep_blue, cyan, pattern * radial * 0.3);
        color = mix(color, orange, (pattern + lines) * radial * 0.2);
        
        // Add sparkle effect
        float sparkle = noise(st * 50.0 + u_time * 2.0);
        sparkle = smoothstep(0.98, 1.0, sparkle);
        color += sparkle * 0.5;
        
        // Set alpha for transparency
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

const GetStarted = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for CLI authentication flow
    const urlParams = new URLSearchParams(window.location.search);
    const autoConnect = urlParams.get('autoConnect');
    const callback = urlParams.get('callback');

    if (callback) {
      setCallbackUrl(callback);
    }

    if (autoConnect === 'true') {
      // Automatically open wallet modal for CLI authentication
      setIsWalletModalOpen(true);
    }
  }, []);

  useEffect(() => {
    // Handle wallet connection callback for CLI
    if (currentAccount && callbackUrl) {
      const handleCallback = async () => {
        try {
          // Send wallet address to CLI callback URL
          const response = await fetch(callbackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: currentAccount.address,
              success: true,
            }),
          });

          if (response.ok) {
            // Show success message and close modal
            setIsWalletModalOpen(false);
            
            // Optional: Show a success notification
            const successDiv = document.createElement('div');
            successDiv.innerHTML = `
              <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 12px;
                padding: 20px;
                color: white;
                text-align: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
              ">
                <h3 style="margin: 0 0 10px 0; color: rgb(0, 255, 255);">✅ Wallet Connected!</h3>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">You can now close this tab and return to your terminal.</p>
              </div>
            `;
            document.body.appendChild(successDiv);

            // Auto-remove success message after 5 seconds
            setTimeout(() => {
              if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
              }
            }, 5000);

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Failed to send callback:', error);
          
          // Send error callback
          try {
            await fetch(callbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                success: false,
                error: 'Failed to authenticate wallet',
              }),
            });
          } catch (callbackError) {
            console.error('Failed to send error callback:', callbackError);
          }
        }
      };

      handleCallback();
    }
  }, [currentAccount, callbackUrl]);

  return (
    <>
      {/* Wallet Modal for CLI Authentication */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <WebGLBackground />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight"
              style={{ color: 'rgb(244, 162, 97)' }}
            >
              Getting Started
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

          {/* 2x2 Grid of Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* Installation Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass rounded-2xl p-6 hover-glow-cyan-orange transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/installation')}
            >
              <div className="flex flex-col items-center text-center">
                <InstallationIcon />
                <h3 className="mt-4 text-xl font-semibold" style={{ color: 'rgb(244, 162, 97)' }}>Installation</h3>
                <p className="mt-2 text-sm text-faint">
                  Quick start guide to install and set up Docwalrus for your project
                </p>
              </div>
            </motion.div>

            {/* Configuration Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass rounded-2xl p-6 hover-glow-cyan-orange transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/configuration')}
            >
              <div className="flex flex-col items-center text-center">
                <ConfigurationIcon />
                <h3 className="mt-4 text-xl font-semibold" style={{ color: 'rgb(244, 162, 97)' }}>Configuration</h3>
                <p className="mt-2 text-sm text-faint">
                  Learn how to customize and configure your documentation site
                </p>
              </div>
            </motion.div>

            {/* Deployment Card (replacing Knowledge Base Card) */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass rounded-2xl p-6 hover-glow-cyan-orange transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/deployment')}
            >
              <div className="flex flex-col items-center text-center">
                <DeploymentIcon />
                <h3 className="mt-4 text-xl font-semibold" style={{ color: 'rgb(244, 162, 97)' }}>Deployment</h3>
                <p className="mt-2 text-sm text-faint">
                  Deploy your documentation site to Walrus storage on SUI blockchain
                </p>
              </div>
            </motion.div>

            {/* Support Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass rounded-2xl p-6 hover-glow-cyan-orange transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/support')}
            >
              <div className="flex flex-col items-center text-center">
                <SupportIcon />
                <h3 className="mt-4 text-xl font-semibold" style={{ color: 'rgb(244, 162, 97)' }}>Support</h3>
                <p className="mt-2 text-sm text-faint">
                  Get help from our community and support team
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default GetStarted;