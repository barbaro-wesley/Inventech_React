import { Monitor } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-gradient-brand p-2 rounded-xl shadow-brand">
        <Monitor className={`${iconSizes[size]} text-white`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold bg-gradient-brand bg-clip-text text-transparent`}>
          InvenTech
        </span>
      )}
    </div>
  );
};