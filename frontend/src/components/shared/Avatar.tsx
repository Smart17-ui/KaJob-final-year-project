// frontend/src/components/shared/Avatar.tsx

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  photoUrl?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
};

const getInitials = (name?: string | null): string => {
  if (!name) return "U";

  const trimmed = name.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  const first = parts[0].charAt(0) ?? "";
  const last =
    parts.length > 1 ? parts[parts.length - 1].charAt(0) ?? "" : "";

  return `${first}${last}`.toUpperCase() || "U";
};

const Avatar = ({
  photoUrl,
  name,
  size = "md",
  className = "",
}: AvatarProps) => {
  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name ?? "User"}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
        draggable={false}
        onError={(event) => {
          /* If the image fails to load, fall back to initials
             by hiding the broken img. We can't re-render as
             initials from here easily, so we just make it
             invisible and rely on the container background. */
          (event.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      aria-label={name ?? "User"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${sizeClass} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
