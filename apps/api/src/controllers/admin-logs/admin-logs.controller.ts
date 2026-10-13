import type { Request, Response } from "express";
import { LogModel, type LogCategoryType, type LogLevelType } from "../../models/log.model.ts";
import { isMongooseConnected, connectMongoose } from "../../lib/mongoose.ts";
import { verifyLogsCredentials, REQUIRED_LOGS_USERNAME } from "../../middlewares/logs-auth.middleware.ts";

async function ensureMongooseConnected(): Promise<boolean> {
  if (isMongooseConnected()) return true;
  await connectMongoose();
  return isMongooseConnected();
}

export const authLogsController = async (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (verifyLogsCredentials(username, password)) {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    res.cookie("lf_logs_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });
    return res.status(200).json({
      success: true,
      message: `Authenticated as ${REQUIRED_LOGS_USERNAME}`,
      token,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password. Username must be 'codemonkey'.",
  });
};

export const getLogsController = async (req: Request, res: Response) => {
  if (!(await ensureMongooseConnected())) {
    return res.status(503).json({
      success: false,
      message: "MongoDB logs database is not connected or currently initializing.",
      data: [],
      pagination: { total: 0, page: 1, limit: 50, pages: 0 },
    });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Filter by Level
    if (req.query.level && req.query.level !== "all") {
      const levels = (req.query.level as string).split(",").map((l) => l.trim().toLowerCase());
      query.level = { $in: levels };
    }

    // Filter by Category (classified & diversified)
    if (req.query.category && req.query.category !== "all") {
      const categories = (req.query.category as string).split(",").map((c) => c.trim().toLowerCase());
      query.category = { $in: categories };
    }

    // Filter by Service
    if (req.query.service && req.query.service !== "all") {
      query.service = req.query.service;
    }

    // Filter by TraceId (OpenTelemetry distributed trace correlation)
    if (req.query.traceId) {
      query.traceId = String(req.query.traceId).trim();
    }

    // Filter by RequestId
    if (req.query.requestId) {
      query.requestId = String(req.query.requestId).trim();
    }

    // Filter by UserId
    if (req.query.userId) {
      query.userId = String(req.query.userId).trim();
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), "i");
      query.$or = [
        { message: searchRegex },
        { route: searchRegex },
        { clientIp: searchRegex },
        { "error.message": searchRegex },
        { "error.name": searchRegex },
      ];
    }

    // Date range
    if (req.query.startDate || req.query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (req.query.startDate) dateFilter.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) dateFilter.$lte = new Date(req.query.endDate as string);
      query.timestamp = dateFilter;
    }

    const [total, logs] = await Promise.all([
      LogModel.countDocuments(query),
      LogModel.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to query MongoDB logs",
      error: error?.message || String(error),
    });
  }
};

export const getLogStatsController = async (_req: Request, res: Response) => {
  if (!(await ensureMongooseConnected())) {
    return res.status(503).json({
      success: false,
      message: "MongoDB logs database is not connected",
      stats: null,
    });
  }

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalLogs, last24hLogs, levelCounts, categoryCounts, serviceCounts, recentErrors] =
      await Promise.all([
        LogModel.countDocuments(),
        LogModel.countDocuments({ timestamp: { $gte: oneDayAgo } }),
        LogModel.aggregate([
          { $group: { _id: "$level", count: { $sum: 1 } } },
        ]),
        LogModel.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
        LogModel.aggregate([
          { $group: { _id: "$service", count: { $sum: 1 } } },
        ]),
        LogModel.find({ level: { $in: ["error", "fatal"] } })
          .sort({ timestamp: -1 })
          .limit(5)
          .select("timestamp message error route statusCode service traceId")
          .lean(),
      ]);

    const formattedLevels = Object.fromEntries(levelCounts.map((l) => [l._id, l.count]));
    const formattedCategories = Object.fromEntries(categoryCounts.map((c) => [c._id, c.count]));
    const formattedServices = Object.fromEntries(serviceCounts.map((s) => [s._id, s.count]));

    return res.status(200).json({
      success: true,
      stats: {
        totalLogs,
        last24hLogs,
        levelCounts: formattedLevels,
        categoryCounts: formattedCategories,
        serviceCounts: formattedServices,
        recentErrors,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to aggregate log stats",
      error: error?.message || String(error),
    });
  }
};

export const getTraceTimelineController = async (req: Request, res: Response) => {
  if (!(await ensureMongooseConnected())) {
    return res.status(503).json({ success: false, message: "MongoDB logs database not connected" });
  }

  const { traceId } = req.params;
  if (!traceId) {
    return res.status(400).json({ success: false, message: "TraceId parameter is required" });
  }

  try {
    const items = await LogModel.find({ traceId })
      .sort({ timestamp: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      traceId,
      totalEvents: items.length,
      data: items,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trace timeline",
      error: error?.message || String(error),
    });
  }
};

export const getLogByIdController = async (req: Request, res: Response) => {
  if (!(await ensureMongooseConnected())) {
    return res.status(503).json({ success: false, message: "MongoDB logs database not connected" });
  }

  try {
    const log = await LogModel.findById(req.params.id).lean();
    if (!log) {
      return res.status(404).json({ success: false, message: "Log record not found" });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch log record", error: error?.message });
  }
};

// Interactive Web UI Dashboard Access Point
export const renderLogsViewerUiController = (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkForge Logs & Tracing Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --card: #12141c;
      --card-border: #1e2230;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --info: #38bdf8;
      --warn: #fbbf24;
      --error: #f43f5e;
      --success: #34d399;
      --mono: 'JetBrains Mono', monospace;
      --sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: rgba(18, 20, 28, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .badge-icon {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .title { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
    .status-pill {
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(52, 211, 153, 0.1);
      color: var(--success);
      border: 1px solid rgba(52, 211, 153, 0.2);
    }
    .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); box-shadow: 0 0 8px var(--success); }
    .user-pill {
      font-size: 12px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: var(--mono);
      font-weight: 600;
    }
    main { flex: 1; padding: 24px; max-width: 1440px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px 16px;
    }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
    .stat-val { font-size: 24px; font-weight: 700; font-family: var(--mono); }
    .controls-panel {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
    .search-input {
      flex: 1;
      min-width: 240px;
      background: #090a0f;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 9px 14px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--mono);
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    select, .btn {
      background: #090a0f;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      outline: none;
    }
    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      font-weight: 600;
    }
    .btn-primary:hover { background: var(--accent-hover); }
    .table-container {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .log-row {
      border-bottom: 1px solid rgba(30, 34, 48, 0.7);
      padding: 10px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-family: var(--mono);
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .log-row:hover { background: rgba(255, 255, 255, 0.02); }
    .log-time { color: var(--muted); min-width: 82px; font-size: 11px; padding-top: 2px; }
    .badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.3px;
      min-width: 48px;
      text-align: center;
    }
    .badge-info { background: rgba(56, 189, 248, 0.15); color: var(--info); border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-warn { background: rgba(251, 191, 36, 0.15); color: var(--warn); border: 1px solid rgba(251, 191, 36, 0.3); }
    .badge-error { background: rgba(244, 63, 94, 0.15); color: var(--error); border: 1px solid rgba(244, 63, 94, 0.3); }
    .badge-debug { background: rgba(148, 163, 184, 0.15); color: var(--muted); border: 1px solid rgba(148, 163, 184, 0.3); }
    .cat-badge {
      background: rgba(99, 102, 241, 0.12);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.25);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .cat-otel { background: rgba(236, 72, 153, 0.15); color: #f472b6; border-color: rgba(236, 72, 153, 0.3); }
    .cat-http { background: rgba(34, 197, 94, 0.15); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
    .cat-worker { background: rgba(249, 115, 22, 0.15); color: #fb923c; border-color: rgba(249, 115, 22, 0.3); }
    .log-msg { flex: 1; word-break: break-all; line-height: 1.5; color: #e2e8f0; }
    .log-details {
      display: none;
      background: #090a0f;
      border-top: 1px dashed var(--card-border);
      padding: 12px 16px;
      margin-top: 8px;
      border-radius: 6px;
      font-family: var(--mono);
      font-size: 11px;
    }
    pre { white-space: pre-wrap; word-break: break-all; color: #cbd5e1; }
    .trace-link { color: #818cf8; text-decoration: underline; cursor: pointer; }
    .trace-link:hover { color: #c7d2fe; }
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--card);
      border-top: 1px solid var(--card-border);
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-area">
      <span class="badge-icon">LF</span>
      <span class="title">LinkForge Trace & MongoDB Logs Explorer</span>
      <span class="status-pill"><span class="pulse-dot"></span> Live Ingestion</span>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="user-pill">User: codemonkey</span>
      <button class="btn" onclick="fetchLogs()">⟳ Refresh</button>
    </div>
  </header>

  <main>
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card"><div class="stat-label">Total Logs</div><div class="stat-val" id="totalCount">-</div></div>
      <div class="stat-card"><div class="stat-label">Last 24 Hours</div><div class="stat-val" id="last24hCount">-</div></div>
      <div class="stat-card"><div class="stat-label" style="color:var(--error);">Errors</div><div class="stat-val" style="color:var(--error);" id="errorCount">-</div></div>
      <div class="stat-card"><div class="stat-label" style="color:#f472b6;">OTel Spans</div><div class="stat-val" style="color:#f472b6;" id="otelCount">-</div></div>
      <div class="stat-card"><div class="stat-label" style="color:#4ade80;">HTTP Requests</div><div class="stat-val" style="color:#4ade80;" id="httpCount">-</div></div>
    </div>

    <div class="controls-panel">
      <input type="text" id="searchInput" class="search-input" placeholder="Search message, URL, IP, trace ID, stack trace..." onkeydown="if(event.key==='Enter') fetchLogs()">
      
      <select id="levelSelect" onchange="fetchLogs()">
        <option value="all">Level: All</option>
        <option value="error,fatal">Errors & Fatal</option>
        <option value="warn">Warnings</option>
        <option value="info">Info</option>
        <option value="debug">Debug</option>
      </select>

      <select id="catSelect" onchange="fetchLogs()">
        <option value="all">Category: All</option>
        <option value="http">HTTP Requests</option>
        <option value="otel_span">OpenTelemetry Spans</option>
        <option value="otel_event">OTel Events/Exceptions</option>
        <option value="worker">BullMQ Workers</option>
        <option value="auth">Better-Auth</option>
        <option value="database">Database / Prisma / Redis</option>
        <option value="security">Security & Rate Limiting</option>
        <option value="system">System & Cron</option>
        <option value="billing">Billing & Stripe</option>
      </select>

      <select id="autoRefreshSelect" onchange="setupAutoRefresh()">
        <option value="0">Auto-refresh: Off</option>
        <option value="3000">Auto-refresh: 3s</option>
        <option value="5000" selected>Auto-refresh: 5s</option>
        <option value="10000">Auto-refresh: 10s</option>
      </select>

      <button class="btn btn-primary" onclick="fetchLogs()">Filter</button>
      <button class="btn" onclick="clearFilters()">Reset</button>
    </div>

    <div class="table-container">
      <div id="logsList">
        <div style="padding:40px;text-align:center;color:var(--muted);font-family:var(--mono);">Loading structured MongoDB logs...</div>
      </div>
      <div class="pagination-bar">
        <span id="pageInfo">Page 1 of 1</span>
        <div style="display:flex;gap:6px;">
          <button class="btn" id="prevBtn" onclick="changePage(-1)">Previous</button>
          <button class="btn" id="nextBtn" onclick="changePage(1)">Next</button>
        </div>
      </div>
    </div>
  </main>

  <script>
    let currentPage = 1;
    let refreshInterval = null;

    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/admin/logs/stats');
        const json = await res.json();
        if (json.success && json.stats) {
          const s = json.stats;
          document.getElementById('totalCount').textContent = (s.totalLogs || 0).toLocaleString();
          document.getElementById('last24hCount').textContent = (s.last24hLogs || 0).toLocaleString();
          document.getElementById('errorCount').textContent = ((s.levelCounts?.error || 0) + (s.levelCounts?.fatal || 0)).toLocaleString();
          document.getElementById('otelCount').textContent = (s.categoryCounts?.otel_span || 0).toLocaleString();
          document.getElementById('httpCount').textContent = (s.categoryCounts?.http || 0).toLocaleString();
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }

    async function fetchLogs() {
      const search = document.getElementById('searchInput').value.trim();
      const level = document.getElementById('levelSelect').value;
      const category = document.getElementById('catSelect').value;

      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
        level,
        category,
        ...(search ? { search } : {})
      });

      try {
        const res = await fetch('/api/v1/admin/logs?' + params.toString());
        const json = await res.json();

        if (!json.success) {
          document.getElementById('logsList').innerHTML = '<div style="padding:40px;text-align:center;color:var(--error);">' + (json.message || 'Error loading logs') + '</div>';
          return;
        }

        renderLogs(json.data || []);
        document.getElementById('pageInfo').textContent = 'Showing ' + (json.data?.length || 0) + ' of ' + json.pagination.total + ' logs (Page ' + json.pagination.page + ' of ' + Math.max(1, json.pagination.pages) + ')';
        document.getElementById('prevBtn').disabled = currentPage <= 1;
        document.getElementById('nextBtn').disabled = currentPage >= json.pagination.pages;
      } catch (err) {
        document.getElementById('logsList').innerHTML = '<div style="padding:40px;text-align:center;color:var(--error);">Failed to connect to API</div>';
      }
    }

    function renderLogs(logs) {
      if (logs.length === 0) {
        document.getElementById('logsList').innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);font-family:var(--mono);">No logs found matching filter criteria.</div>';
        return;
      }

      let html = '';
      logs.forEach((log, index) => {
        const d = new Date(log.timestamp);
        const timeStr = d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
        
        let catClass = 'cat-badge';
        if (log.category === 'otel_span' || log.category === 'otel_event') catClass += ' cat-otel';
        else if (log.category === 'http') catClass += ' cat-http';
        else if (log.category === 'worker') catClass += ' cat-worker';

        const rowId = 'row-' + index;
        const detailsId = 'det-' + index;

        html += '<div class="log-row" onclick="toggleDetails(\\'' + detailsId + '\\')">';
        html += '<span class="log-time">' + timeStr + '</span>';
        html += '<span class="badge badge-' + log.level + '">' + log.level + '</span>';
        html += '<span class="' + catClass + '">' + log.category + '</span>';
        html += '<div class="log-msg">';
        html += '<span>' + escapeHtml(log.message) + '</span>';

        if (log.traceId) {
          html += ' <span style="margin-left:8px;" onclick="event.stopPropagation(); filterByTrace(\\'' + log.traceId + '\\')">trace: <span class="trace-link">' + log.traceId.slice(0, 10) + '...</span></span>';
        }
        if (log.durationMs) {
          html += ' <span style="color:var(--muted);font-size:11px;">(' + log.durationMs + 'ms)</span>';
        }

        html += '<div class="log-details" id="' + detailsId + '">';
        html += '<div style="margin-bottom:6px;display:flex;justify-content:space-between;color:var(--muted);">';
        html += '<span>ID: ' + log._id + ' | Service: ' + (log.service || 'api') + '</span>';
        html += '<span>Full Timestamp: ' + log.timestamp + '</span>';
        html += '</div>';
        if (log.error) {
          html += '<pre style="color:var(--error);background:#220f13;padding:10px;border-radius:6px;margin-bottom:8px;">' + escapeHtml(log.error.stack || log.error.message || JSON.stringify(log.error)) + '</pre>';
        }
        html += '<pre>' + escapeHtml(JSON.stringify(log.metadata || log, null, 2)) + '</pre>';
        html += '</div>';

        html += '</div>';
        html += '</div>';
      });

      document.getElementById('logsList').innerHTML = html;
    }

    function toggleDetails(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
    }

    function filterByTrace(traceId) {
      document.getElementById('searchInput').value = traceId;
      fetchLogs();
    }

    function changePage(delta) {
      currentPage = Math.max(1, currentPage + delta);
      fetchLogs();
    }

    function clearFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('levelSelect').value = 'all';
      document.getElementById('catSelect').value = 'all';
      currentPage = 1;
      fetchLogs();
    }

    function setupAutoRefresh() {
      const ms = parseInt(document.getElementById('autoRefreshSelect').value, 10);
      if (refreshInterval) clearInterval(refreshInterval);
      if (ms > 0) {
        refreshInterval = setInterval(() => {
          fetchLogs();
          fetchStats();
        }, ms);
      }
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Initial boot
    fetchStats();
    fetchLogs();
    setupAutoRefresh();
  </script>
</body>
</html>`);
};
