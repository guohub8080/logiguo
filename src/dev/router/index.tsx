import React, { lazy, Suspense } from 'react'
import { createHashRouter, Navigate, useLocation } from 'react-router'
import MainLayout from '../components/layout/MainLayout'
import Home from '../apps/Home'
import Settings from '../apps/Settings'
import { generateSvgToolFunctionsRoutes } from "@books/SvgToolFunctions/data/svgToolFunctionsLoader";
import { generateUserDocumentRoutes } from "@books/UserDocument/data/userDocumentLoader";
import { generateSvgComponentsDocRoutes } from "@books/SvgComponentsDoc/data/svgComponentsDocLoader";
import { generateMusic12DocumentRoutes } from "@books/Music12Document/data/music12DocumentLoader.tsx";
import { generateMusicTheoryDocumentRoutes } from "@books/MusicTheoryDocument/data/musicTheoryDocumentLoader.tsx";
import { generateSoundFontRoutes } from "@books/SoundFont/data/soundFontLoader.tsx";
import { generateWebDevCompsRoutes } from "@books/WebDevComps/data/webDevCompsLoader.tsx";

// 直接加载：Home、Settings、MainLayout（含 Navigation）首屏必须就位
// 其他页面懒加载
const Color = lazy(() => import('../apps/Color'))
const SvgReactConverter = lazy(() => import('../apps/SvgReactConverter'))
const About = lazy(() => import('../apps/About'))
const Mtkit = lazy(() => import('../apps/Mtkit'))
const JianpuTable = lazy(() => import('../apps/TheoryCalc/JianpuTable'))
const ShadowTool = lazy(() => import('../apps/ShadowTool'))
const Placeholder = lazy(() => import('../apps/Placeholder'))
const SlowTest = lazy(() => import('../apps/TheoryCalc/SlowTest'))

// 加载占位
const LoadingFallback = () => (
	<div className="flex items-center justify-center min-h-[60vh]">
		<div className="flex gap-2">
			<div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
			<div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
			<div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
		</div>
	</div>
)

// 懒加载包装
const Lazy = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<LoadingFallback />}>
		{children}
	</Suspense>
)

// 未匹配路由
const BadRouteRedirect: React.FC = () => {
    const location = useLocation()
    React.useEffect(() => {
        console.warn(`访问了不存在的路由: ${location.pathname}`)
    }, [location.pathname])
    return <Navigate to="/home/" replace />
}

export default createHashRouter([
    {
        path: "",
        element: <Navigate to="/home/" replace />
    },
    {
        path: "/",
        element: <MainLayout/>,
        children:  [
            {
                path: "home",
                element: <Home />
            },
            ...generateUserDocumentRoutes(),
            ...generateSvgToolFunctionsRoutes(),
            ...generateSvgComponentsDocRoutes(),
            {
                path: "settings",
                element: <Settings />
            },
            {
                path: "color",
                element: <Lazy><Color /></Lazy>
            },
            {
                path: "shadow-tool",
                element: <Lazy><ShadowTool /></Lazy>
            },
            {
                path: "svg-react",
                element: <Lazy><SvgReactConverter /></Lazy>
            },
            // ────── 音乐内容 ──────
            ...generateMusic12DocumentRoutes(),
            ...generateMusicTheoryDocumentRoutes(),
            ...generateSoundFontRoutes(),
            ...generateWebDevCompsRoutes(),
            {
                path: "about",
                element: <Lazy><About /></Lazy>
            },
            {
                path: "mtkit",
                element: <Lazy><Mtkit /></Lazy>
            },
            {
                path: "jianpu-table",
                element: <Lazy><JianpuTable /></Lazy>
            },
            {
                path: "placeholder/:title",
                element: <Lazy><Placeholder /></Lazy>
            },
            {
                path: "slow-test",
                element: <Lazy><SlowTest /></Lazy>
            }
        ]
    },
    {
        path: "*",
        element: <BadRouteRedirect />
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
    }
})
