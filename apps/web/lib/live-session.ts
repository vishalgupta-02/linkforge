const LIVE_SESSION_KEY = "linkflow_live_session";

export const getLiveSessionId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId = sessionStorage.getItem(LIVE_SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    sessionStorage.setItem(LIVE_SESSION_KEY, sessionId);
  }

  return sessionId;
};
