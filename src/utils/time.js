export const durationDisplay = duration => {
  const pad = n => n.toString().padStart(2, "0");

  if (duration < 0) return "-:--";

  let s = Math.floor(duration / 1000);
  let m = Math.floor(s / 60);
  const h = Math.floor(m / 60);

  s = s % 60;
  m = m % 60;

  let t = h > 0 ? h + "h" : "";
  if (h > 0 || m > 0) t += (h > 0 ? pad(m) : m) + "m"
  t += (h > 0 || m > 0 ? pad(s) : s) + "s";

  return t;
};