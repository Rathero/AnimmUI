import { AuthenticationResponse } from '@/types/authenticationResponse';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlatformStore {
  authenticationResponse: AuthenticationResponse | undefined;
  pageTitle: string | undefined;
}

interface PlatformStoreActions {
  setAuthenticationResponse: (
    authenticationResponse: AuthenticationResponse | undefined
  ) => void;
  setPageTitle: (title: string | undefined) => void;
}

export const platformStore = create(
  persist<PlatformStore & PlatformStoreActions>(
    set => ({
      authenticationResponse: undefined,
      pageTitle: undefined,
      setAuthenticationResponse: (
        value: AuthenticationResponse | undefined
      ) => {
        set({ authenticationResponse: value });
      },
      setPageTitle: (title: string | undefined) => {
        set({ pageTitle: title });
      },
    }),
    {
      name: 'platformstorage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
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

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key === 'platformstorage') {
      try {
        const newState = JSON.parse(event.newValue || '{}');
        platformStore.setState({
          authenticationResponse: newState.state?.authenticationResponse,
        });
      } catch (error) {
        console.error('Error syncing authentication state across tabs:', error);
      }
    }
  });
}
