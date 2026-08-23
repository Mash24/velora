export function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidCustomerEmail(email: string) {
  const value = normalizeCustomerEmail(email);
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
