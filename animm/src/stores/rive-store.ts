import { create } from 'zustand';
import { Rive } from '@rive-app/react-canvas';

interface RiveStore {
  riveInstance: Rive | null;
  setRiveInstance: (rive: Rive | null) => void;
}

export const useRiveStore = create<RiveStore>(set => ({
  riveInstance: null,
  setRiveInstance: rive => set({ riveInstance: rive }),
}));
