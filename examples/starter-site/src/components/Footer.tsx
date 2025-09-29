import React from 'react';

interface FooterProps {
  copyright?: string;
}

const Footer: React.FC<FooterProps> = ({ copyright = "© 2025 Docwalrus. All rights reserved. Built on Sui & Walrus." }) => {
  return (
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
                <path d="M20.317 4.369a1.913 1.913 0 00-1.55-.385c-1.338.49-2.49 1.2-3.378 1.963-.962.82-1.81 1.72-2.52 2.652a9.442 9.442 0 00-.864-1.03c-.28-.31-.58-.61-.89-.89a.18.18 0 00-.06-.05c-.02-.02-.04-.03-.06-.05a1.88 1.88 0 00-1.03-.44 1.82 1.82 0 00-1.02.44c-.31.28-.61.58-.89.89a9.5 9.5 0 00-.86 1.03c-.71-.93-1.56-1.83-2.52-2.65C5.027 6.289 3.873 5.58 2.536 5.09a1.913 1.913 0 00-1.55.385 1.93 1.93 0 00-.6 1.55c.02.43.12.84.29 1.23.17.4.4.79.68 1.18.28.4.6.8.92 1.2.32.4.62.8.92 1.2.3.4.58.8.84 1.18.26.4.50.79.72 1.18.22.4.42.8.6 1.2.18.4.32.8.44 1.2.12.4.20.8.24 1.2s.02.8-.02 1.2a1.93 1.93 0 00.6 1.55c.43.43 1.02.6 1.55.6.43 0 .84-.12 1.23-.29.4-.17.79-.4 1.18-.68.4-.28.8-.6 1.2-.92.4-.32.8-.62 1.2-.92.4-.3.8-.58 1.18-.84.4-.26.79-.5 1.18-.72.4-.22.8-.42 1.2-.6.4-.18.8-.32 1.2-.44.4-.12.8-.2 1.2-.24.4-.04.8-.02 1.2.02a1.93 1.93 0 001.55-.6c.43-.43.6-1.02.6-1.55s-.12-.84-.29-1.23a14.5 14.5 0 00-2.4-4.64c-.3-.4-.6-.8-.92-1.2s-.62-.8-.92-1.2a10.8 10.8 0 00-.84-1.18c-.26-.4-.5-.79-.72-1.18a8.7 8.7 0 00-.6-1.2c-.18-.4-.32-.8-.44-1.2a1.93 1.93 0 00-.24-1.2zM8.4 13.4c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4zm7.2 0c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-xs text-faint">
          {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;