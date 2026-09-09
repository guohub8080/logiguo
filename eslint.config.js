import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// ESLint 9 flat config（替代原 package.json 内联的 eslintConfig）
export default tseslint.config(
  // 全局忽略：构建产物、vite 构建辅助文件、备份文件、类型声明文件（多为生成/第三方）、字体处理脚本
  { ignores: ['dist/**', 'docs/**', 'node_modules/**', 'src/dev/vite-dev/**', '**/*.backup.{ts,tsx}', '**/*.d.ts', 'src/dev/assets/fonts/nodeScript/**'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // react-hooks：React 正确性核心规则（v7 recommended）
      ...reactHooks.configs.recommended.rules,
      // v7 新增的激进规则：在 effect 中 setState 初始化、闭包中引用后声明的函数、
      // 渲染期调用 Math.random 等都是常见/安全模式（且 shadcn 生成代码大量命中），
      // 暂时关闭，后续可逐步收紧
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',

      // 以下规则按项目现状放宽（代码库此前未做严格 lint，strict=false）
      // react-refresh：仅导出组件是 HMR 便利规则而非正确性问题，全局禁用以避免大量噪音
      'react-refresh/only-export-components': 'off',
      // 代码中存在大量历史 mixed-spaces-and-tabs disable，不强制检查
      'no-mixed-spaces-and-tabs': 'off',
      // 与 tsconfig 的 noUnusedLocals=false 保持一致
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // 项目大量使用 any（strict=false），不强制
      '@typescript-eslint/no-explicit-any': 'off',
      // 代码有意使用 @ts-ignore
      '@typescript-eslint/ban-ts-comment': 'off',
      // 新增规则，对历史代码库过于严苛，后续可逐步启用
      'preserve-caught-error': 'off',
      'no-unused-private-class-members': 'off',
      'no-useless-assignment': 'off',
    },
  },
)
