import React from "react";

export type TableProps = {
  children: React.ReactNode;
  className?: string;
};
export function Table({ children, className = "" }: TableProps) {
  return <table className={`min-w-full ${className}`}>{children}</table>;
}

export type TableHeadProps = {
  children: React.ReactNode;
  className?: string;
};
export function TableHead({ children, className = "" }: TableHeadProps) {
  return <thead className={className}>{children}</thead>;
}

export type TableBodyProps = {
  children: React.ReactNode;
  className?: string;
};
export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export type TableRowProps = {
  children: React.ReactNode;
  className?: string;
};
export function TableRow({ children, className = "" }: TableRowProps) {
  return <tr className={className}>{children}</tr>;
}

export type TableCellProps = {
  children: React.ReactNode;
  className?: string;
};
export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
