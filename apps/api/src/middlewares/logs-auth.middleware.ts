import type { Request, Response, NextFunction } from "express";

export const REQUIRED_LOGS_USERNAME = "codemonkey";

export function getExpectedLogsPassword(): string {
  return (
    process.env.LOGS_VIEWER_PASSWORD ||
    process.env.ADMIN_LOGS_PASSWORD ||
    "codemonkey123"
  );
}

export function verifyLogsCredentials(username?: string | null, password?: string | null): boolean {
  if (!username || !password) return false;
  const expectedPassword = getExpectedLogsPassword();
  return (
    username.trim().toLowerCase() === REQUIRED_LOGS_USERNAME.toLowerCase() &&
    password.trim() === expectedPassword.trim()
  );
}

export const logsAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Check HTTP Basic Auth: Authorization: Basic base64(user:pass)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const b64 = authHeader.slice(6).trim();
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const [user, ...passParts] = decoded.split(":");
      const pass = passParts.join(":");
      if (verifyLogsCredentials(user, pass)) {
        return next();
      }
    } catch {
      // invalid basic header
    }
  }

  // 2. Check Custom Headers: x-logs-username & x-logs-password
  const headerUser = req.headers["x-logs-username"] as string;
  const headerPass = req.headers["x-logs-password"] as string;
  if (headerUser && headerPass && verifyLogsCredentials(headerUser, headerPass)) {
    return next();
  }

  // 3. Check Cookie or Bearer Token (token format: base64(codemonkey:password))
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      }),
    );
    const token = cookies["lf_logs_auth"];
    if (token) {
      try {
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [user, ...passParts] = decoded.split(":");
        if (verifyLogsCredentials(user, passParts.join(":"))) {
          return next();
        }
      } catch {
        // invalid cookie
      }
    }
  }

  // 4. Check Query parameters for direct browser viewing (e.g. ?user=codemonkey&pass=...)
  const queryUser = (req.query.user || req.query.username) as string;
  const queryPass = (req.query.pass || req.query.password) as string;
  if (queryUser && queryPass && verifyLogsCredentials(queryUser, queryPass)) {
    return next();
  }

  // If requesting the UI directly (GET /admin/logs), let it pass through to render login form or challenge
  const isApiRequest = req.path.startsWith("/api/") || req.headers.accept?.includes("application/json");

  if (isApiRequest) {
    res.setHeader("WWW-Authenticate", 'Basic realm="LinkForge Logs Viewer"');
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Requires username 'codemonkey' and valid LOGS_VIEWER_PASSWORD.",
    });
  }

  // For Web UI page, return 401 with WWW-Authenticate header so browser Basic Auth or UI login modal handles it
  res.setHeader("WWW-Authenticate", 'Basic realm="LinkForge Logs Viewer"');
  return res.status(401).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Unauthorized</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="background:#09090b;color:#f4f4f5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#18181b;padding:32px;border-radius:12px;border:1px solid #27272a;max-width:400px;text-align:center;">
          <h2 style="color:#ef4444;margin-top:0;">Access Restricted</h2>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.5;">Requires username <code>codemonkey</code> and your configured password.</p>
          <a href="/admin/logs" style="display:inline-block;margin-top:16px;padding:8px 16px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">Try Again</a>
        </div>
      </body>
    </html>
  `);
};
