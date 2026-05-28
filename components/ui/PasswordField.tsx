"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border bg-navy-900 px-4 py-3 pr-11 text-white outline-none transition-colors duration-200 placeholder:text-slate-600 focus:border-orange-500",
            error ? "border-orange-400" : "border-navy-700",
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-orange-400">{error}</p>}
    </div>
  );
}
