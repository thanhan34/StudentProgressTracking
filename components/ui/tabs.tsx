"use client";

// These controls select a filter, not tab panels, so expose pressed buttons.
export function Tabs({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return <div className="ui-tabs" role="group" aria-label={label}>
    {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}