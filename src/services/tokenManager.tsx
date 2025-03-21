
export const setAuthToken = (token: string): void => {
    localStorage.setItem("token", token);
  };
  export const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };
  export const removeAuthToken = (): void => {
    localStorage.removeItem("token");
  };
  export const setUserId = (userId: string): void => {
    localStorage.setItem("user_id", userId);
  };
  export const getUserId = (): string | null => {
    return localStorage.getItem("user_id");
  };
  export const removeUserId = (): void => {
    localStorage.removeItem("user_id");
  };
  