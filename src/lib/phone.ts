export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function isUsablePhone(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 12 && digits.startsWith("254")) return true;
  if (digits.length === 9 && /^[17]/.test(digits)) return true;
  return digits.length >= 9 && digits.length <= 15;
}

/** Store and match customers on one canonical Kenyan mobile format (+2547XXXXXXXX). */
export function normalizeKenyanPhone(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length === 12 && digits.startsWith("254")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `+254${digits.slice(1)}`;
  if (digits.length === 9) return `+254${digits}`;
  if (digits.startsWith("254")) return `+${digits}`;
  return phone.trim();
}

/** Readable phone for admin screens (+254 712 345 678). */
export function formatDisplayPhone(phone: string) {
  const normalized = normalizeKenyanPhone(phone);
  const match = normalized.match(/^\+254(\d{3})(\d{3})(\d{3,4})$/);
  if (match) return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  return phone.trim();
}
