import React from 'react';
import { motion } from 'motion/react';

interface SecondaryWhiteButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function SecondaryWhiteButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false
}: SecondaryWhiteButtonProps) {
  const hasPaddingX = /\bpx-\d+|\bp-\d+/.test(className);
  const hasPaddingY = /\bpy-\d+|\bp-\d+/.test(className);
  const hasTextSize = /\btext-(xs|sm|base|lg|xl)\b/.test(className);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98, y: 1 }}
      className={`
        ${hasPaddingX ? '' : 'px-8'} 
        ${hasPaddingY ? '' : 'py-3.5'}
        ${hasTextSize ? '' : 'text-sm'}
        rounded-full 
        bg-white 
        text-[#5956E9] 
        font-semibold 
        tracking-wide
        border border-slate-200/60
        ring-1 ring-inset ring-slate-900/5
        shadow-[0_4px_12px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.05)]
        hover:bg-slate-50
        focus:outline-none focus:ring-2 focus:ring-[#5956E9] focus:ring-offset-2
        inline-flex items-center justify-center
        transition-colors duration-200
        cursor-pointer
        select-none
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
