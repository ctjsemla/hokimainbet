"use client";

import { cn } from "@/lib/utils";

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
}

export function AuthFormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  autoComplete,
}: AuthFormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm text-[#94a3b8]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "auth-input w-full rounded-md border bg-navy-800 px-4 py-3 font-sans text-white outline-none transition-all duration-200 placeholder:text-[#64748b]",
          error ? "border-orange-400" : "border-navy-700",
        )}
      />
      {hint && !error && (
        <p className="mt-1 font-sans text-xs text-[#64748b]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 font-sans text-sm text-orange-400">{error}</p>
      )}
    </div>
  );
}
