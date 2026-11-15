import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // the API lives in GameEngineAPI/ next to the game; its builds lock files, so don't watch them
    watch: { ignored: ['**/GameEngineAPI/**'] },
  },
});
