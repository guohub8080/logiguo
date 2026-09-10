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
import { Home, ChevronDown, Settings, Info, LayoutGrid } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"
import { initialCards, sections, type CardData } from "../../../../apps/Home/cardsConfig.tsx"
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

  // 分组卡片：圆角边框卡片 + 头部（accent 图标/标题/计数/折叠）+ 内容网格
  // 与首页 SectionBlock 的「每个分区一张卡」视觉语言一致，卡片边界即分组分割
  const PanelSection = ({
    icon, title, meta, accent, collapsible = true, children,
  }: {
    icon: React.ReactNode
    title: string
    meta?: string
    accent: string
    collapsible?: boolean
    children: React.ReactNode
  }) => {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 select-none",
            collapsible && "cursor-pointer"
          )}
          onClick={() => collapsible && setCollapsed(c => !c)}
        >
          <span className="flex items-center justify-center w-4 h-4 [&_svg]:w-full [&_svg]:h-full" style={{ color: accent }}>
            {icon}
          </span>
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {meta && <span className="text-[10px] text-muted-foreground tabular-nums">{meta}</span>}
          {collapsible && (
            <ChevronDown
              className={cn("w-3.5 h-3.5 ml-auto text-muted-foreground transition-transform duration-300", collapsed && "-rotate-90")}
            />
          )}
        </div>
        {/* grid-rows 0fr↔1fr 高度过渡动画 */}
        <div className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}>
          <div className="overflow-hidden min-h-0">
            <div className="border-t border-border/70 px-1.5 py-1.5 grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      // 容器：灰底衬托白色分组卡（iOS 设置面板范式；foreground 6% 保证浅/暗主题下都有足够对比），宽屏 Popover 限高 78vh，窄屏 Sheet 不限高
      "p-3 space-y-3 bg-foreground/[0.06] backdrop-blur-sm overflow-y-auto",
      "max-h-[100svh] sm:max-h-[78vh]"
    )}>
      {/* 顶部固定项 —— 与下方分组同构的卡片，消除突兀 */}
      <PanelSection icon={<LayoutGrid />} title="快捷操作" accent="#64748b" collapsible={false}>
        {topItems.map(renderItem)}
      </PanelSection>

      {/* 按分区分组（排除 system，已在顶部）*/}
      {sections.filter(s => s.id !== 'system').map(section => {
        const items = initialCards.filter(c => c.section === section.id)
        if (items.length === 0) return null
        const readyCount = items.filter(i => i.status !== 'placeholder').length
        return (
          <PanelSection
            key={section.id}
            icon={section.icon}
            title={section.name}
            meta={`${items.length} 项${readyCount < items.length ? ` · ${readyCount} 可用` : ''}`}
            accent={section.accent}
          >
            {items.map(renderItem)}
          </PanelSection>
        )
      })}
    </div>
  )
}
