interface HeartIconProps {
  variant: "full" | "half" | "gray";
  size?: number;
  className?: string;
}

export function HeartIcon({ variant, size = 32, className = "" }: HeartIconProps) {
  const src =
    variant === "full"
      ? "/icons/heart-full.svg"
      : variant === "half"
        ? "/icons/heart-half.svg"
        : "/icons/heart-gray.svg";

  return (
    <img
      src={src}
      alt={
        variant === "full"
          ? "vida completa"
          : variant === "half"
            ? "vida a la mitad"
            : "vida perdida"
      }
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
