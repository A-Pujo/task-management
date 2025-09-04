import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition disabled:bg-gray-300 disabled:text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
