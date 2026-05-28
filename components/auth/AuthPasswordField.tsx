"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getPasswordStrength,
  strengthColor,
  strengthFillPercent,
} from "@/lib/passwordStrength";
import { cn } from "@/lib/utils";

interface AuthPasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  showStrength?: boolean;
}

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  showStrength = false,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => getPasswordStrength(value), [value]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm text-[#94a3b8]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={showStrength ? "new-password" : "current-password"}
          className={cn(
            "auth-input w-full rounded-md border bg-navy-800 px-4 py-3 pr-11 font-sans text-white outline-none transition-all duration-200 placeholder:text-[#64748b]",
            error ? "border-orange-400" : "border-navy-700",
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] transition-colors hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-navy-700">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${strengthFillPercent(strength)}%`,
              backgroundColor: strengthColor(strength),
            }}
          />
        </div>
      )}

      {error && (
        <p className="mt-1.5 font-sans text-sm text-orange-400">{error}</p>
      )}
    </div>
  );
}
