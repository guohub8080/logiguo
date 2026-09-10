/** @jsxImportSource react */
/**
 * 导航面板组件 - 按 sections 分组显示所有页面入口
 *
 * 纯 CSS 流式响应：单一结构，所有尺寸/列数用 Tailwind 响应前缀表达。
 * 宽屏(≥1024) 3 列 800px，中屏(640-1024) 2 列，窄屏(<640) 1 列撑满。
 * 缩放窗口时平滑过渡，无跳变。
 */
import React, { useState } from "react"
import { useNavigate } from 'react-router'
import { Home, ChevronDown, Settings, Info } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"
import { initialCards, sections, type CardData, type Section } from "../../../../apps/Home/cardsConfig.tsx"
import { cn } from "../../../../shadcn/lib/utils.ts"
import routerPaths from "../../../../router/paths.ts"

interface NavigationPanelProps {
  onNavigate?: () => void
}

export default function NavigationPanel({ onNavigate }: NavigationPanelProps) {
  const navigate = useNavigate()

  const handleCardClick = (href: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer')
      onNavigate?.()
      return
    }
    const path = href.startsWith('/') ? href : '/' + href.replace(/^#?\/?/, '')
    navigate(path)
    onNavigate?.()
  }

  // 顶部固定项：主页 + GitHub + 设置 + 关于
  const topItems: CardData[] = [
    {
      id: 'home',
      section: 'system',
      title: '主页',
      description: '返回首页',
      icon: <Home className="w-8 h-8" />,
      href: `/${routerPaths.home}/`,
      color: '#3b82f6',
    },
    {
      id: 'github',
      section: 'system',
      title: 'GitHub',
      description: '访问项目仓库',
      icon: <IoLogoGithub className="w-8 h-8" />,
      href: 'https://github.com/guohub8080',
      color: '#24292e',
    },
    {
      id: 'settings',
      section: 'system',
      title: '设置',
      description: '个性化偏好配置',
      icon: <Settings className="w-8 h-8" />,
      href: `/${routerPaths.settings}`,
      color: '#64748b',
    },
    {
      id: 'about',
      section: 'system',
      title: '关于',
      description: '关于本项目',
      icon: <Info className="w-8 h-8" />,
      href: '/about',
      color: '#64748b',
    },
  ]

  // 子项渲染（单卡片）—— 全宽度统一风格，仅列数响应式
  const renderItem = (card: CardData) => {
    const isPlaceholder = card.status === 'placeholder'
    return (
      <div
        key={card.id}
        onClick={(e) => handleCardClick(card.href, e)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
          "hover:bg-accent transition-colors",
          "active:scale-[0.98] transition-transform",
          isPlaceholder && "opacity-60"
        )}
      >
        <div
          className="shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 [&_svg]:w-full [&_svg]:h-full"
          style={{ color: card.color }}
        >
          {card.icon}
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <p className="m-0 font-medium text-sm truncate leading-tight">{card.title}</p>
          <p className="m-0 text-muted-foreground text-xs truncate leading-tight">{card.description}</p>
        </div>
      </div>
    )
  }

  // 可折叠分组组件
  const CollapsibleSection = ({ section, items }: { section: Section; items: CardData[] }) => {
    const [collapsed, setCollapsed] = useState(false)
    if (items.length === 0) return null
    const readyCount = items.filter(i => i.status !== 'placeholder').length
    return (
      <div className="mt-4 first:mt-0">
        {/* 分组头：accent 色图标 + 标题 + 计数，底部细线贯穿做分割 */}
        <div
          className="flex items-center gap-2 px-1 pb-1.5 border-b border-border/50 cursor-pointer select-none"
          onClick={() => setCollapsed(c => !c)}
        >
          <span className="flex items-center justify-center w-4 h-4 [&_svg]:w-full [&_svg]:h-full" style={{ color: section.accent }}>
            {section.icon}
          </span>
          <span className="text-xs font-semibold text-foreground">{section.name}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {items.length} 项{readyCount < items.length && ` · ${readyCount} 可用`}
          </span>
          <ChevronDown
            className={cn("w-3.5 h-3.5 ml-auto text-muted-foreground transition-transform duration-300", collapsed && "-rotate-90")}
          />
        </div>
        {/* grid-rows 0fr↔1fr 高度过渡动画 */}
        <div className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}>
          <div className="overflow-hidden min-h-0">
            <div className="grid gap-1 pt-2 pb-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {items.map(renderItem)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      // 容器：宽屏 Popover 限高 78vh，窄屏 Sheet 里不限高（由 SheetContent 控制滚动）
      "p-4 bg-background/95 backdrop-blur-sm overflow-y-auto",
      "max-h-[100svh] sm:max-h-[78vh]"
    )}>
      {/* 顶部固定项 */}
      <div className="grid gap-1 pb-3 border-b border-border/60 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {topItems.map(renderItem)}
      </div>

      {/* 按分区分组（排除 system，已在顶部）*/}
      {sections.filter(s => s.id !== 'system').map(section => {
        const items = initialCards.filter(c => c.section === section.id)
        return <CollapsibleSection key={section.id} section={section} items={items} />
      })}
    </div>
  )
}
