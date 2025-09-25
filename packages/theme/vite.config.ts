import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import mdx from '@mdx-js/rollup';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

export default defineConfig({
  plugins: [react(), mdx({
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],})],
  root: __dirname,
  server: {
    open: true, // Opens browser automatically
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DocwalrusTheme',
      fileName: (format) => `docwalrus-theme.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});

