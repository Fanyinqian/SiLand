import { createServer } from "vite";

export async function createDevServer(root:string) {
  return createServer({
    root,
  });
}
