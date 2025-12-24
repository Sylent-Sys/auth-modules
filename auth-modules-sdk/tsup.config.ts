import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2022',
  outDir: 'dist',
  external: [],
  noExternal: [],
  platform: 'neutral', // Isomorphic - works in both browser and Node
  esbuildOptions(options) {
    options.banner = {
      js: '// Auth Modules SDK - Isomorphic TypeScript SDK',
    };
  },
});
