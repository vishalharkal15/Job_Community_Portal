// src/utils/date.js

export function timeAgo(date) {
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { name: "week", secs: 7 * 24 * 60 * 60 },
    { name: "day", secs: 24 * 60 * 60 },
    { name: "hour", secs: 60 * 60 },
    { name: "minute", secs: 60 },
    { name: "second", secs: 1 },
  ];

  for (let unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) {
      return `${value} ${unit.name}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}