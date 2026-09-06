"use client";

import { useEffect, useState } from "react";

export const useLiveVisitors = (username: string, isPro: boolean = false) => {
  const [visitors, setVisitors] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // If username is empty or user is not on PRO plan, do NOT connect EventSource
    if (!username || !isPro) {
      setConnected(false);
      setVisitors(0);
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const eventSource = new EventSource(
      `${backendUrl}/api/v1/live/${encodeURIComponent(username)}/stream`,
      {
        withCredentials: true,
      },
    );

    const handleVisitors = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setVisitors(data.visitors ?? 0);
        setConnected(true);
      } catch (err) {
        console.error("Failed to parse live visitor SSE event:", err);
      }
    };

    eventSource.addEventListener("visitors", handleVisitors);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.removeEventListener("visitors", handleVisitors);
      eventSource.close();
      setConnected(false);
    };
  }, [username, isPro]);

  return {
    visitors,
    connected,
  };
};

