// export const CACHE_KEYS = {
//   publicProfile: (username: string) => `profile:${username.toLowerCase()}`,
// };

// export const CACHE_KEYS = {
//   publicProfile: (username: string) => `profile:${username.toLowerCase()}`,

//   profileLock: (username: string) => `lock:profile:${username.toLowerCase()}`,
// };

export const CACHE_KEYS = {
  publicProfile: (username: string) => `profile:${username.toLowerCase()}`,

  profileLock: (username: string) => `lock:profile:${username.toLowerCase()}`,

  analytics: (userId: string) => `analytics:${userId}`,
};
