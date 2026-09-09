/** @jsxImportSource react */
/**
 * 首页 - 分区卡片布局
 *
 * 分区（语言学习 / 写作积累 / 音乐与创作 / 其他工具 / 关于&设置），
 * 每个分区是一个带强调色竖条标题的卡片容器，内部用紧凑网格列出子项。
 */
import React from "react"
import { useNavigate } from 'react-router'
import { Settings as SettingsIcon, Info } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"
import Hero from "./Hero"
import SectionBlock from "./SectionBlock"
import { sections, initialCards } from "./cardsConfig.tsx"
import { cn } from "@shadcn/lib/utils.ts"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@shadcn/components/ui/tooltip.tsx"
import routerPaths from "@dev/router/paths.ts"

// 系统操作条（Hero 下方专属引导，不混在普通分区里）
const systemActions = [
	{
		id: "settings",
		label: "设置",
		icon: <SettingsIcon className="w-4 h-4" />,
		href: `/${routerPaths.settings}`,
	},
	{
		id: "about",
		label: "关于作者",
		icon: <Info className="w-4 h-4" />,
		href: "/about",
	},
	{
		id: "github",
		label: "GitHub",
		icon: <IoLogoGithub className="w-4 h-4" />,
		href: "https://github.com/guohub8080/logiguo",
	},
]

export default function Home() {
	const navigate = useNavigate()

	const handleCardClick = (href: string) => {
		// 外部链接：新窗口打开
		if (href.startsWith("http")) {
			window.open(href, "_blank", "noopener,noreferrer")
			return
		}
		// 占位页是绝对路径 /placeholder/...，直接 navigate
		// 其他内部链接按 hash 路由处理
		const path = href.startsWith("/") ? href : "/" + href.replace(/^#?\/?/, "")
		navigate(path)
	}

	return (
		<>
			<div className="container mx-auto max-w-6xl relative z-10 pb-20 px-4">
				<Hero />

				{/* 副标题（苹果官网风格：中等字号、Regular、近主色、居中、呼吸感） */}
				<p className="mt-4 text-center text-xl font-normal tracking-tight text-foreground/70 mx-8">
					<span className="whitespace-nowrap">逻辑、数学与代码的</span><span className="whitespace-nowrap">一站式工具箱</span>
				</p>

				{/* 操作条：系统 icon 按钮（居中） */}
					<div className="mt-6 flex items-center justify-center gap-2.5">
					{/* 系统按钮：圆形 icon（无文字） */}
					{systemActions.map((action) => (
						<TooltipProvider key={action.id} delayDuration={200}>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => handleCardClick(action.href)}
										className={cn(
											"group inline-flex items-center justify-center w-10 h-10 rounded-full",
											"backdrop-blur-xl backdrop-saturate-150",
											"bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/15",
											"shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]",
											"dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
											"text-foreground/70 hover:text-foreground",
											"hover:bg-white/60 dark:hover:bg-white/20 hover:scale-[1.06]",
											"transition-all duration-200"
										)}
									>
										<span className="transition-transform duration-200 group-hover:scale-110">
											{action.icon}
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" className="text-xs">
									{action.label}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					))}
				</div>

				{/* 内容分区列表（排除 system，它在操作条） */}
				<div className="mt-6 space-y-6">
					{sections.filter((s) => s.id !== "system").map((section) => (
						<SectionBlock
							key={section.id}
							section={section}
							items={initialCards.filter((c) => c.section === section.id)}
							onItemClick={handleCardClick}
						/>
					))}
				</div>
			</div>

			{/* 页脚 */}
			<footer className="w-full bg-neutral-800 text-neutral-300">
				<div className="mx-auto max-w-4xl px-6 py-16">
					<div className="flex flex-col items-center gap-5 text-xs text-neutral-400">
						{/* 品牌 */}
						<span className="text-sm font-semibold text-neutral-200 tracking-wide">LogiGuo</span>
						<span className="text-center leading-relaxed max-w-xs text-neutral-500">
							逻辑郭 ——
								<br />
							逻辑、数学与代码的工具箱（建设中）
						</span>

						{/* 部署镜像 */}
						<div className="flex flex-col items-center gap-2 mt-6">
							<span className="text-neutral-300 font-medium">部署地址</span>
							<div className="flex flex-wrap items-center justify-center gap-1.5">
								{[
										{ name: "GitHub Pages", url: "https://guohub8080.github.io/logiguo/" },
										{ name: "Cloudflare Pages", url: "https://logiguo.pages.dev" },
										{ name: "Netlify", url: "https://logiguo.netlify.app" },
										{ name: "Vercel", url: "https://logiguo.vercel.app" },
									].map((mirror) => (
									<a key={mirror.url} href={mirror.url} target="_blank" rel="noreferrer" className="px-3 py-0.5 rounded-full border border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors">
										{mirror.name}
									</a>
								))}
							</div>
						</div>

						{/* 作者 */}
						<div className="flex flex-col items-center gap-2 mt-8">
							<svg viewBox="0 0 480 554" className="w-5 h-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg">
								<path d="M53.253,199.859L53.253,384.338L213.026,476.578L213.026,292.114L53.253,199.859ZM186.4,30.746L239.667,0L479.32,138.366L479.32,169.113L266.279,292.114L266.294,476.592L426.052,384.338L426.052,322.845L319.546,384.338L319.546,322.845L479.305,230.606L479.32,415.085L239.667,553.451L0,415.085L0,138.366L26.641,122.986L239.667,245.987L399.426,153.747L186.4,30.746Z" fill="currentColor" fillRule="nonzero" />
							</svg>
							<span className="text-[11px] text-neutral-600">Built by guohub8080 · Bilibili @方块郭</span>
						</div>
					</div>
				</div>
			</footer>
		</>
	)
}
