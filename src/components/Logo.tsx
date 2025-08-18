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
      <div className="bg-gradient-brand p-2 rounded-xl shadow-brand flex items-center justify-center">
        <img
          src="../logo.png"   // coloque sua imagem em public/logo.png
          alt="Logo"
          className={`${iconSizes[size]} object-contain`}
        />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold bg-gradient-brand bg-clip-text text-transparent`}>
          InvenTech
        </span>
      )}
    </div>
  );
};