import React from "react";
import "./ShinyText.css";

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  delay?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2.5,
  className = "",
  color = "#e57804",
  shineColor = "#efb273",
  spread = 120,
  yoyo = false,
  pauseOnHover = true,
  direction = "left",
  delay = 0,
}) => {
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    animation: disabled
      ? "none"
      : `shinyTextShimmer ${speed}s ${direction === "right" ? "reverse" : "normal"} ${yoyo ? "alternate" : "infinite"} ${delay}s linear`,
  };

  return (
    <span
      className={`shiny-text ${className}`}
      style={gradientStyle}
    >
      {text}
    </span>
  );
};

export default ShinyText;
