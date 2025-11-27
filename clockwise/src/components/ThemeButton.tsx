import { type ButtonHTMLAttributes } from "react";
import "./ThemeButton.css";

export type ThemeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "primary" | "secondary";
};

export function ThemeButton({
  label,
  className = "",
  variant = "primary",
  ...props
}: ThemeButtonProps) {
  const classes = [
    "theme-button",
    variant === "secondary" ? "secondary" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {label}
    </button>
  );
}
