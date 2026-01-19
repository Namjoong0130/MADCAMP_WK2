export const currency = new Intl.NumberFormat("ko-KR");

export const ratingStars = (rating) =>
  `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;

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
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}달 전`;
  const years = Math.floor(months / 12);
  return `${years}년 전`;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
