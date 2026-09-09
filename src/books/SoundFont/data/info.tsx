import React from 'react';
import SoundFontIcon from './SoundFontIcon.tsx';
import routerPaths from '../../../dev/router/paths.ts';

/**
 * SoundFont 文档配置
 */
export const soundFontConfig = {
  title: 'SoundFont',
  slug: routerPaths.soundFont,
  description: '查看 SoundFont 原理和相关推荐',
  icon: <SoundFontIcon className="w-8 h-8" />
};

export default soundFontConfig;
