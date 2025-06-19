import React from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
  className={`w-full aspect-square flex items-center justify-center rounded-full border border-purple-900 bg-white 
    shadow-[0_-6px_10px_rgba(168,85,247,0.5),0_6px_10px_rgba(168,85,247,0.5)] 
    ${className}`}
>
  {children}
</div>
  );
};

export const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center   space-y-1 ${className}`}
    >
      {children}
    </div>
  );
};
