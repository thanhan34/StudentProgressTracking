import type { ComponentProps } from "react";

export function Button({ variant = "secondary", className = "", type = "button", ...props }: ComponentProps<"button"> & { variant?: "primary" | "secondary" }) {
  return <button type={type} className={`button ${variant} ${className}`} {...props} />;
}