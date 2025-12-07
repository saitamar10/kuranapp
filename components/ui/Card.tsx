import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-5 border border-[#A8D5BA]';
  const variantStyles = variant === 'elevated' ? 'shadow-lg' : 'shadow-md';
  
  return (
    <View className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </View>
  );
}
