# AGENTS.md

为在本仓库（`guookcase` —— 纯 Web 应用，基于 museason 框架）中工作的 AI agent 提供指引。

## 命令

包管理器：**pnpm**。**没有配置测试框架**。

```bash
pnpm dev                  # 启动 Vite 开发服务器
pnpm build                # tsc + vite build（产物 → docs/）
pnpm gh                   # 以 GITHUB_PAGES=true 构建（base: /guookcase/，产物 → docs/）
pnpm lint                 # ESLint flat config，--max-warnings 0
```

构建产物输出到 `docs/`（通过 GitHub Pages 部署）。因为是作为静态文件服务，所以必须使用 hash 路由 + 相对 `base`（或 GH Pages 构建时的 `/guookcase/`）—— 切换到 `BrowserRouter` 或绝对资源路径时，必须同时更新 `vite.config.ts` 和部署配置。

## 架构

### 目录结构

- `src/dev/` —— 主 React 应用（apps、components、stores、router、styles、utils、shadcn UI、tonicml 编译器）
- `src/books/{Name}/` —— 纯内容的「书」章节，由约定式 loader 发现
- `src/articles/` —— 文章内容（目前为空占位）

### 路由

`createHashRouter`（React Router v7），定义在 `src/dev/router/index.tsx`；路径常量在 `src/dev/router/paths.ts`。布局链：`HashRouter → MainLayout (Navigation + Outlet + Background) → page | BookLayout`。未匹配路由会重定向到 `/home/`。

### Book loader 模式（核心内容系统）

`src/books/{Name}/` 下每本书的约定结构：

```
src/books/{Name}/
  [01]CategorySlug/
    [01]article-slug.tsx      # 也可以是 .md / .mdx
    info.tsx                  # 导出 { slug, icon? }
  data/
    info.tsx                  # 书的配置（title, slug, icon, description）
    {name}Loader.tsx          # generateXxxRoutes() 实现
```

loader 使用 `import.meta.glob("../**/*.{tsx,md,mdx}", { eager: true })`，解析 `[order]slug` 的目录/文件命名，按分类分组、排序，输出 `RouteObject[]`。新增内容时**必须严格遵循 `[NN]slug` 顺序命名** —— 它直接决定排序。

- **TSX 文章**必须 `export default { title: string, jsx: ReactNode }`
- **MD/MDX** 文章通过 `MDXProviderWrapper` 渲染，使用来自 `@mdx` 的样式化组件

### 状态管理

状态库统一使用 **Jotai** —— 所有新增状态都用 Jotai atom（atom 通常放在拥有它的功能模块旁）。`immer` 可用于不可变更新。`src/dev/store/` 下的旧 store（原为 Zustand + `persist`）正在向 Jotai 迁移；改到 Zustand store 时，优先把它迁移成 atom，而不是去扩展它。**不要再新增 Zustand store。**

### TonicML 编译器

`src/dev/tonicml/` —— 一个 10 阶段的流水线（`s1_text_to_blocks` → `s10_final_build`），用于一种领域特定的音乐记谱语言。每个阶段在 `stageProcess/` 下有独立目录。修改时请保留阶段顺序和 `index.ts` 的聚合逻辑。

### UI 栈

- **Tailwind CSS v4** + **shadcn/ui**（new-york 风格）+ **Radix UI** 原语
- **Lucide React** 图标；`cn()` 在 `@shadcn/lib/utils`（clsx + tailwind-merge）
- shadcn 组件：`src/dev/shadcn/components/ui/`；MDX 样式化组件：`src/dev/components/mdx/`
- shadcn 配置在 `components.json`（别名指向 `@/dev/shadcn/...`）

### 样式架构（五层规范，新组件强制遵循）

样式按问题类型分层，每层只解决一类问题：

| 层 | 工具 | 用途 |
|---|---|---|
| ① 设计 Token | CSS Variables（`@theme` + themes.css） | 颜色、字号、圆角、间距等全局标量 |
| ② 静态 UI | Tailwind | 布局、排版、断点、hover、离散状态 |
| ③ 实时动态标量 | React inline style 写 CSS 变量 | 坐标、缩放、透明度、进度等高频值 |
| ④ 动画/手势 | Motion for React（framer-motion） | spring、drag、layout 过渡、enter/exit |
| ⑤ 复杂 CSS/SVG | CSS Modules | keyframes、深层 selector、3D |

**Emotion 定位**：存量组件兼容层，**不作为新代码默认**。现有 Emotion 组件（OctavePiano、NoteText、CirclePiano 等）在遇到性能问题时迁移，不做无收益的全量重构。

**核心规则**：JS 计算数值 → 写入 CSS 变量 → CSS/Tailwind 消费变量。**不要**把高频变化的数值（拖拽坐标、逐帧动画）传给 Emotion 插值——那会每次渲染都生成新 class。

**CSS 变量命名**（防命名空间污染）：

```
--color-* / --radius-* / --font-*   ← 仅全局主题 token（定义在 :root / [data-theme]）
--octave-piano-* / --jianpu-*        ← 组件动态变量必须带组件前缀
```

- 组件动态变量一律带组件名前缀（`--octave-piano-key-color`，不是裸的 `--key-color`），因为 CSS 变量全局继承，裸名会嵌套污染
- 变量定义在需要的最小 DOM 子树上，不挂全局容器

**高频动画**用 `useMotionValue`，不要每帧 `setState()`。transform/opacity 优先（不触发布局重排）。

### 主题系统

主题通过 `<html>` 上的 `data-theme` 属性设置（**不是** class）。支持 light、dark、blue、green、purple、system。CSS 变量使用 **oklch** 色彩空间。Google 色板在 `@assets/colors/googleColors`。

### 字体系统（免流量懒加载 + 独立字体仓库）

字体资产**不在本仓库**，托管在独立公开仓库 `guohub8080/guohub-fonts`（本地路径 `../guohub-fonts`），按用途分区：`cjk/`（中日韩，cn-font-split 分片）、`english/`（等宽拉丁直存）、`symbols/`（符号预留）。**不要把字体文件提交进本仓库**——唯一例外是 `NoteText` 的音乐记谱字体（组件运行时关键资产，随构建打包）。

- **加载架构**：核心模块 `src/dev/store/useGlobalSettings/webfontLoader.ts`。默认**纯系统字体栈、零字体流量**；只有启用了某个 web 字体（访客在 Settings 选择，或站长在 `defaultValues.ts` 配置优先字体）才按族懒注入该族 CSS，`font-display: swap` 渐进增强不阻塞渲染。
- **四层 CDN 自动降级**（链接按仓库名拼接，字体仓库 push 后自动生效，无需申请）：`cdn.jsdelivr.net/gh/guohub8080/guohub-fonts@v1` → `fastly.jsdelivr.net/...`（大陆优化域）→ `guohub-fonts.pages.dev`（Cloudflare Pages）→ `guohub8080.github.io/guohub-fonts`（GitHub Pages 兜底，与主站同可达性）。失败由 `onerror` 换下一层，全败回落系统栈。
- **缓存语义**：jsDelivr 两层引用 `@v1` tag（永久不可变缓存）；Pages 两层跟随 `main` 分支。**更新字体流程**：guohub-fonts 提交 → 打新 tag（如 v2）push → 本仓库把 `webfontLoader.ts` 里的 `@v1` 改 `@v2`（一行 diff）。
- **新增字体族**：在 guohub-fonts 的 `fonts.config.json` 加任务 → `pnpm build` 分片 → 本仓库 `WEBFONT_REGISTRY` 加一行（key 必须与该族 CSS 里的 `font-family` 名一致）；不在 guohub-fonts 的字体（如 Google Fonts 现成托管）用注册表的 `sources` 字段配专属源。
- **硬性约束**：guohub-fonts 必须为**公开仓库**且 push 时带 `--tags`（否则四层全 404）；新增字体先查许可证——微软专有字体（Consolas 等）**禁止**入库，MiSans 的 woff2 属公开分发灰色地带，思源系/JetBrains Mono/Cascadia 均为 SIL OFL 可放心分发。

### 路径别名

在 `vite.config.ts` 和 `tsconfig.app.json` 中配置一致 —— 新增别名时两处都要同步：

`@` → `src/`，`@dev`、`@apps`、`@comps`、`@assets`、`@utils`、`@api`、`@styles`、`@shadcn`、`@books`、`@mdx`、`@music-comps`、`@pubHTML`、`@pubSVG`、`@pubUtils`、`@tonicml`、`@music12doc`、`@svgDocument`。可解析扩展名 `[".ts", ".tsx", ".js", ".jsx", ".mdx", ".md"]`。

## 规范

### 类型与空值判断：统一用 es-toolkit（禁止 lodash）

项目代码已从 `lodash` 迁移到 [es-toolkit](https://es-toolkit.slash.me/)。**所有项目源码（TS/TSX）一律用 es-toolkit，禁止再用 lodash**（不新增 `import ... from 'lodash'` 或 `lodash/xxx` 子包）。下列规则强制执行。

> **例外**：`src/dev/tonicml/utils/music12/index.js` 是 npm 包 `music12` 的 vendored 打包产物（2 万行，非手写源码），仍依赖 lodash——**不要手改它**。`lodash` 依赖保留只为它和 `*.backup.tsx` 服务。

#### 1. 类型判断：用 es-toolkit/predicate，绝对禁止 typeof

**绝对禁止**用 `typeof x === 'string'`、`typeof x === 'number'`、`typeof x === 'function'` 等任何原生 typeof 判断。

**必须**用 es-toolkit 的命名导入。`isXxx` 谓词统一从 `es-toolkit/predicate` 导入（这是 es-toolkit 1.x 的专用谓词子模块，tree-shaking 最优）；仅 `isArray`/`isObject`/`defaultTo` 等 predicate 没有的函数才用 `/compat`：

```ts
// 谓词子模块（es-toolkit/predicate）——isXxx 统一从这里导
import { isString, isNumber, isNil, isFunction, isBoolean, isUndefined, isDate, isRegExp, isPromise } from 'es-toolkit/predicate'
// compat 模块（es-toolkit/compat）——仅 predicate 没有的函数才用
import { isArray, isObject, defaultTo } from 'es-toolkit/compat'
```

**predicate vs compat 划分**（按 es-toolkit 1.49 实际 API）：
- `es-toolkit/predicate`：`isBoolean` `isFunction` `isNil` `isNotNil` `isNull` `isNumber` `isString` `isSymbol` `isUndefined` `isDate` `isRegExp` `isPromise` `isError` `isMap` `isSet` `isWeakMap` `isWeakSet` `isArrayBuffer` `isTypedArray` `isBuffer` `isBlob` `isFile` `isBrowser` `isNode` `isIterable` `isLength` `isPrimitive` `isPlainObject` `isEmptyObject` `isEqual` `isEqualWith` `isJSON` `isJSONArray` `isJSONObject` `isJSONValue`
- `es-toolkit/compat`（仅此有）：`isArray` `isObject` `defaultTo`

一个文件同时用到两类时，分两行写（predicate 一行、compat 一行）。

#### 2. 非空判断：用 isNotNil，禁止 !isNil

判断"存在（非 null/undefined）"时，**禁止用 `!isNil(x)`**，**必须**用 `es-toolkit/predicate` 的 `isNotNil`。`isNotNil` 是类型守卫，能正确收窄为 `NonNullable<T>`，比 `!isNil` 更安全也更易读。

```ts
import { isNotNil } from 'es-toolkit/predicate'

// ❌ 禁止
if (!isNil(acc)) { ... }
const valid = items.filter(x => !isNil(x))

// ✅ 必须
if (isNotNil(acc)) { ... }
const valid = items.filter(isNotNil)   // 还能直接作为谓词传递
```

**例外**：判断"为空（is nil）"时仍用 `isNil`（`if (isNil(acc))`）——`isNotNil` 只覆盖"非空"语义，不替代"为空"判断。

#### 3. 空值默认：用 defaultTo，禁止 ?? 和普通赋值兜底

**禁止**用 `a ?? b`（空值合并运算符），也禁止用 `||` 做"普通赋值兜底"。**必须**用 es-toolkit 的 `defaultTo`（注意：`defaultTo` 在 compat 模块）：

```ts
import { defaultTo } from 'es-toolkit/compat'

// ❌ 禁止
const voice = config.voice ?? 1
const name = displayName ?? fallback ?? 'default'
const x = value || 0

// ✅ 必须
const voice = defaultTo(config.voice, 1)
const name = defaultTo(defaultTo(displayName, fallback), 'default')
```

#### 4. 主动赋空值：用 void 0，禁止直接写 undefined

**主动赋值** `undefined` 时**必须**用 `void 0`（判断侧用 `isNil`/`isNotNil` 不受影响）。

```ts
// ❌ 禁止
this._activeSite = undefined
private _cache: X | undefined = undefined

// ✅ 必须
this._activeSite = void 0
private _cache: X | undefined = void 0
```

注意：类型标注里的 `| undefined` 不需要改（那是类型声明不是赋值）。判断侧的 `=== undefined` / `!== undefined` 已由 `isNil` / `isNotNil` 统一替代，也不涉及。

- **语言**：UI 文案、内容和大部分注释都是**中文**，编辑时请保持一致。
- **跨平台**：本应用是**纯浏览器 Web 应用**（无 Capacitor / 原生壳，museason 框架的原生打包能力未带入）。按 Web 标准开发，注意移动端浏览器兼容（触摸目标、安全区、iOS Safari 差异）。

## 安全区（每个页面都要围绕它做）

整个 UI 是围绕安全区构建的 —— 这是一等公民，不是事后补救。App 布局就是 **顶部 `Navigation` 导航栏 + `<main>` 内容区**（见 `src/dev/components/layout/MainLayout/index.tsx`），安全区契约直接映射其上：

- **导航栏**吸收 `safe-area-inset-top`（刘海 / 状态栏）。
- **`<main>` 内容区**吸收 `safe-area-inset-bottom`（home indicator），横屏时还要吸收 `safe-area-inset-left/right`。
- 这些容器**永远不要写死顶部/底部 padding** —— 一律走安全区 inset。

**硬性要求：**

1. `index.html` 的 viewport meta **必须**包含 `viewport-fit=cover`，否则 iOS Safari 里 `env(safe-area-inset-*)` 会返回 `0`，整个方案在 iOS 上静默失效。当前 meta：`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>`。
2. 使用 CSS env 写法，并为极老的 iOS（< 11.2）保留 `constant()` 回退：
   ```css
   padding-top: constant(safe-area-inset-top);    /* iOS < 11.2 */
   padding-top: env(safe-area-inset-top);         /* iOS >= 11.2，现代 Android */
   ```
3. 移动端浏览器原生支持 `env(safe-area-inset-*)`（iOS Safari 需配合 `viewport-fit=cover`）；桌面端 inset 恒为 `0`，无副作用。

## 原生平台说明

本项目为**纯 Web 应用**，不接入 Capacitor / Android / Electron——museason 框架的原生壳（`android/`、`electron/`、`capacitor.config.ts`、`build:app` 与 `cap:*` 命令、`src/dev/utils/platform.ts`）均未拷入；需要原生打包能力时参考 museason 仓库。

新增任何全屏 / fixed / sticky 表面（导航栏、底部弹层、FAB、tab bar）时，**先**拿安全区对照检查。

## 工作流

- 每次对话结束后，**自动 commit 当前所有未提交的改动**，使用 `git add -A`。提交信息遵循 **Conventional Commits** 规范（如 `feat(...)`、`refactor(...)`、`chore(deps): ...`）。
- **绝对禁止执行 Push 远程命令**（除非用户明确要求）。
- 依赖刻意保持最新（近期刚整体升级到 React 19 + Vite 8 + TS 6 + ESLint 10）。`allowBuilds` / `minimumReleaseAgeExclude` 等设置见 `pnpm-workspace.yaml`。

### 已知坑（实测踩过）

- **Mimosa hook 会把 `docs/` 构建产物当源码扫出高危误报并拦截 commit**（压缩混淆 bundle 里的正则 `.exec()` 被判「Shell 执行」）。实测 `policy init` 的默认策略（`forbidShell: true`）还会放大误报到源码——**不要 policy init**，且 `threatModel.exclusions` 对 L3 扫描范围无效（已实证）。可靠流程：**commit 前先 `rm -rf docs`**（构建产物 gitignored，随时可 `pnpm build` 重建）。若被拦截，按 hook 提示重扫放行。
- **删除 docs/ 与 git commit 必须分成两条命令执行**：Mimosa 的 commit 门在**命令执行前**就扫工作区——若把「删除 docs/」和 `git add -A && git commit` 串成同一条 `&&` 链，扫描那一刻删除尚未发生、`docs/` 仍在 → 整条命令被拦，删除也不会执行（死锁：清理命令本身被它要清理的目录触发的拦截干掉）。正确做法分两步：先按上一条的流程单独删除 `docs/` 并确认 `ls -d docs` 报不存在（该步不含 `git commit`，不会触发 commit 门），再单独执行 `git add -A && git commit`。
- **`pnpm lint` 跑不通**（预存）：装的 ESLint 8.57.1 与 `eslint.config.js` 引用的未安装依赖 `typescript-eslint` 不匹配，且 `--ext` 参数已废——验证代码用 `pnpm build`（tsc + vite）。
- 改 `package.json` 等配置文件用 Write/Edit 工具，Bash 直接写会被 Mimosa PreToolUse 拦截。

## 联系方式

作者：guohub@foxmail.com · Bilibili：@方块郭
