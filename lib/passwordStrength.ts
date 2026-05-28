export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "weak";

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export function strengthFillPercent(strength: PasswordStrength): number {
  switch (strength) {
    case "weak":
      return 33;
    case "medium":
      return 66;
    case "strong":
      return 100;
  }
}

export function strengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "#ef4444";
    case "medium":
      return "#f97316";
    case "strong":
      return "#22c55e";
  }
}
