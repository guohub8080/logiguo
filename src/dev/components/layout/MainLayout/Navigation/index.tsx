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
import { Popover, PopoverContent, PopoverTrigger, PopoverArrow } from "@shadcn/components/ui/popover.tsx"
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

  // 注：宽屏用 Popover，窄屏用 Sheet，由 isWideScreen JS 判断（断点变化时关闭面板）

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
              {/* 宽屏遮罩：常驻 + opacity 控制（打开淡入/关闭淡出，都从导航栏下方开始）*/}
              {!isUndefined(document) && createPortal(
                <>
                  {/* 模糊层：从导航栏中部开始（往上探入导航栏），mask 顶部淡出 */}
                  <div
                    className="fixed backdrop-blur-md hidden sm:block"
                    onClick={() => setIsNavigationPanelOpen(false)}
                    style={{
                      position: 'fixed',
                      top: `${navigationHeight}px`,
                      left: 0, right: 0, bottom: 0,
                      width: '100vw',
                      height: `calc(100vh - ${navigationHeight}px)`,
                      zIndex: 40,
                      pointerEvents: isNavigationPanelOpen ? 'auto' : 'none',
                      opacity: isNavigationPanelOpen ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                    aria-hidden
                  />
                  {/* 渐变层 */}
                  <div
                    className="fixed hidden sm:block"
                    onClick={() => setIsNavigationPanelOpen(false)}
                    style={{
                      position: 'fixed',
                      top: `${navigationHeight}px`,
                      left: 0, right: 0, bottom: 0,
                      width: '100vw',
                      height: `calc(100vh - ${navigationHeight}px)`,
                      zIndex: 41,
                      pointerEvents: isNavigationPanelOpen ? 'auto' : 'none',
                      opacity: isNavigationPanelOpen ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
                    }}
                  />
                </>,
                document.body
              )}
              {/* 标题按钮（宽屏触发 Popover，窄屏触发 Sheet）+ 对应面板 */}
              {isWideScreen ? (
                <Popover open={isNavigationPanelOpen} onOpenChange={setIsNavigationPanelOpen}>
                  <PopoverTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "text-sm font-medium text-foreground hover:text-foreground transition-all duration-200",
                        "px-4 py-2 rounded-full hover:bg-accent",
                        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "relative z-[50] flex items-center justify-center gap-2 pointer-events-auto",
                        isNavigationPanelOpen && "bg-accent text-foreground",
                        "hover:shadow-[inset_0_0_0_1.5px_rgb(148_163_184/0.3)]",
                        isNavigationPanelOpen && "shadow-[inset_0_0_0_1.5px_rgb(148_163_184/0.3)]"
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
                  </PopoverTrigger>
                  <PopoverContent
                    className={cn(
                      "p-0 rounded-xl border border-border/50 z-[50] bg-background/95 backdrop-blur-sm overflow-hidden",
                      "shadow-lg max-h-[80vh]",
                      "w-[860px] max-w-[92vw]",
                      "data-[state=open]:animate-in data-[state=closed]:animate-out",
                      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                      "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2"
                    )}
                    data-navigation-height={navigationHeight}
                    align="center"
                    side="bottom"
                    sideOffset={20}
                    avoidCollisions={true}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <NavigationPanel onNavigate={() => setIsNavigationPanelOpen(false)} />
                  </PopoverContent>
                </Popover>
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