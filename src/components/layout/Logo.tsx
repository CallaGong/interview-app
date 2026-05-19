interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** dark = white text (navbar); light = dark text (auth pages) */
  variant?: "dark" | "light";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl sm:text-5xl",
};

export default function Logo({
  className = "",
  size = "sm",
  variant = "dark",
}: LogoProps) {
  const isLight = variant === "light";
  return (
    <span
      className={`inline-block whitespace-nowrap font-semibold tracking-tight ${
        isLight ? "text-slate-900" : "text-white"
      } ${sizeClasses[size]} ${className}`}
    >
      Case
      <span className={isLight ? "text-sky-600" : "text-sky-400"}>Ready</span>
    </span>
  );
}
