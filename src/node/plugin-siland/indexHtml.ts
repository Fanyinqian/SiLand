/** HTML响应插件：浏览器输入根路径重定向到模版 */
import{ Plugin } from "vite";
import { readFile } from "fs/promises";
import { CLIENT_ENTRY_PATH, DEFAULT_TEMPLATE_PATH } from "../constants";

export function pluginIndexHtml(): Plugin {
    return {
        name: 'siland:index-html',
        transformIndexHtml(html){ // 自动插入模版
            return {
                html,
                tags: [
                    {
                        tag: "script",
                        attrs:{
                            type: "module",
                            src: `/@fs/${CLIENT_ENTRY_PATH}`, // vite约定绝对路径前加 @fs
                        },
                        injectTo: "body",
                    }
                ]
            }
        },
        configureServer(server){ // 插件初始化时注册一次
            return () => {
                // 模版内容改变就会执行中间件里的内容
                server.middlewares.use(async(req, res, next) => {
                    // 1. 读取 template.html 的内容
                    let content = await readFile(DEFAULT_TEMPLATE_PATH,'utf-8');
                    // 热更新，替换html
                    content = await server.transformIndexHtml(
                        req.url,
                        content,
                        req.originalUrl
                    )
                    // 2. 响应 HTML 浏览器
                    res.setHeader("Content-Type", "text/html");
                    res.end(content);
                })
            }
        }
    }
}