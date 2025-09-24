import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [],
      rehypePlugins: [],
    }),
  ],
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx|ts|jsx|js|mdx)$/,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
