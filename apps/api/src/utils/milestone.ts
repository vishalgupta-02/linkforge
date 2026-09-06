// utils/milestone.ts

export const CLICK_MILESTONES = [100, 500, 1000, 10000] as const;

export type ClickMilestone = (typeof CLICK_MILESTONES)[number];

/**
 * Returns the next higher milestone threshold if one exists, otherwise null.
 */
export function getNextMilestone(currentMilestone: number): number | null {
  const sorted = [...CLICK_MILESTONES].sort((a, b) => a - b);
  const next = sorted.find((m) => m > currentMilestone);
  return next ?? null;
}

/**
 * Generates a dynamic subject line for click milestone emails.
 */
export function getMilestoneEmailSubject(milestone: number): string {
  return `Your links just hit ${milestone.toLocaleString()} clicks! 🚀`;
}
