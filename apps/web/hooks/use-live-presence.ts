"use client";

import { useEffect, useRef } from "react";
import { getLiveSessionId } from "../lib/live-session";

const HEARTBEAT_INTERVAL = 30_000;

export const useLivePresence = (username: string) => {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const sessionId = getLiveSessionId();
    if (!sessionId) {
      return;
    }

    sessionIdRef.current = sessionId;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

    const join = async () => {
      try {
        await fetch(
          `${backendUrl}/api/v1/live/${encodeURIComponent(username)}/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
            }),
            keepalive: true,
          },
        );
      } catch (error) {
        console.error("Failed to join live presence:", error);
      }
    };

    const heartbeat = async () => {
      try {
        await fetch(
          `${backendUrl}/api/v1/live/${encodeURIComponent(username)}/heartbeat`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
            }),
            keepalive: true,
          },
        );
      } catch (error) {
        console.error("Live heartbeat failed:", error);
      }
    };

    void join();

    const interval = window.setInterval(heartbeat, HEARTBEAT_INTERVAL);

    const handleUnload = () => {
      const url = `${backendUrl}/api/v1/live/${encodeURIComponent(username)}/leave`;
      const body = JSON.stringify({
        sessionId,
      });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          url,
          new Blob([body], {
            type: "application/json",
          }),
        );
      } else {
        fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [username]);
};
