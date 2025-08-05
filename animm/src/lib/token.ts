import { platformStore } from '@/stores/platformStore';

export const useToken = () => {
  const { setAuthenticationResponse, authenticationResponse } = platformStore(
    state => state
  );

  const isValidToken = () => {
    const hasResponse = authenticationResponse != undefined;
    const isExpired = isTokenExpired();
    const isValid = hasResponse && !isExpired;

    return isValid;
  };

  const isTokenExpired = () => {
    if (!authenticationResponse) return true;
    const refreshTokenExpiryTimestamp =
      getRefreshTokenExpiryTimestamp() + 60 * 1000;
    const currentTimestamp = Date.now();
    const expired = refreshTokenExpiryTimestamp <= currentTimestamp;

    return expired;
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
