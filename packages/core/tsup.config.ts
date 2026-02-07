import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/VirtualTable/index.ts',
    'src/VirtualList/index.ts',
    'src/VirtualSelect/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', '@tanstack/react-table', '@tanstack/react-virtual'],
  treeshake: true,
  minify: false,
});
