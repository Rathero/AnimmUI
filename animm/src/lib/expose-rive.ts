import { Rive } from '@rive-app/react-webgl2';

declare global {
  interface Window {
    __RIVE_INSTANCE__: Rive | null;
  }
}

export const exposeRiveInstance = (rive: Rive | null) => {
  if (typeof window !== 'undefined') {
    window.__RIVE_INSTANCE__ = rive;
  }
};
