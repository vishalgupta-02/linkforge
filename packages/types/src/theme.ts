export type ThemeKey =
  | "default"
  | "dark"
  | "light"
  | "violet"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  backgroundClass: string;
  buttonClass: string;
  previewColor: string;
}
