export const parseReferrerSource = (referrer?: string): string => {
  if (!referrer) {
    return "Direct";
  }

  const value = referrer.toLowerCase();

  // Instagram
  if (value.includes("instagram.com") || value.includes("l.instagram.com")) {
    return "Instagram";
  }

  // Twitter / X
  if (value.includes("twitter.com") || value.includes("x.com")) {
    return "Twitter";
  }

  // Google
  if (value.includes("google.com")) {
    return "Google";
  }

  // Facebook
  if (value.includes("facebook.com")) {
    return "Facebook";
  }

  // LinkedIn
  if (value.includes("linkedin.com")) {
    return "LinkedIn";
  }

  return "Other";
};
