import React, { ReactNode } from "react";
import { RouteObject, Navigate } from 'react-router';
import BookLayout from '../../../dev/components/layout/BookLayout';
import ArticleContent from '../../../dev/components/layout/BookLayout/ArticleContent.tsx';
import { BookLayoutConfigProvider } from '../../../dev/components/layout/BookLayout/internal/BookLayoutContext.tsx';
import { webDevCompsConfig } from './info.tsx';
import type { LucideIcon } from "lucide-react";
import type { BookLoader, BookCategory, BookArticle } from '../../../dev/components/layout/BookLayout/types/BookLoader.ts';
import { globalSettingsStore } from '../../../dev/store/useGlobalSettings';
import { MDXProviderWrapper, detectFileType } from '../../../dev/components/mdx/index.ts';

export interface DocumentExport {
    title: string;
    jsx: ReactNode;
    fileType?: 'tsx' | 'md' | 'mdx';
}

export interface CategoryInfo {
    icon?: LucideIcon;
    slug: string;
}

const allModules = import.meta.glob<{ default: any; title?: string }>(
  "../**/*.{tsx,md,mdx}",
  { eager: true }
);

const documentModules = Object.fromEntries(
  Object.entries(allModules).filter(([path]) =>
    path.startsWith("../") &&
    !/\/info\.tsx$/.test(path)
  )
);

const categoryInfoModules = import.meta.glob<{ default: CategoryInfo }>(
  "../**/info.tsx",
  { eager: true }
);

export interface DocumentCategory {
  categoryName: string;
  categoryPath: string;
  categoryOrder: number;
  articles: DocumentItem[];
  icon?: any;
}

export interface DocumentItem {
  title: string;
  routePath: string;
  order: number;
  content: ReactNode;
  fileName: string;
}

function parseFolderName(folderName: string): { order: number; name: string } {
  const match = folderName.match(/^\[(\d+)\](.+)$/);
  if (!match) {
    throw new Error(`文件夹名称格式错误: "${folderName}"，期望格式: [x]名称`);
  }
  return { order: parseInt(match[1], 10), name: match[2] };
}

function parseFileName(fileName: string): { order: number; slug: string } | null {
  const nameWithoutExt = fileName.replace(/\.(tsx|md|mdx)$/, '');
  const match = nameWithoutExt.match(/^\[(\d+)\](.+)$/);
  if (!match) return null;
  return { order: parseInt(match[1], 10), slug: match[2] };
}

function parsePath(path: string): { categoryFolder: string; fileName: string } | null {
  const match = path.match(/^\.\.\/([^/]+)\/(.+)\.(tsx|md|mdx)$/);
  if (!match) return null;

  const categoryFolder = match[1];
  const middle = match[2];
  const ext = match[3];

  // 子文件夹结构: ../[xx]分类/[x]文章/index.mdx → 只有 index 文件被解析
  const slashIndex = middle.lastIndexOf('/');
  if (slashIndex !== -1) {
    const fileName = middle.substring(slashIndex + 1);
    if (fileName !== 'index') return null;
    return { categoryFolder, fileName: `${middle.substring(0, slashIndex)}.${ext}` };
  }

  return { categoryFolder, fileName: `${middle}.${ext}` };
}

function groupAndSortDocuments(): DocumentCategory[] {
  const categoryMap = new Map<string, {
    info: ReturnType<typeof parseFolderName>;
    articles: DocumentItem[];
    slug: string;
    icon?: any;
  }>();
  const urlMap = new Map<string, string>();

  Object.entries(documentModules).forEach(([path, module]) => {
    const parsed = parsePath(path);
    if (!parsed) return;
    const { categoryFolder, fileName } = parsed;
    const fileInfo = parseFileName(fileName);
    if (!fileInfo) return;

    const document = module.default;
    const fileType = detectFileType(fileName);
    let categoryInfo;
    try {
      categoryInfo = parseFolderName(categoryFolder);
    } catch (error) {
      throw new Error(`解析文件夹名称失败: ${path}\n${(error as Error).message}`);
    }

    let title: string;
    let jsxContent: React.ReactNode;

    if (fileType === 'md' || fileType === 'mdx') {
      title = (module as any).title || fileName.replace(/\.(md|mdx)$/, '').replace(/^\[\d+\]/, '') || '未命名文档';
      const MDXComponent = document;
      jsxContent = React.createElement(MDXComponent);
    } else {
      title = document.title;
      jsxContent = document.jsx;
    }

    const categoryInfoPath = Object.keys(categoryInfoModules).find(p => p.includes(`/${categoryFolder}/info.tsx`));
    const folderInfo = categoryInfoPath ? categoryInfoModules[categoryInfoPath].default : undefined;
    if (!folderInfo?.slug) {
      throw new Error(`分类 ${categoryFolder} 缺少 info.tsx 中的必填 slug 字段`);
    }
    const categoryPathSlug = String(folderInfo.slug).trim().replace(/^\/+|\/+$/g, '');
    const routePath = `${categoryPathSlug}/${fileInfo.slug}`;

    const fullUrl = `${webDevCompsConfig.slug}/${routePath}`;
    if (urlMap.has(fullUrl)) {
      throw new Error(`重复 URL: ${fullUrl}\n文件1: ${urlMap.get(fullUrl)}\n文件2: ${path}`);
    }
    urlMap.set(fullUrl, path);

    let content: ReactNode;
    if (fileType === 'md' || fileType === 'mdx') {
      content = <MDXProviderWrapper>{jsxContent}</MDXProviderWrapper>;
    } else {
      content = jsxContent;
    }

    const documentItem: DocumentItem = { title, routePath, order: fileInfo.order, content, fileName };

    if (!categoryMap.has(categoryFolder)) {
      categoryMap.set(categoryFolder, {
        info: categoryInfo,
        articles: [],
        slug: categoryPathSlug,
        icon: folderInfo.icon
      });
    }
    categoryMap.get(categoryFolder)!.articles.push(documentItem);
  });

  const categories: DocumentCategory[] = [];
  categoryMap.forEach(({ info, articles, slug, icon }) => {
    categories.push({
      categoryName: info.name,
      categoryPath: slug,
      categoryOrder: info.order,
      articles: articles.sort((a, b) => a.order - b.order),
      icon
    });
  });
  categories.sort((a, b) => a.categoryOrder - b.categoryOrder);
  return categories;
}

export const webDevCompsCategories = groupAndSortDocuments();
export const allWebDevCompsDocuments = webDevCompsCategories.flatMap(cat => cat.articles);

const webDevCompsLoader: BookLoader = {
  config: {
    title: webDevCompsConfig.title,
    slug: webDevCompsConfig.slug,
    icon: () => webDevCompsConfig.icon,
    description: webDevCompsConfig.description
  },

  categories: webDevCompsCategories,

  getAllArticles(): BookArticle[] {
    return allWebDevCompsDocuments;
  },

  getCurrentArticle(path: string): BookArticle | null {
    const normalizedPath = path.toLowerCase().replace(/^\/+|\/+$/g, '');
    return allWebDevCompsDocuments.find(article =>
      article.routePath.toLowerCase() === normalizedPath
    ) || null;
  },

  getNavigationData() {
    return { categories: webDevCompsCategories, allArticles: allWebDevCompsDocuments };
  },

  initializeBookState() {
    globalSettingsStore.getState().setIsBookPage(true);
  }
};

export function generateWebDevCompsRoutes(): RouteObject[] {
  return [
    {
      path: webDevCompsConfig.slug,
      element: (
        <BookLayoutConfigProvider basePrefix={`/${webDevCompsConfig.slug}`}>
          <BookLayout loader={webDevCompsLoader} />
        </BookLayoutConfigProvider>
      ),
      children: [
        {
          index: true,
          element: allWebDevCompsDocuments.length > 0
            ? <DebugRedirect to={allWebDevCompsDocuments[0].routePath} />
            : <div className="p-6 text-center text-muted-foreground">暂无文章</div>,
        },
        ...webDevCompsCategories.flatMap((category) =>
          category.articles.map((article) => ({
            path: article.routePath,
            element: <ArticleContent loader={webDevCompsLoader}>{article.content}</ArticleContent>,
          }))
        ),
      ],
    },
  ];
}

function DebugRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}
