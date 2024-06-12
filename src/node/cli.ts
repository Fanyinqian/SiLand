import cac from 'cac';
import { createDevServer } from './dev';
import { build } from './build';
const cli = cac('siland').version('0.0.1').help();

// 子命令注册：第一个参数：命令，第二个参数：描述
cli.command('dev [root]', 'start dev server').action(async (root: string) => {
  const server = await createDevServer(root);
  await server.listen();
  server.printUrls();
});

cli
  .command('build [root]', 'build in production')
  .action(async (root: string) => {
    await build(root);
  });

cli.parse();
