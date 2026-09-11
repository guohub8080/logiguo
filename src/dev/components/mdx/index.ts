/**
 * MDX 组件统一导出
 * 包含组件映射、提供者和工具函数
 */

import React from 'react';
import { MDXProvider } from '@mdx-js/react';

// @mdx-js/react 未重导出 MDXComponents 类型，从 Provider 参数反推
type MDXComponentsType = NonNullable<Parameters<typeof MDXProvider>[0]['components']>;
import {
  H1, H2, H3, H4,
  Paragraph, Strong, Em, Link,
  Ul, Ol, Li,
  Code, Pre,
  Img,
  Blockquote, Hr,
  Table, Th, Td
} from './components';

// 自定义的 MDX 组件，使用 Tailwind 样式，支持深色模式
export const MDXComponents = {
  // 标题组件
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,

  // 文本组件
  p: Paragraph,
  strong: Strong,
  em: Em,
  a: Link,

  // 列表组件
  ul: Ul,
  ol: Ol,
  li: Li,

  // 代码组件
  code: Code,
  pre: Pre,

  // 布局组件
  blockquote: Blockquote,
  hr: Hr,

  // 媒体组件
  img: Img,

  // 表格组件
  table: Table,
  th: Th,
  td: Td,
};

// MDX 提供者包装器组件
interface MDXProviderWrapperProps {
  children: React.ReactNode;
}

export const MDXProviderWrapper: React.FC<MDXProviderWrapperProps> = ({ children }) => {
  return React.createElement(MDXProvider, {
    // 自定义组件的 props 是各自收窄后的类型（如 Link 仅 href/children），与 MDX 全量 props 不完全重合，运行时由 MDX 传子集
    components: MDXComponents as unknown as MDXComponentsType,
    children: React.createElement('div', { className: 'max-w-none' }, children),
  });
};

// 导出工具函数
export { extractTitleFromMDX, detectFileType, processDocumentContent, useMDXTitle } from './utils';

// 导出所有组件（按需使用）
export * from './components';

// 默认导出组件映射
export default MDXComponents;