import React from "react";

export type StrengthLevel = 1 | 2 | 3 | 4 | 5;

export function scorePassword(pw: string): StrengthLevel {
  // Scoring: 1..5
  let score = 0;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  // Clamp to 1..5
  if (score < 1) score = 1;
  return score as StrengthLevel;
}

export default function PasswordStrengthBar({ value }: { value: string }) {
  const level = scorePassword(value);
  const labels = ["Very weak", "Weak", "Okay", "Strong", "Very strong"];
  const label = labels[level - 1];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i <= level ? "bg-green-500" : "bg-gray-300"
            }`}
            aria-hidden
          />
        ))}
      </div>
      <div className="text-xs text-gray-600 mt-1">Strength: {label}</div>
    </div>
  );
}