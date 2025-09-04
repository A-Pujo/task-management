import React from "react";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 shadow-lg rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
