import React from 'react';

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border bg-white p-4 shadow ${className}`}>{children}</div>;
}

export function CardHeader({ className = '', children }) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ className = '', children }) {
  return <div className={className}>{children}</div>;
}
