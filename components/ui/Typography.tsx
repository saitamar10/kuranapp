import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'arabic' | 'mono';
  children: React.ReactNode;
}

export function Typography({ variant = 'body', children, className = '', ...props }: TypographyProps) {
  const variants = {
    h1: 'text-2xl font-bold text-[#2D5F4F]',
    h2: 'text-xl font-semibold text-[#2D5F4F]',
    h3: 'text-lg font-medium text-[#2D5F4F]',
    body: 'text-base text-gray-700',
    caption: 'text-sm text-gray-500',
    arabic: 'text-2xl text-[#2D5F4F] text-right',
    mono: 'text-base font-mono text-[#2D5F4F]',
  };

  return (
    <Text className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Text>
  );
}
