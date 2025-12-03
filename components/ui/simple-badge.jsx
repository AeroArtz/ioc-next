export function SimpleBadge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground bg-transparent",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className} ${variants[variant]}`}
    >
      {children}
    </span>
  )
}