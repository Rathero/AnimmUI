import { platformStore } from '@/stores/platformStore';

export const useToken = () => {
  const { setAuthenticationResponse, authenticationResponse } = platformStore(
    state => state
  );

  const isValidToken = () => {
    return authenticationResponse != undefined && !isTokenExpired();
  };

  const isTokenExpired = () => {
    if (!authenticationResponse) return true;
    const refreshTokenExpiryTimestamp =
      getRefreshTokenExpiryTimestamp() + 60 * 1000;
    const currentTimestamp = Date.now();
    return refreshTokenExpiryTimestamp <= currentTimestamp;
  };

  const getRefreshTokenExpiryTimestamp = () =>
    new Date(authenticationResponse!.expiry).getTime();

  const clearUserLoginResponse = () => setAuthenticationResponse(undefined);

  return {
    isValidToken,
    isTokenExpired,
    getRefreshTokenExpiryTimestamp,
    clearUserLoginResponse,
  };
};
