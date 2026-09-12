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
import { Home, ChevronDown, Settings, Info, X } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"
import { initialCards, sections, type CardData } from "../../../../apps/Home/cardsConfig.tsx"
import { cn } from "../../../../shadcn/lib/utils.ts"
import routerPaths from "../../../../router/paths.ts"

interface NavigationPanelProps {
  onNavigate?: () => void
  /** 关闭整个导航面板（右上角 X；不传则不显示，如窄屏 Sheet 自带关闭） */
  onClose?: () => void
}

export default function NavigationPanel({ onNavigate, onClose }: NavigationPanelProps) {
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
      // 彩色双色齿轮（与 /settings 页中间标题同款；导航栏按钮仍为线条齿轮）
      icon: (
        <svg viewBox="0 0 1024 1024" className="w-8 h-8" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M844.8 580.267c2.133-14.934 4.267-29.867 4.267-46.934s-2.134-32-4.267-46.933l96-68.267c8.533-6.4 12.8-19.2 6.4-29.866L853.333 230.4c-6.4-10.667-17.066-14.933-27.733-8.533l-106.667 49.066c-25.6-19.2-51.2-34.133-81.066-46.933L627.2 106.667c-2.133-10.667-10.667-19.2-21.333-19.2H422.4c-10.667 0-21.333 8.533-21.333 19.2L390.4 224c-29.867 12.8-57.6 27.733-81.067 46.933l-106.666-49.066c-10.667-4.267-23.467 0-27.734 8.533L83.2 388.267c-6.4 10.666-2.133 23.466 6.4 29.866l96 68.267c-2.133 14.933-4.267 29.867-4.267 46.933s2.134 32 4.267 46.934L85.333 648.533c-8.533 6.4-12.8 19.2-6.4 29.867l91.734 157.867c6.4 10.666 17.066 14.933 27.733 8.533l106.667-49.067c25.6 19.2 51.2 34.134 81.066 46.934L396.8 960c2.133 10.667 10.667 19.2 21.333 19.2H601.6c10.667 0 21.333-8.533 21.333-19.2L633.6 842.667c29.867-12.8 57.6-27.734 81.067-46.934L821.333 844.8c10.667 4.267 23.467 0 27.734-8.533L940.8 678.4c6.4-10.667 2.133-23.467-6.4-29.867l-89.6-68.266zM512 746.667c-117.333 0-213.333-96-213.333-213.334S394.667 320 512 320s213.333 96 213.333 213.333-96 213.334-213.333 213.334z" fill="#607D8B" />
          <path d="M512 277.333c-140.8 0-256 115.2-256 256s115.2 256 256 256 256-115.2 256-256-115.2-256-256-256zM512 640c-59.733 0-106.667-46.933-106.667-106.667S452.267 426.667 512 426.667 618.667 473.6 618.667 533.333 571.733 640 512 640z" fill="#455A64" />
        </svg>
      ),
      href: `/${routerPaths.settings}`,
      color: '#607D8B',
    },
    {
      id: 'about',
      section: 'system',
      title: '关于',
      description: '关于本项目',
      // 彩色蓝底 ⓘ（品牌图标，与导航栏关于按钮同款）
      icon: (
        <svg viewBox="0 0 1024 1024" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M512.034133 512.034133m-485.0688 0a485.0688 485.0688 0 1 0 970.1376 0 485.0688 485.0688 0 1 0-970.1376 0Z" fill="#278BED" />
          <path d="M512 1024a512 512 0 1 1 512-512 512.580267 512.580267 0 0 1-512 512z m0-970.103467a458.103467 458.103467 0 1 0 458.103467 458.103467 458.6496 458.6496 0 0 0-458.103467-458.103467z" fill="#278BED" />
          <path d="M512 840.9088a41.233067 41.233067 0 0 1-43.2128-38.877867v-340.8896a41.198933 41.198933 0 0 1 43.2128-38.843733 41.1648 41.1648 0 0 1 43.2128 38.843733v340.8896a41.198933 41.198933 0 0 1-43.2128 38.877867z" fill="#FFFFFF" />
          <path d="M512 273.2032m-66.491733 0a66.491733 66.491733 0 1 0 132.983466 0 66.491733 66.491733 0 1 0-132.983466 0Z" fill="#FFFFFF" />
        </svg>
      ),
      href: '/about',
      color: '#278BED',
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
  // title 为空 = 无头模式（如快捷操作卡：上方已有 modal 大标题，不再重复分组头）
  const PanelSection = ({
    icon, title, meta, accent, collapsible = true, children,
  }: {
    icon?: React.ReactNode
    title?: string
    meta?: string
    accent?: string
    collapsible?: boolean
    children: React.ReactNode
  }) => {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
        {title && (
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
        )}
        {/* grid-rows 0fr↔1fr 高度过渡动画 */}
        <div className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}>
          <div className="overflow-hidden min-h-0">
            <div className={cn(
              "px-1.5 py-1.5 grid gap-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
              title && "border-t border-border/70"
            )}>
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      // 容器：灰底衬托白色分组卡（iOS 设置面板范式；foreground 6% 保证浅/暗主题下都有足够对比）
      // 头部固定，内容区单一滚动（避免双滚动条）
      "flex flex-col bg-foreground/[0.06] max-h-[100svh] sm:max-h-[78vh]"
    )}>
      {/* 头部：居中标题 + 右上角关闭 */}
      <div className="pt-3 pb-1.5 px-3 flex items-center justify-between shrink-0">
        {/* 左侧占位，保证标题视觉居中 */}
        <span className="w-7 h-7" aria-hidden="true" />
        <h2 className="m-0 text-sm font-semibold text-foreground">导航</h2>
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="关闭导航"
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] active:bg-foreground/[0.12] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-7 h-7" aria-hidden="true" />
        )}
      </div>
      {/* 内容滚动区（唯一的滚动条在这里） */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 pt-1">
        <div className="space-y-2">
          {/* 顶部固定项 —— 无头卡片（上方已有 modal 大标题，不重复分组头） */}
          <PanelSection collapsible={false}>
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
      </div>
    </div>
  )
}
