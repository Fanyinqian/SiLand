import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-siland/indexHtml';
import pluginReact from '@vitejs/plugin-react';

export async function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()]
  });
}
