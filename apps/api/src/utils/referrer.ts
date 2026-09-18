export const parseReferrerSource = (referrer?: string): string => {
  if (!referrer) {
    return "Direct";
  }

  const value = referrer.toLowerCase();

  if (value.includes("instagram.com") || value.includes("l.instagram.com")) {
    return "Instagram";
  }

  if (value.includes("twitter.com") || value.includes("x.com")) {
    return "Twitter";
  }

  if (value.includes("google.com")) {
    return "Google";
  }

  if (value.includes("facebook.com")) {
    return "Facebook";
  }

  if (value.includes("linkedin.com")) {
    return "LinkedIn";
  }

  return "Other";
};
