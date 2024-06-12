import { build as viteBuild, InlineConfig } from 'vite';
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants';
import pluginReact from '@vitejs/plugin-react';
import * as path from 'path';
import type { RollupOutput } from 'rollup';
import fs from 'fs-extra';
import ora from 'ora';

export async function bundle(root: string) {
  /**
   * 抽离vite build 公共配置
   * @param isServer 服务端渲染还是客户端渲染
   * @returns build 配置
   */
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: 'production',
    root,
    plugins: [pluginReact()], // 这个插件能自动注入 import React from 'react'，避免 React is not defined 的错误
    build: {
      ssr: isServer,
      outDir: isServer ? '.temp' : 'build',
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? 'cjs' : 'esm'
        }
      }
    }
  });
  const clientBuild = async () => {
    return viteBuild(resolveViteConfig(false));
  };

  const serverBuild = async () => {
    return viteBuild(resolveViteConfig(true));
  };

  // const spinner = ora();
  // spinner.start("Bundling client + server bundles..."); // Loading效果
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      clientBuild(),
      serverBuild()
    ]);
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const appHtml = render();
  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>title</title>
        <meta name="description" content="xxx">
      </head>
      <body>
        <div id="root">${appHtml}</div>
      </body>
    </html>`.trim();
  await fs.writeFile(path.join(root, 'build', 'index.html'), html);
  await fs.remove(path.join(root, '.temp'));
}

export async function build(root: string = process.cwd()) {
  // 1. 代码打包，生成两份bundle - client 端 + server 端
  const [clientBundle, serverBundle] = await bundle(root);
  // 2. 引入 server-entry 产物
  const serverEntryPath = path.resolve(root, '.temp', 'ssr-entry.js');

  // 3. 服务端渲染，产出HTML
  const { render } = await import(serverEntryPath);
  await renderPage(render, root, clientBundle);
}
