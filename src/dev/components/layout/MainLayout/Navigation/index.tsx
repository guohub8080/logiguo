import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useLocation } from 'react-router'
import { useWindowScroll } from "@uidotdev/usehooks"
import { useWindowSize } from "react-use"
import { BookText, BookOpen } from "lucide-react"
import { IoLogoGithub } from "react-icons/io5"
import { isUndefined } from "es-toolkit/predicate"
import logoUrl from "@assets/svgs/logoSvg/favicon.svg"
import PureText from "@assets/svgs/logoSvg/PureText.tsx"
import useGlobalSettings from "@dev/store/useGlobalSettings"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@shadcn/components/ui/sheet.tsx"
import NavigationPanel from "./NavigationPanel.tsx"
import { cn } from "@shadcn/lib/utils.ts"
import { allCards } from "@apps/Home/cardsConfig.tsx"

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const { navigationHeight, isBookTocShow, toggleBookTocShow, isBookPage, isNavigationPanelOpen, setIsNavigationPanelOpen } = useGlobalSettings()

  const [{ y: scrollY }] = useWindowScroll()

  // 宽度检测：≥640 走 Popover（宽屏浮层），<640 走 Sheet（侧边抽屉）
  const { width: winWidth } = useWindowSize()
  const isWideScreen = winWidth >= 640

  // 断点切换时强制关闭面板，避免 Popover/Sheet 争夺同一个 open 状态
  useEffect(() => {
    setIsNavigationPanelOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWideScreen])

  // 计算icon大小（导航栏高度的45%）
  const iconSize = navigationHeight * 0.45

  // 根据滚动位置判断是否显示模糊效果
  const isScrolled = scrollY > 0

  // 动态判断当前页面是否是 book 类型 - 基于全局书籍状态
  // 不需要额外判断，直接使用全局状态

  // 判断是否是 home 页面
  const isHomePage = location.pathname === '/home' || location.pathname === '/home/' || location.pathname === '/'

  // 获取当前页面 title - 从 Home 卡片配置中匹配
  const [pageTitle, setPageTitle] = useState<string>('')

  useEffect(() => {
    if (isHomePage) {
      setPageTitle('')
      return
    }

    // 从 Home 卡片配置中匹配当前路径
    const currentPath = location.pathname.replace(/^#/, '').replace(/\/$/, '') || '/'

    // 查找匹配的卡片
    const matchedCard = allCards.find(card => {
      // 处理卡片 href
      let cardPath = card.href
      // 移除开头的 # 和 /
      cardPath = cardPath.replace(/^#?\/?/, '/')
      // 确保以 / 开头
      if (!cardPath.startsWith('/')) {
        cardPath = '/' + cardPath
      }
      // 移除末尾的 /
      cardPath = cardPath.replace(/\/$/, '') || '/'

      // 精确匹配或路径匹配
      return cardPath === currentPath || currentPath.startsWith(cardPath + '/')
    })

    if (matchedCard) {
      setPageTitle(matchedCard.title)
    } else {
      // 如果找不到匹配的卡片，从路径推断
      const pathParts = location.pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        const inferredTitle = lastPart
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        setPageTitle(inferredTitle)
      } else {
        setPageTitle('')
      }
    }
  }, [location.pathname, isHomePage])

  // isNavigationPanelOpen / setIsNavigationPanelOpen 已在顶部 useGlobalSettings() 解构

  // 注：宽屏用居中 modal（毛玻璃遮罩），窄屏用 Sheet，由 isWideScreen JS 判断（断点变化时关闭面板）

  // 宽屏 modal：ESC 关闭
  useEffect(() => {
    if (!isWideScreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNavigationPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isWideScreen, setIsNavigationPanelOpen])

  // 宽屏 modal：打开时锁定 body 滚动，并用等宽 padding 顶住消失的滚动条（无空槽、无横移）
  useEffect(() => {
    if (!isWideScreen || !isNavigationPanelOpen) return
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [isWideScreen, isNavigationPanelOpen])

  return (
    <header
      className={`sticky top-0 z-50 flex w-full flex-shrink-0 items-center justify-center transition-all duration-300 relative ${isScrolled
          ? 'border-b border-border/30 backdrop-blur-[8px] bg-background/60 shadow-sm'
          : 'border-b border-transparent backdrop-blur-none bg-transparent shadow-none'
        }`}
      style={{ height: `${navigationHeight}px` }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center min-[1800px]:max-w-[1536px]">
        <div className="flex w-full items-center px-4 max-lg:gap-4 sm:px-6 lg:px-8">
          {/* Logo 区域 */}
          <div className="flex-shrink-0">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/home/'); }}>
              <div className={cn(
                "flex items-center gap-4 hover:scale-105 transition-all duration-300 cursor-pointer",
                isHomePage && !isScrolled && "opacity-0 pointer-events-none hover:scale-100 cursor-default"
              )}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-300"
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`
                  }}
                />
                <div className="h-[22px] w-auto -ml-2.5 transition-all duration-300 max-[550px]:hidden flex items-center">
                  <PureText />
                </div>
              </div>
            </a>
          </div>

          {/* 中间区域 - 页面标题或空白 */}
          <div className="flex-1"></div>

          {/* 中间居中的页面标题按钮 - fixed定位在整个屏幕中心 */}
          {!isHomePage && pageTitle && (
            <div
              className="fixed left-1/2 flex items-center justify-center pointer-events-none"
              style={{
                zIndex: 50,
                top: 0,
                height: `${navigationHeight}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* 标题按钮（宽屏触发居中 modal，窄屏触发 Sheet）+ 对应面板 */}
              {isWideScreen ? (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isNavigationPanelOpen}
                    className={cn(
                      "text-sm font-medium text-foreground hover:text-foreground transition-all duration-200",
                      "px-4 py-2 rounded-full hover:bg-accent",
                      "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "relative z-[50] flex items-center justify-center gap-2 pointer-events-auto",
                      "hover:shadow-[inset_0_0_0_1.5px_rgb(148_163_184/0.3)]",
                      // modal 打开时触发器快速淡出隐藏：不浮在毛玻璃遮罩上，也不受滚动条锁定影响
                      isNavigationPanelOpen && "opacity-0 scale-95 pointer-events-none"
                    )}
                    onClick={() => setIsNavigationPanelOpen(!isNavigationPanelOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsNavigationPanelOpen(!isNavigationPanelOpen);
                      }
                    }}
                  >
                    {(() => {
                      const matchedCard = allCards.find(card => {
                        let cardPath = card.href.replace(/^#?\/?/, '/');
                        if (!cardPath.startsWith('/')) cardPath = '/' + cardPath;
                        cardPath = cardPath.replace(/\/$/, '') || '/';
                        const currentPath = location.pathname.replace(/^#/, '').replace(/\/$/, '') || '/';
                        return cardPath === currentPath || currentPath.startsWith(cardPath + '/');
                      });
                      if (matchedCard?.icon) {
                        return (
                          <div className="w-4 h-4 flex items-center justify-center" style={{ color: matchedCard.color }}>
                            {matchedCard.icon}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="h-5 flex items-center justify-center">{pageTitle}</div>
                  </div>
                  {/* 居中 modal（iOS 风格）：全屏毛玻璃遮罩 + 居中卡片，常驻 DOM 用 opacity/scale 过渡 */}
                  {!isUndefined(document) && createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xl transition-opacity duration-300"
                        style={{
                          opacity: isNavigationPanelOpen ? 1 : 0,
                          pointerEvents: isNavigationPanelOpen ? 'auto' : 'none',
                        }}
                        onClick={() => setIsNavigationPanelOpen(false)}
                      />
                      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-label="站点导航"
                          className="pointer-events-auto w-[880px] max-w-full max-h-[82vh] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl transition-all duration-300 ease-out"
                          style={{
                            opacity: isNavigationPanelOpen ? 1 : 0,
                            transform: isNavigationPanelOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
                            pointerEvents: isNavigationPanelOpen ? 'auto' : 'none',
                          }}
                        >
                          <NavigationPanel onNavigate={() => setIsNavigationPanelOpen(false)} />
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </>
              ) : (
                <>
                  {/* 窄屏标题按钮（触发 Sheet）*/}
                  <div
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "text-sm font-medium text-foreground hover:text-foreground transition-all duration-200",
                      "px-4 py-2 rounded-full hover:bg-accent",
                      "cursor-pointer outline-none",
                      "relative z-[50] flex items-center justify-center gap-2 pointer-events-auto",
                      "hover:shadow-[inset_0_0_0_1.5px_rgb(148_163_184/0.3)]",
                      isNavigationPanelOpen && "bg-accent text-foreground shadow-[inset_0_0_0_1.5px_rgb(148_163_184/0.3)]"
                    )}
                    onClick={() => setIsNavigationPanelOpen(!isNavigationPanelOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsNavigationPanelOpen(!isNavigationPanelOpen)
                      }
                    }}
                  >
                    {(() => {
                      const matchedCard = allCards.find(card => {
                        let cardPath = card.href.replace(/^#?\/?/, '/');
                        if (!cardPath.startsWith('/')) cardPath = '/' + cardPath;
                        cardPath = cardPath.replace(/\/$/, '') || '/';
                        const currentPath = location.pathname.replace(/^#/, '').replace(/\/$/, '') || '/';
                        return cardPath === currentPath || currentPath.startsWith(cardPath + '/');
                      });
                      if (matchedCard?.icon) {
                        return (
                          <div className="w-4 h-4 flex items-center justify-center" style={{ color: matchedCard.color }}>
                            {matchedCard.icon}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="h-5 flex items-center justify-center">{pageTitle}</div>
                  </div>
                  <Sheet open={isNavigationPanelOpen} onOpenChange={setIsNavigationPanelOpen}>
                    <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto" hideClose>
                      <SheetTitle className="sr-only">导航菜单</SheetTitle>
                      <SheetDescription className="sr-only">浏览并跳转到各个功能页面</SheetDescription>
                      <NavigationPanel onNavigate={() => setIsNavigationPanelOpen(false)} />
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </div>
          )}

          {/* 右侧操作区 */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* 设置按钮 */}
            <a
              href="/settings"
              onClick={(e) => { e.preventDefault(); navigate('/settings'); }}
              className="size-6 flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="size-5" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="sr-only">Settings</span>
            </a>

            {/* GitHub 按钮 */}
            <a
              href="https://github.com/guohub8080"
              target="_blank"
              rel="noopener noreferrer"
              className="size-6 flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300 max-lg:hidden"
            >
              <IoLogoGithub className="w-5 h-5 text-foreground" />
              <span className="sr-only">Github</span>
            </a>

            {/* TOC 切换按钮 - 仅在 book 页面显示 */}
            {isBookPage && (
              <button
                onClick={toggleBookTocShow}
                className="size-6 flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300"
                title={isBookTocShow ? "隐藏目录" : "显示目录"}
              >
                {isBookTocShow ? (
                  <BookOpen className="size-5" />
                ) : (
                  <BookText className="size-5" />
                )}
                <span className="sr-only">{isBookTocShow ? "隐藏目录" : "显示目录"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}