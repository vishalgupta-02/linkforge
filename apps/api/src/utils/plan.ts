export const isProPlan = (plan?: string | null): boolean => {
  if (!plan) return false;
  const normalized = plan.toUpperCase();
  return normalized === "PRO" || normalized === "BUSINESS";
};
