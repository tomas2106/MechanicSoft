export function normalizarTelefonoCO(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("57") && digits.length >= 12) return digits;
  return `57${digits}`;
}

export function formatoVisibleCO(raw) {
  const norm = normalizarTelefonoCO(raw);
  if (!norm) return "";
  const local = norm.slice(2);
  return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`.trim();
}