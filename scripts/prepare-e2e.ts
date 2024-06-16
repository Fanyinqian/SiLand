import path from 'path';
import fse from 'fs-extra';
import * as execa from 'execa';

const exampleDir = path.resolve(__dirname, '../e2e/playground/basic');
const ROOT = path.resolve(__dirname, '../dist');

const defaultOptions = {
  cwd: exampleDir,
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr
};
async function prepareE2E() {
  // 判断产物是否存在，如果不存在则打包构建
  if (!fse.existsSync(ROOT)) {
    // pnpm build
    execa.commandSync('pnpm build', {
      cwd: ROOT,
      stdout: process.stdout,
      stdin: process.stdin,
      stderr: process.stderr
    });
  }

  // 安装浏览器
  execa.commandSync('npx playwright install', {
    cwd: ROOT,
    stdout: process.stdout,
    stdin: process.stdin,
    stderr: process.stderr
  });

  // 启动
  execa.commandSync('pnpm dev', defaultOptions);
}

prepareE2E();
