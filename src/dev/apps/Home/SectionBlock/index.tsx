/** @jsxImportSource react */
/**
 * 首页分区区块组件
 *
 * 一个带强调色标题的卡片容器，内部用网格列出该分区的所有子项（小卡片）。
 * 头部右侧有折叠按钮，点击收起/展开内容（带高度过渡动画）。
 */
import React, { useState } from "react"
import { Card } from "@shadcn/components/ui/card.tsx"
import { Badge } from "@shadcn/components/ui/badge.tsx"
import { ChevronDown } from "lucide-react"
import { cn } from "@shadcn/lib/utils.ts"
import type { CardData, Section } from "../cardsConfig.tsx"

interface SectionBlockProps {
	section: Section
	items: CardData[]
	onItemClick: (href: string) => void
}

const SectionBlock = ({ section, items, onItemClick }: SectionBlockProps) => {
	const readyCount = items.filter((i) => i.status !== "placeholder").length
	const [collapsed, setCollapsed] = useState(false)

	return (
		<Card className="overflow-hidden gap-0 py-0">
			{/* 标题栏：加重底色（macOS 风格，不透明确保不发红）*/}
			<div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-neutral-100 dark:bg-neutral-800">
				<span className="flex items-center justify-center" style={{ color: section.accent }}>
					{section.icon}
				</span>
				<h2 className="text-sm font-semibold tracking-tight m-0 cursor-pointer select-none" onClick={() => setCollapsed(c => !c)}>
					{section.name}
				</h2>
				<span className="ml-auto text-xs text-muted-foreground tabular-nums">
					{items.length} 项{readyCount < items.length && ` · ${readyCount} 可用`}
				</span>
				{/* 折叠按钮 */}
				<button
					onClick={() => setCollapsed(c => !c)}
					className="ml-1 flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
					aria-label={collapsed ? "展开" : "收起"}
				>
					<ChevronDown
						className={cn("w-4 h-4 transition-transform duration-300", collapsed && "-rotate-90")}
					/>
				</button>
			</div>

			{/* 内容区：用 grid-template-rows 0fr↔1fr 做高度过渡动画 */}
			<div
				className={cn(
					"grid transition-[grid-template-rows] duration-300 ease-in-out",
					collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
				)}
			>
				{/* overflow-hidden 包裹层（grid 子元素必须 min-height:0 才能正确收缩） */}
				<div className="overflow-hidden min-h-0">
					{/* 子项网格：最窄 1 列，宽屏封顶 4 列。横竖都有分隔线 */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-border/50">
						{items.map((item) => {
							const isPlaceholder = item.status === "placeholder"
							return (
								<div
									key={item.id}
									onClick={() => onItemClick(item.href)}
									className={cn(
										"group relative flex items-center gap-3 px-4 py-4 cursor-pointer",
										"border-b border-r border-border/50",
										"hover:bg-foreground/[0.06] active:bg-foreground/[0.1] transition-colors duration-150"
									)}
								>
									{/* 图标（垂直居中，强制内部 svg 自适应容器尺寸） */}
									<div
										className="shrink-0 w-7 h-7 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 [&_svg]:w-full [&_svg]:h-full"
										style={{ color: item.color }}
									>
										{item.icon}
									</div>

									{/* 标题 + 描述（垂直居中，文字截断） */}
									<div className="flex-1 min-w-0">
										<p className={cn(
											"m-0 text-sm font-medium leading-tight truncate",
											isPlaceholder ? "text-muted-foreground" : "text-foreground"
										)}>{item.title}</p>
										<p className="m-0 text-xs text-muted-foreground leading-snug truncate mt-0.5">
											{item.description}
										</p>
									</div>

									{/* 占位标记 */}
									{isPlaceholder && (
										<Badge variant="outline" className="shrink-0 text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
											开发中
										</Badge>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</Card>
	)
}

export default SectionBlock
