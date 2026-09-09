/** @jsxImportSource react */
import React, { useState, useEffect } from "react"

export default function SlowTest() {
	const [ready, setReady] = useState(false)
	useEffect(() => {
		const timer = setTimeout(() => setReady(true), 2000)
		return () => clearTimeout(timer)
	}, [])
	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			{ready ? (
				<div>
					<h1 className="text-2xl font-bold mb-4">慢加载测试页</h1>
					<p>这个页面故意延迟了 2 秒才显示内容。</p>
				</div>
			) : (
				<p className="text-center text-muted-foreground py-20">组件内部延迟中...</p>
			)}
		</div>
	)
}
