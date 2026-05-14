/**
 * Input Reutilizable
 * Incluye etiqueta (label) y manejo de errores.
 */

import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg outline-none transition-all
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          dark:border-slate-700 dark:focus:border-primary
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Input;
