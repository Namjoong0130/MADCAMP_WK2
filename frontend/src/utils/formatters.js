export const currency = new Intl.NumberFormat("ko-KR");

export const ratingStars = (rating) =>
  `${"?".repeat(rating)}${"?".repeat(Math.max(0, 5 - rating))}`;

export const formatDate = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const formatRelative = (value) => {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "?? ?";
  if (minutes < 60) return `${minutes}? ?`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}?? ?`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}? ?`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}?? ?`;
  const years = Math.floor(months / 12);
  return `${years}? ?`;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
