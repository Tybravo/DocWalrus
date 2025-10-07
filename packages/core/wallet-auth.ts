import express from 'express';
import { Server } from 'http';
import { exec } from 'child_process';
import { connectWallet, isWalletConnected } from './wallet';

export interface AuthResult {
  success: boolean;
  address?: string;
  error?: string;
}

// Cross-platform browser opening
const openBrowser = (url: string): void => {
  const platform = process.platform;
  let command: string;

  switch (platform) {
    case 'win32':
      command = `start "${url}"`;
      break;
    case 'darwin':
      command = `open "${url}"`;
      break;
    default:
      command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.error('Failed to open browser:', error);
    }
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
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                    .address { background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace; }
                  </style>
                </head>
                <body>
                  <div class="success">✅ Wallet Connected Successfully!</div>
                  <p>Address: <span class="address">${address}</span></p>
                  <p>You can now close this window and return to your terminal.</p>
                </body>
              </html>
            `);
            
            // Close server after successful connection
            setTimeout(() => {
              server?.close();
            }, 2000);
          })
          .catch((error) => {
            authResult = { success: false, error: error.message };
            res.status(500).send(`
              <html>
                <head>
                  <title>DocWalrus - Connection Failed</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  <div class="error">❌ Connection Failed</div>
                  <p>Error: ${error.message}</p>
                  <p>Please try again or connect manually.</p>
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
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="error">❌ Invalid Request</div>
              <p>No wallet address provided in the callback.</p>
              <p>Please try connecting again from the DocWalrus website.</p>
            </body>
          </html>
        `);
      }
    });

    // Start server
    server = app.listen(port, () => {
      console.log(`📡 Callback server started on port ${port}`);
      
      // Construct the DocWalrus URL with callback parameter
      const callbackUrl = `http://localhost:${port}/auth/callback`;
      const docwalrusUrl = `https://docwalrus.vercel.app/get-started?callback=${encodeURIComponent(callbackUrl)}`;
      
      console.log(`🌐 Opening: ${docwalrusUrl}`);
      
      // Open browser to DocWalrus website
      openBrowser(docwalrusUrl);
    });

    // Wait for authentication or timeout
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        server?.close();
        resolve({ 
          success: false, 
          error: 'Authentication timeout. Please try connecting manually.' 
        });
      }, 300000); // 5 minute timeout

      // Check for successful authentication periodically
      const checkAuth = setInterval(() => {
        if (authResult.success || authResult.error) {
          clearTimeout(timeout);
          clearInterval(checkAuth);
          server?.close();
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