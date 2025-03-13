import { AuthenticationResponse } from '@/types/authenticationResponse';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlatformStore {
  authenticationResponse: AuthenticationResponse | undefined;
}

interface PlatformStoreActions {
  setAuthenticationResponse: (
    authenticationResponse: AuthenticationResponse | undefined
  ) => void;
}

export const platformStore = create(
  persist<PlatformStore & PlatformStoreActions>(
    set => ({
      authenticationResponse: undefined,
      setAuthenticationResponse: (
        value: AuthenticationResponse | undefined
      ) => {
        set({ authenticationResponse: value });
      },
    }),
    {
      name: 'platformstorage',
      version: 3,
      storage: createJSONStorage(() => sessionStorage),
      migrate: persistedState => {
        const state = persistedState as PlatformStore & PlatformStoreActions;
        state.authenticationResponse = undefined;
        return {
          ...state,
        };
      },
    }
  )
);
