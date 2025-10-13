import express from 'express';
import { Server } from 'http';
import { exec, spawn } from 'child_process';
import { connectWallet, isWalletConnected } from './wallet';

export interface AuthResult {
  success: boolean;
  address?: string;
  error?: string;
}

// More robust cross-platform browser opening
const openBrowser = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const platform = process.platform;
    let command: string;
    let args: string[] = [];
    
    switch (platform) {
      case 'win32':
        // Try multiple methods for Windows
        command = 'rundll32';
        args = ['url.dll,FileProtocolHandler', url];
        break;
      case 'darwin':
        command = 'open';
        args = [url];
        break;
      default:
        command = 'xdg-open';
        args = [url];
    }

    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore'
    });

    child.on('error', (error) => {
      console.log(`Primary method failed, trying alternative...`);
      
      // Fallback methods
      if (platform === 'win32') {
        // Alternative Windows method
        exec(`start "" "${url}"`, { windowsHide: true }, (error) => {
          if (error) {
            console.log(`Alternative method also failed. Please open manually: ${url}`);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        console.log(`Failed to open browser. Please open manually: ${url}`);
        resolve(false);
      }
    });

    child.on('spawn', () => {
      child.unref();
      resolve(true);
    });

    // Timeout after 3 seconds
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });
};

// Find available port
const findAvailablePort = (): Promise<number> => {
  return new Promise((resolve) => {
    const server = express().listen(0, () => {
      const port = (server.address() as any)?.port || 3001;
      server.close(() => resolve(port));
    });
  });
};

// Main authentication function
export const authenticateWallet = async (): Promise<AuthResult> => {
  try {
    // Check if already connected
    if (await isWalletConnected()) {
      return { success: true };
    }

    console.log('🔗 Opening browser for wallet connection...');
    
    // Find available port for callback server
    const port = await findAvailablePort();
    
    // Create Express server for handling callback
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    let server: Server;
    let authResult: AuthResult = { success: false };
    
    // Set up callback endpoint
    app.get('/auth/callback', (req, res) => {
      const { address, network } = req.query;
      
      if (address && typeof address === 'string') {
        // Save wallet connection
        connectWallet(address, (network as 'mainnet' | 'testnet') || 'mainnet')
          .then(() => {
            authResult = { success: true, address };
            res.send(`
              <html>
                <head>
                  <title>DocWalrus - Wallet Connected</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                      text-align: center; 
                      padding: 20px; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      margin: 0;
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .container {
                      background: rgba(255, 255, 255, 0.1);
                      backdrop-filter: blur(10px);
                      border-radius: 20px;
                      padding: 40px;
                      max-width: 500px;
                      margin: 0 auto;
                      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    .success { 
                      color: #4ade80; 
                      font-size: 28px; 
                      margin-bottom: 20px; 
                      font-weight: bold;
                    }
                    .address { 
                      background: rgba(255, 255, 255, 0.2); 
                      padding: 15px; 
                      border-radius: 10px; 
                      font-family: 'Courier New', monospace; 
                      word-break: break-all;
                      margin: 20px 0;
                      font-size: 14px;
                    }
                    .message {
                      font-size: 16px;
                      opacity: 0.9;
                      line-height: 1.5;
                    }
                    .close-btn {
                      background: rgba(255, 255, 255, 0.2);
                      border: none;
                      color: white;
                      padding: 10px 20px;
                      border-radius: 8px;
                      cursor: pointer;
                      margin-top: 20px;
                      font-size: 14px;
                    }
                    .close-btn:hover {
                      background: rgba(255, 255, 255, 0.3);
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="success">✅ Wallet Connected Successfully!</div>
                    <p class="message">Your SUI wallet has been connected to DocWalrus CLI</p>
                    <div class="address">${address}</div>
                    <p class="message">You can now close this window and return to your terminal to continue.</p>
                    <button class="close-btn" onclick="window.close()">Close Window</button>
                  </div>
                  <script>
                    // Auto-close after 5 seconds
                    setTimeout(() => {
                      window.close();
                    }, 5000);
                  </script>
                </body>
              </html>
            `);
            
            // Close server after successful connection
            setTimeout(() => {
              server?.close();
            }, 6000);
          })
          .catch((error) => {
            authResult = { success: false, error: error.message };
            res.status(500).send(`
              <html>
                <head>
                  <title>DocWalrus - Connection Failed</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                      text-align: center; 
                      padding: 20px; 
                      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                      color: white;
                      margin: 0;
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .container {
                      background: rgba(255, 255, 255, 0.1);
                      backdrop-filter: blur(10px);
                      border-radius: 20px;
                      padding: 40px;
                      max-width: 500px;
                      margin: 0 auto;
                      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    .error { color: #fca5a5; font-size: 24px; margin-bottom: 20px; font-weight: bold; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="error">❌ Connection Failed</div>
                    <p>Error: ${error.message}</p>
                    <p>Please try again or connect manually.</p>
                  </div>
                </body>
              </html>
            `);
          });
      } else {
        authResult = { success: false, error: 'No wallet address provided' };
        res.status(400).send(`
          <html>
            <head>
              <title>DocWalrus - Invalid Request</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  text-align: center; 
                  padding: 20px; 
                  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
                  color: white;
                  margin: 0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 20px;
                  padding: 40px;
                  max-width: 500px;
                  margin: 0 auto;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                .error { color: #ffcc80; font-size: 24px; margin-bottom: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error">⚠️ Invalid Request</div>
                <p>No wallet address provided in the callback.</p>
                <p>Please try connecting again from the DocWalrus website.</p>
              </div>
            </body>
          </html>
        `);
      }
    });

    // Start server
    server = app.listen(port, async () => {
      console.log(`📡 Callback server started on port ${port}`);
      
      // Construct the DocWalrus URL with callback parameter and auto-connect flag
      const callbackUrl = `http://localhost:${port}/auth/callback`;
      const docwalrusUrl = `https://docwalrus.vercel.app/get-started?callback=${encodeURIComponent(callbackUrl)}&autoConnect=true`;
      
      console.log(`🌐 Opening: ${docwalrusUrl}`);
      
      // Try to open browser
      const browserOpened = await openBrowser(docwalrusUrl);
      
      if (!browserOpened) {
        console.log('💡 Browser failed to open automatically. Please copy and paste the URL above into your browser.');
      } else {
        console.log('✅ Browser opened successfully. Please complete the wallet connection in your browser.');
      }
    });

    // Wait for authentication or timeout with longer timeout
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        server?.close();
        resolve({ 
          success: false, 
          error: 'Authentication timeout (10 minutes). Please try connecting manually or check if the browser opened correctly.' 
        });
      }, 600000); // 10 minute timeout instead of 5

      // Check for successful authentication periodically
      const checkAuth = setInterval(() => {
        if (authResult.success || authResult.error) {
          clearTimeout(timeout);
          clearInterval(checkAuth);
          setTimeout(() => {
            server?.close();
          }, 1000);
          resolve(authResult);
        }
      }, 1000);
    });

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown authentication error' 
    };
  }
};

// Validate existing wallet connection
export const validateWalletConnection = async (): Promise<AuthResult> => {
  try {
    const connected = await isWalletConnected();
    if (connected) {
      return { success: true };
    } else {
      return { success: false, error: 'No wallet connected' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation error' 
    };
  }
};