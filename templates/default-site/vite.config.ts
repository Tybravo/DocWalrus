import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkCodeHike } from '@code-hike/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
        remarkMath,
        [remarkCodeHike, { 
          theme: 'github-dark',
          lineNumbers: true,
          showCopyButton: true
        }]
      ],
      rehypePlugins: [
        rehypeKatex
      ],
    }),
    react(),
  ],
  // Add performance optimizations
  server: {
    hmr: {
      overlay: false // Disable error overlay for faster HMR
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx|ts|jsx|js)$/,
    jsx: 'automatic',
    target: 'esnext'
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mdx-js/react'],
    esbuildOptions: {
      loader: {
        '.mdx': 'jsx',
      },
      target: 'esnext'
    },
  },
});
