/** @jsxImportSource react */
/**
 * 统一占位页 - 所有「开发中」的功能卡片点击后跳到这里
 *
 * 从 URL 参数 /:title 取功能名称展示。
 */
import React from "react"
import { useParams, useNavigate } from 'react-router'
import { Button } from "@shadcn/components/ui/button.tsx"
import { Card, CardContent } from "@shadcn/components/ui/card.tsx"

const Placeholder = () => {
	const { title } = useParams<{ title: string }>()
	const navigate = useNavigate()
	const displayName = title ? decodeURIComponent(title) : "该功能"

	return (
		<div className="flex items-center justify-center min-h-[70vh] px-6">
			<Card className="max-w-md w-full text-center border-border/60 shadow-sm">
				<CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-5">
					{/* 构建中图标 */}
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-primary"
						>
							<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
						</svg>
					</div>

					<div className="flex flex-col gap-1.5">
						<h2 className="text-lg font-semibold m-0">{displayName}</h2>
						<p className="text-sm text-muted-foreground m-0 leading-relaxed">
							此功能正在开发中，敬请期待
						</p>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/home/")}
						className="mt-2"
					>
						← 返回首页
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}

export default Placeholder
