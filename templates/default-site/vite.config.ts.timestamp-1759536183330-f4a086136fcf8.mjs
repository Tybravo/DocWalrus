// vite.config.ts
import { defineConfig } from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/vite@5.4.20_@types+node@24.5.2_lightningcss@1.30.1/node_modules/vite/dist/node/index.js";
import mdx from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/@mdx-js+rollup@3.1.1_rollup@4.52.2/node_modules/@mdx-js/rollup/index.js";
import react from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__48255e9c6af5ed5c0a223f8e364ff641/node_modules/@vitejs/plugin-react/dist/index.js";
import remarkMath from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/remark-math@6.0.0/node_modules/remark-math/index.js";
import rehypeKatex from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/rehype-katex@7.0.1/node_modules/rehype-katex/index.js";
import { remarkCodeHike } from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/@code-hike+mdx@0.9.0_react@18.3.1/node_modules/@code-hike/mdx/dist/index.esm.mjs";
import remarkFrontmatter from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/remark-frontmatter@5.0.0/node_modules/remark-frontmatter/index.js";
import remarkMdxFrontmatter from "file:///C:/Users/DELL%20USER/Documents/DocWalrus/node_modules/.pnpm/remark-mdx-frontmatter@5.2.0/node_modules/remark-mdx-frontmatter/dist/remark-mdx-frontmatter.js";
var vite_config_default = defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkMath,
        [remarkCodeHike, {
          theme: "github-dark",
          lineNumbers: true,
          showCopyButton: true
        }]
      ],
      rehypePlugins: [
        rehypeKatex
      ]
    }),
    react()
  ],
  // Add performance optimizations
  server: {
    hmr: {
      overlay: false
      // Disable error overlay for faster HMR
    }
  },
  build: {
    target: "esnext",
    minify: "esbuild"
  },
  esbuild: {
    loader: "tsx",
    include: /\.(tsx|ts|jsx|js)$/,
    jsx: "automatic",
    target: "esnext"
  },
  css: {
    postcss: "./postcss.config.js"
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@mdx-js/react"],
    esbuildOptions: {
      loader: {
        ".mdx": "jsx"
      },
      target: "esnext"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMIFVTRVJcXFxcRG9jdW1lbnRzXFxcXERvY1dhbHJ1c1xcXFx0ZW1wbGF0ZXNcXFxcZGVmYXVsdC1zaXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxERUxMIFVTRVJcXFxcRG9jdW1lbnRzXFxcXERvY1dhbHJ1c1xcXFx0ZW1wbGF0ZXNcXFxcZGVmYXVsdC1zaXRlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ERUxMJTIwVVNFUi9Eb2N1bWVudHMvRG9jV2FscnVzL3RlbXBsYXRlcy9kZWZhdWx0LXNpdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IG1keCBmcm9tICdAbWR4LWpzL3JvbGx1cCc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCByZW1hcmtNYXRoIGZyb20gJ3JlbWFyay1tYXRoJztcclxuaW1wb3J0IHJlaHlwZUthdGV4IGZyb20gJ3JlaHlwZS1rYXRleCc7XHJcbmltcG9ydCB7IHJlbWFya0NvZGVIaWtlIH0gZnJvbSAnQGNvZGUtaGlrZS9tZHgnO1xyXG5pbXBvcnQgcmVtYXJrRnJvbnRtYXR0ZXIgZnJvbSAncmVtYXJrLWZyb250bWF0dGVyJztcclxuaW1wb3J0IHJlbWFya01keEZyb250bWF0dGVyIGZyb20gJ3JlbWFyay1tZHgtZnJvbnRtYXR0ZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBtZHgoe1xyXG4gICAgICByZW1hcmtQbHVnaW5zOiBbXHJcbiAgICAgICAgcmVtYXJrRnJvbnRtYXR0ZXIsXHJcbiAgICAgICAgW3JlbWFya01keEZyb250bWF0dGVyLCB7IG5hbWU6ICdmcm9udG1hdHRlcicgfV0sXHJcbiAgICAgICAgcmVtYXJrTWF0aCxcclxuICAgICAgICBbcmVtYXJrQ29kZUhpa2UsIHsgXHJcbiAgICAgICAgICB0aGVtZTogJ2dpdGh1Yi1kYXJrJyxcclxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxyXG4gICAgICAgICAgc2hvd0NvcHlCdXR0b246IHRydWVcclxuICAgICAgICB9XVxyXG4gICAgICBdLFxyXG4gICAgICByZWh5cGVQbHVnaW5zOiBbXHJcbiAgICAgICAgcmVoeXBlS2F0ZXhcclxuICAgICAgXSxcclxuICAgIH0pLFxyXG4gICAgcmVhY3QoKSxcclxuICBdLFxyXG4gIC8vIEFkZCBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zXHJcbiAgc2VydmVyOiB7XHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogZmFsc2UgLy8gRGlzYWJsZSBlcnJvciBvdmVybGF5IGZvciBmYXN0ZXIgSE1SXHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICBsb2FkZXI6ICd0c3gnLFxyXG4gICAgaW5jbHVkZTogL1xcLih0c3h8dHN8anN4fGpzKSQvLFxyXG4gICAganN4OiAnYXV0b21hdGljJyxcclxuICAgIHRhcmdldDogJ2VzbmV4dCdcclxuICB9LFxyXG4gIGNzczoge1xyXG4gICAgcG9zdGNzczogJy4vcG9zdGNzcy5jb25maWcuanMnLFxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdAbWR4LWpzL3JlYWN0J10sXHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBsb2FkZXI6IHtcclxuICAgICAgICAnLm1keCc6ICdqc3gnLFxyXG4gICAgICB9LFxyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlYLFNBQVMsb0JBQW9CO0FBQ3RaLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTywwQkFBMEI7QUFFakMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsZUFBZTtBQUFBLFFBQ2I7QUFBQSxRQUNBLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFBQSxRQUM5QztBQUFBLFFBQ0EsQ0FBQyxnQkFBZ0I7QUFBQSxVQUNmLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxVQUNiLGdCQUFnQjtBQUFBLFFBQ2xCLENBQUM7QUFBQSxNQUNIO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLGVBQWU7QUFBQSxJQUMvQyxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
