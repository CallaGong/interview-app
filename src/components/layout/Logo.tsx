interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl sm:text-5xl",
};

export default function Logo({ className = "", size = "sm" }: LogoProps) {
  return (
    <span
      className={`inline-block whitespace-nowrap font-semibold tracking-tight text-white ${sizeClasses[size]} ${className}`}
    >
      Case<span className="text-sky-400">Ready</span>
    </span>
  );
}
