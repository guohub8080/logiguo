/** @jsxImportSource react */
/**
 * Home 页面卡片配置
 *
 * 站点定位：逻辑郭（LogiGuo）—— 逻辑、数学与代码的工具箱（由 guookcase 复制改造）
 * 分区（section）：站点（本站部署镜像）→ 语言学习 / 写作积累（主轴）→ 其他工具
 * GitHub 仓库与关于作者不设卡片：分别由导航栏右上角猫标 / ⓘ（home 页）承载
 * 每个分区有若干子项（CardData），子项可以是 ready（真实功能）或 placeholder（占位，开发中）。
 */
import React from "react"
import { BookOpen, Info, Wrench, PenLine, Globe } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"

// 黑色圆徽章底（Vercel 等单色标用，与 Hero 操作条圆形按钮同风格）
const RoundBadge = ({ children }: { children: React.ReactNode }) => (
	<span className="w-full h-full flex items-center justify-center rounded-full bg-[#181717] text-white">
		<span className="w-[18px] h-[18px]">{children}</span>
	</span>
)

const CloudflareIcon = () => (
	<svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
		<path fill="#f38020" d="M87.295 89.022c.763-2.617.472-5.015-.8-6.796c-1.163-1.635-3.125-2.58-5.488-2.689l-44.737-.581c-.291 0-.545-.145-.691-.363s-.182-.509-.109-.8c.145-.436.581-.763 1.054-.8l45.137-.581c5.342-.254 11.157-4.579 13.192-9.885l2.58-6.723c.109-.291.145-.581.073-.872c-2.906-13.158-14.644-22.97-28.672-22.97c-12.938 0-23.913 8.359-27.838 19.952a13.35 13.35 0 0 0-9.267-2.58c-6.215.618-11.193 5.597-11.811 11.811c-.145 1.599-.036 3.162.327 4.615C10.104 70.051 2 78.337 2 88.549c0 .909.073 1.817.182 2.726a.895.895 0 0 0 .872.763h82.57c.472 0 .909-.327 1.054-.8z"/>
		<path fill="#faae40" d="M101.542 60.275c-.4 0-.836 0-1.236.036c-.291 0-.545.218-.654.509l-1.744 6.069c-.763 2.617-.472 5.015.8 6.796c1.163 1.635 3.125 2.58 5.488 2.689l9.522.581c.291 0 .545.145.691.363s.182.545.109.8c-.145.436-.581.763-1.054.8l-9.924.582c-5.379.254-11.157 4.579-13.192 9.885l-.727 1.853c-.145.363.109.727.509.727h34.089c.4 0 .763-.254.872-.654c.581-2.108.909-4.325.909-6.614c0-13.447-10.975-24.422-24.458-24.422"/>
	</svg>
)
const VercelIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
		<path fill="currentColor" d="M23 20.048H1L12 0.752z"/>
	</svg>
)
const NetlifyIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
		<path fill="#00bfa5" d="m11.25 2.232l-.127.127v4.567l.127.129h1.526l.126-.13V2.36l-.126-.127H11.25zM6.69 5.455L5.643 6.5v.21l1.6 1.6h1.108l.148-.148V7.055l-1.6-1.6zM1.026 11.11l-.127.127v1.528l.127.127h6.09l.127-.127v-1.528l-.127-.127zm15.858 0l-.127.127v1.528l.127.127h6.09l.127-.127v-1.528l-.127-.127zm-9.64 4.58l-1.6 1.6v.21l1.045 1.046h.21l1.6-1.6v-1.109l-.148-.146zm4.005 1.256l-.127.13v4.566l.127.127h1.526l.126-.127v-4.567l-.126-.129z"/>
		<path fill="#00897b" d="M14.855 15.172h-1.523l-.127-.127V11.48c0-.634-.249-1.125-1.013-1.142c-.394-.01-.844 0-1.325.019l-.072.074v4.61l-.127.128H9.146l-.128-.127V8.956l.128-.127h3.425a2.41 2.41 0 0 1 2.41 2.41v3.806z"/>
	</svg>
)
import routerPaths from "@dev/router/paths.ts"

// 卡片数据结构
export interface CardData {
	id: string
	section: SectionId
	title: string
	description: React.ReactNode
	icon: React.ReactNode
	href: string
	color: string
	status?: "ready" | "placeholder" // 默认 'ready'
}

// 分区定义
export type SectionId = "sites" | "lang-learn" | "writing" | "other-tools" | "system"

export interface Section {
	id: SectionId
	name: string
	accent: string // 标题竖条 + 图标颜色
	icon: React.ReactNode
}

export const sections: Section[] = [
	{
		id: "sites",
		name: "镜像部署",
		accent: "#F59E0B",
		icon: <Globe className="w-4 h-4" />,
	},
	{
		id: "lang-learn",
		name: "语言学习",
		accent: "#7C3AED",
		icon: <BookOpen className="w-4 h-4" />,
	},
	{
		id: "writing",
		name: "写作积累",
		accent: "#F97316",
		icon: <PenLine className="w-4 h-4" />,
	},
	{
		id: "other-tools",
		name: "其他工具",
		accent: "#06B6D4",
		icon: <Wrench className="w-4 h-4" />,
	},
	{
		id: "system",
		name: "设置",
		accent: "#64748B",
		icon: <Info className="w-4 h-4" />,
	},
]

// 占位项的 href 工具
const placeholderHref = (title: string) =>
	`/${routerPaths.placeholder}/${encodeURIComponent(title)}`

// 通用占位图标（小齿轮）
const PlaceholderIcon = () => (
	<svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
)

// ============================================================
// 站点 —— logiguo 本站的各部署镜像 + GitHub 仓库 + 关于作者（通用导航）
// ============================================================
const sitesReady: CardData[] = [
	{
		id: "mirror-github-pages",
		section: "sites",
		title: "GitHub Pages",
		description: "guohub8080.github.io/logiguo",
		icon: <IoLogoGithub />,
		href: "https://guohub8080.github.io/logiguo/",
		color: "#181717",
	},
	{
		id: "mirror-cloudflare",
		section: "sites",
		title: "Cloudflare",
		description: "logiguo.pages.dev",
		icon: <CloudflareIcon />,
		href: "https://logiguo.pages.dev",
		color: "#F38020",
	},
	{
		id: "mirror-netlify",
		section: "sites",
		title: "Netlify",
		description: "logiguo.netlify.app",
		icon: <NetlifyIcon />,
		href: "https://logiguo.netlify.app",
		color: "#00BFA5",
	},
	{
		id: "mirror-vercel",
		section: "sites",
		title: "Vercel",
		description: "logiguo.vercel.app",
		icon: <RoundBadge><VercelIcon /></RoundBadge>,
		href: "https://logiguo.vercel.app",
		color: "#181717",
	},
]

// ============================================================
// 语言学习 —— 主定位之一（内容规划中，暂全占位）
// ============================================================
const langLearnPlaceholders: CardData[] = [
	["词汇积累", "生词本与记忆曲线"],
	["语法笔记", "语法点归纳与例句"],
	["精读摘录", "文章精读与批注"],
	["外刊阅读", "外刊素材归档"],
	["听力素材", "听写与影子跟读记录"],
	["翻译练习", "双语对照与复盘"],
	["口语跟读", "发音矫正记录"],
	["每日一句", "句子收藏与用法注解"],
].map(([title, desc], i) => ({
	id: `lang-learn-ph-${i}`,
	section: "lang-learn" as SectionId,
	title,
	description: desc,
	icon: <PlaceholderIcon />,
	href: placeholderHref(title),
	color: "#94a3b8",
	status: "placeholder" as const,
}))

// ============================================================
// 写作积累 —— 主定位之二（内容规划中，暂全占位）
// ============================================================
const writingPlaceholders: CardData[] = [
	["素材库", "可复用的写作素材"],
	["佳句摘抄", "好句子收藏与点评"],
	["随笔集", "日常随笔与草稿"],
	["选题灵感", "选题池与展开思路"],
	["文体仿写", "按文体拆解仿写"],
	["复盘周记", "写作复盘与改进清单"],
].map(([title, desc], i) => ({
	id: `writing-ph-${i}`,
	section: "writing" as SectionId,
	title,
	description: desc,
	icon: <PlaceholderIcon />,
	href: placeholderHref(title),
	color: "#94a3b8",
	status: "placeholder" as const,
}))


// ============================================================
// 其他工具
// ============================================================
const otherToolsReady: CardData[] = [
	{
		id: "color",
		section: "other-tools",
		title: "色彩工具",
		description: "色彩搭配和调色板工具",
		icon: (
			<svg className="w-9 h-9" viewBox="-120 -120 1264 1264" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path d="M21.424 767.942c-11.778 0-21.308 9.56-21.308 21.338v213.294c0 11.78 9.53 21.308 21.308 21.308h981.086c11.808 0 21.372-9.53 21.372-21.308V789.28c0-11.778-9.562-21.338-21.372-21.338H21.424z" fill="#FF6600" />
				<path d="M996.512 652.438L914.844 455.39c-4.498-10.874-16.996-16.06-27.868-11.53L0.118 811.212v110.974l42.116 101.696h113.224l829.498-343.578c10.87-4.498 16.056-16.964 11.556-27.866z" fill="#FFCC00" />
				<path d="M0.118 947.212l76.67 76.67h102.976l657.35-657.318c8.308-8.342 8.308-21.838 0-30.18l-150.842-150.81c-8.31-8.342-21.806-8.342-30.148 0L0.118 841.612v105.6z" fill="#66DD33" />
				<path d="M0.118 981.424l102.476 42.458h110.974l367.354-886.89c4.53-10.872-.624-23.37-11.53-27.868L372.344 27.518c-10.872-4.53-23.37.656-27.868 11.53L0.118 870.48v110.944z" fill="#6699FF" />
				<path d="M0.118 1002.574c0 11.78 9.53 21.308 21.308 21.308H234.69c11.81 0 21.37-9.53 21.37-21.308V21.458c0-11.78-9.56-21.34-21.37-21.34H21.424C9.646.118.116 9.678.116 21.458v981.116z" fill="#9966FF" />
			</svg>
		),
		href: routerPaths.color,
		color: "#FF6600",
	},
]

// 系统 —— 设置
// system 分区不参与任何渲染（Home/导航面板都排除），仅靠 allCards 为导航栏中间标题提供
// 「特殊 app」的标题+图标匹配（/settings、/about 这类不在常规分组的页面）
const systemReady: CardData[] = [
	{
		id: "settings",
		section: "system",
		title: "设置",
		description: "个性化偏好配置",
		// 彩色双色齿轮（原版填充图标，用于 /settings 页中间标题等特殊场景；导航栏按钮仍为线条齿轮）
		icon: (
			<svg viewBox="0 0 1024 1024" className="w-5 h-5" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden>
				<path d="M844.8 580.267c2.133-14.934 4.267-29.867 4.267-46.934s-2.134-32-4.267-46.933l96-68.267c8.533-6.4 12.8-19.2 6.4-29.866L853.333 230.4c-6.4-10.667-17.066-14.933-27.733-8.533l-106.667 49.066c-25.6-19.2-51.2-34.133-81.066-46.933L627.2 106.667c-2.133-10.667-10.667-19.2-21.333-19.2H422.4c-10.667 0-21.333 8.533-21.333 19.2L390.4 224c-29.867 12.8-57.6 27.733-81.067 46.933l-106.666-49.066c-10.667-4.267-23.467 0-27.734 8.533L83.2 388.267c-6.4 10.666-2.133 23.466 6.4 29.866l96 68.267c-2.133 14.933-4.267 29.867-4.267 46.933s2.134 32 4.267 46.934L85.333 648.533c-8.533 6.4-12.8 19.2-6.4 29.867l91.734 157.867c6.4 10.666 17.066 14.933 27.733 8.533l106.667-49.067c25.6 19.2 51.2 34.134 81.066 46.934L396.8 960c2.133 10.667 10.667 19.2 21.333 19.2H601.6c10.667 0 21.333-8.533 21.333-19.2L633.6 842.667c29.867-12.8 57.6-27.734 81.067-46.934L821.333 844.8c10.667 4.267 23.467 0 27.734-8.533L940.8 678.4c6.4-10.667 2.133-23.467-6.4-29.867l-89.6-68.266zM512 746.667c-117.333 0-213.333-96-213.333-213.334S394.667 320 512 320s213.333 96 213.333 213.333-96 213.334-213.333 213.334z" fill="#607D8B" />
				<path d="M512 277.333c-140.8 0-256 115.2-256 256s115.2 256 256 256 256-115.2 256-256-115.2-256-256-256zM512 640c-59.733 0-106.667-46.933-106.667-106.667S452.267 426.667 512 426.667 618.667 473.6 618.667 533.333 571.733 640 512 640z" fill="#455A64" />
			</svg>
		),
		href: routerPaths.settings,
		color: "#607D8B",
	},
	{
		id: "about",
		section: "system",
		title: "关于",
		description: "关于作者",
		// 彩色蓝底 ⓘ（品牌图标，用于 /about 页中间标题等特殊场景）
		icon: (
			<svg viewBox="0 0 1024 1024" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
				<path d="M512.034133 512.034133m-485.0688 0a485.0688 485.0688 0 1 0 970.1376 0 485.0688 485.0688 0 1 0-970.1376 0Z" fill="#278BED" />
				<path d="M512 1024a512 512 0 1 1 512-512 512.580267 512.580267 0 0 1-512 512z m0-970.103467a458.103467 458.103467 0 1 0 458.103467 458.103467 458.6496 458.6496 0 0 0-458.103467-458.103467z" fill="#278BED" />
				<path d="M512 840.9088a41.233067 41.233067 0 0 1-43.2128-38.877867v-340.8896a41.198933 41.198933 0 0 1 43.2128-38.843733 41.1648 41.1648 0 0 1 43.2128 38.843733v340.8896a41.198933 41.198933 0 0 1-43.2128 38.877867z" fill="#FFFFFF" />
				<path d="M512 273.2032m-66.491733 0a66.491733 66.491733 0 1 0 132.983466 0 66.491733 66.491733 0 1 0-132.983466 0Z" fill="#FFFFFF" />
			</svg>
		),
		href: "/about",
		color: "#278BED",
	},
]

// ============================================================
// 聚合
// ============================================================

export const initialCards: CardData[] = [
	...sitesReady,
	...langLearnPlaceholders,
	...writingPlaceholders,
	...otherToolsReady,
	...systemReady,
]

// 兼容：Navigation 组件用它匹配当前页面标题
export const allCards = initialCards
