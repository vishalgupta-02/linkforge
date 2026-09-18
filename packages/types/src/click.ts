export interface ClickEventData {
  linkId: string;
  userId: string;
  ip?: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  timestamp?: string;
}

export interface ClickJobData {
  linkId: string;
  userId: string;
  rawIp?: string;
  referrer?: string;
  userAgent?: string;
  timestamp: string;
}
