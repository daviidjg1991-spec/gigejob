import React from 'react';
import { cn } from '../lib/utils';

interface CustomLoaderProps {
  className?: string;
  size?: number;
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({ className, size }) => {
  return (
    <img 
      src="/logo.png?v=3" 
      alt="Cargando..." 
      className={cn("custom-loader-icon object-contain", className)}
      style={size ? { width: size, height: size } : undefined}
    />
  );
};
