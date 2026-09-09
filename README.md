# LogiGuo

逻辑郭（LogiGuo）—— 基于 React + TypeScript + Vite 构建的纯浏览器静态站点。由 guookcase 项目复制改造而来，品牌字标为 LOGIGUO。

## 定位

- **主定位**：语言学习与写作积累的书架（「书」= 约定式目录结构的内容章节，见下）
- **存量内容**：音乐工作站（museason-daw 外链）、乐理工具与乐理书档、色彩工具
- 部署为纯静态文件（GitHub Pages / Cloudflare Pages 等多镜像），hash 路由 + 相对 base

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS v4 + CSS Variables（oklch 主题）
- **UI 组件**: shadcn/ui (new-york) + Radix UI
- **路由**: React Router v7 (Hash Router)
- **状态管理**: Jotai（不再新增 Zustand store）
- **动画**: Motion for React
- **包管理**: pnpm

## 快速开始

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动开发服务器 → http://localhost:6868（guookcase 用 6767，互不冲突）
pnpm build      # 构建生产版本（tsc + vite，产物 → docs/）
pnpm gh         # 以 GitHub Pages 配置构建（base: /logiguo/）
```

> 验证代码用 `pnpm build`（`pnpm lint` 预存配置损坏，跑不通）。

## 项目结构

```
src/
├── books/{Name}/            # 「书」：纯内容章节，约定式 loader 发现
│   ├── [01]CategorySlug/    #    分类目录（[NN] 前缀决定排序）
│   │   └── [01]article.tsx  #    文章（.tsx / .md / .mdx）
│   └── data/                #    书配置 + generateXxxRoutes() loader
├── articles/                # 文章内容（预留）
└── dev/                     # 主应用
    ├── apps/                #   Home / About / Settings / Mtkit / Color ...
    ├── components/          #   布局与通用组件（含 MDX 样式化组件）
    ├── shadcn/              #   shadcn/ui 组件库
    ├── store/               #   状态（Jotai）+ 全局设置/字体懒加载
    ├── tonicml/             #   音乐记谱语言编译器（10 阶段流水线）
    └── router/              #   createHashRouter 路由配置
```

## 内容工作流

新增书籍内容遵循 `[NN]slug` 顺序命名约定（直接决定排序）：

- TSX 文章：`export default { title: string, jsx: ReactNode }`
- MD/MDX 文章：经 `MDXProviderWrapper` 渲染
- 详见 `AGENTS.md`

## 部署

构建产物输出到 `docs/`，通过 GitHub Pages 部署；另有 Cloudflare / Vercel / Netlify 镜像（见首页卡片配置）。

## 联系方式

作者：guohub@foxmail.com · Bilibili：@方块郭
