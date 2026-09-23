import { UAParser } from "ua-parser-js";

export interface DeepLinkResult {
  isMobile: boolean;
  appScheme: string | null;
  fallbackUrl: string;
  platformName: string | null;
}

export function resolveDeepLink(url: string, userAgent: string): DeepLinkResult {
  const parser = new UAParser(userAgent);
  const os = parser.getOS().name?.toLowerCase() || "";
  const isIOS = os.includes("ios") || os.includes("iphone") || os.includes("ipad");
  const isAndroid = os.includes("android");
  const isMobile = isIOS || isAndroid;

  if (!isMobile) {
    return {
      isMobile: false,
      appScheme: null,
      fallbackUrl: url,
      platformName: null,
    };
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. YouTube
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      let videoId: string | null = null;
      if (host.includes("youtu.be")) {
        videoId = pathname.slice(1);
      } else if (pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      }

      if (videoId) {
        return {
          isMobile: true,
          appScheme: isAndroid ? `vnd.youtube:${videoId}` : `youtube://watch?v=${videoId}`,
          fallbackUrl: url,
          platformName: "YouTube",
        };
      }

      // Channel / User
      if (pathname.startsWith("/@")) {
        return {
          isMobile: true,
          appScheme: `youtube://${host}${pathname}`,
          fallbackUrl: url,
          platformName: "YouTube",
        };
      }
    }

    // 2. Spotify
    if (host.includes("spotify.com")) {
      const parts = pathname.split("/").filter(Boolean);
      // /track/:id, /album/:id, /playlist/:id, /artist/:id
      if (parts.length >= 2 && ["track", "album", "artist", "playlist", "episode", "show"].includes(parts[0])) {
        const type = parts[0];
        const id = parts[1];
        return {
          isMobile: true,
          appScheme: `spotify:${type}:${id}`,
          fallbackUrl: url,
          platformName: "Spotify",
        };
      }
    }

    // 3. Instagram
    if (host.includes("instagram.com")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length === 1 && !["explore", "reels", "direct", "stories"].includes(parts[0])) {
        const username = parts[0];
        return {
          isMobile: true,
          appScheme: `instagram://user?username=${username}`,
          fallbackUrl: url,
          platformName: "Instagram",
        };
      }
    }

    // 4. Twitter / X
    if (host.includes("twitter.com") || host.includes("x.com")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length === 1 && !["home", "explore", "notifications", "messages"].includes(parts[0])) {
        const screenName = parts[0];
        return {
          isMobile: true,
          appScheme: `twitter://user?screen_name=${screenName}`,
          fallbackUrl: url,
          platformName: "Twitter / X",
        };
      }
    }

    // 5. Twitch
    if (host.includes("twitch.tv")) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length === 1 && !["directory", "videos", "settings"].includes(parts[0])) {
        const channel = parts[0];
        return {
          isMobile: true,
          appScheme: `twitch://stream/${channel}`,
          fallbackUrl: url,
          platformName: "Twitch",
        };
      }
    }

    // 6. Discord
    if (host.includes("discord.gg")) {
      const code = pathname.slice(1);
      if (code) {
        return {
          isMobile: true,
          appScheme: `discord://invite/${code}`,
          fallbackUrl: url,
          platformName: "Discord",
        };
      }
    }
  } catch {
    // URL parsing failed, return default
  }

  return {
    isMobile: true,
    appScheme: null,
    fallbackUrl: url,
    platformName: null,
  };
}

export function generateDeepLinkTrampolineHtml(
  appScheme: string,
  fallbackUrl: string,
  platformName: string,
): string {
  // Safe escaping
  const safeAppScheme = JSON.stringify(appScheme);
  const safeFallbackUrl = JSON.stringify(fallbackUrl);
  const safePlatformName = platformName.replace(/[<>&"]/g, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Opening ${safePlatformName} — LinkForge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid #27272a;
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 19px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
    p { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
    .btn {
      display: block;
      background: #f4f4f5;
      color: #09090b;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .btn:active { opacity: 0.85; }
    .footer { margin-top: 24px; font-size: 11px; color: #71717a; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Opening ${safePlatformName}...</h2>
    <p>Launching in native app for the best experience. If nothing opens, tap below.</p>
    <a href=${safeFallbackUrl} class="btn" id="manualBtn">Continue in Browser</a>
  </div>
  <div class="footer">Powered by LinkForge Edge</div>

  <script>
    (function() {
      var appScheme = ${safeAppScheme};
      var fallbackUrl = ${safeFallbackUrl};
      var hasHidden = false;

      document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
          hasHidden = true;
        }
      });

      // Try triggering native app scheme
      window.location.href = appScheme;

      // Fallback to web URL if app didn't capture within 650ms
      setTimeout(function() {
        if (!hasHidden) {
          window.location.replace(fallbackUrl);
        }
      }, 650);
    })();
  </script>
</body>
</html>`;
}
