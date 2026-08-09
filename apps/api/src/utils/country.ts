// utils/country.ts

export const countryCodeToFlag = (countryCode: string): string => {
  if (!countryCode || countryCode === "unknown") {
    return "🌍";
  }

  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};
