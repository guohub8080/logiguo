/**
 * 路由路径常量定义
 * 用于统一管理所有静态路由路径，避免硬编码
 */
const routerPaths = {
  // 首页
  home: "home",

  // 设置页面
  settings: "settings",

  // 关于页面
  about: "about",

  // 占位页（开发中的功能统一跳到这里）
  placeholder: "placeholder",

  // SVG 文档
  userDoc: "user_doc",
  svgToolFunctions: "svg-tool-functions",

  // SVG组件文档
  svgComponentsDoc: "svg_components_doc",

  // 本站组件（WebDevComps）
  webDev: "web-dev",

  // 工具
  shadowTool: "shadow-tool",

  // 音乐相关
  music12: "music12",
  musicTheory: "music-theory",
  soundFont: "sound-font",
  mtkit: "mtkit",
  jianpuTable: "jianpu-table",

  // 前端相关
  color: "color",

  // 外部链接
  github: "https://github.com/guohub8080/logiguo",
} as const;

export default routerPaths;

// 导出类型定义，方便TypeScript使用
export type RouterPath = typeof routerPaths[keyof typeof routerPaths];