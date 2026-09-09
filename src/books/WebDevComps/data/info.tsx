import routerPaths from '../../../dev/router/paths.ts';
import WebDevCompsIcon from './WebDevCompsIcon.tsx';

export const webDevCompsConfig = {
  title: "本站组件",
  slug: routerPaths.webDev,
  description: "本站组件使用说明",
  icon: <WebDevCompsIcon className="w-full h-full" useGradient={true} />
};

export default webDevCompsConfig;
