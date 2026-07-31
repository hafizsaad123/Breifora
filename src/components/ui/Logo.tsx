import { motion } from 'motion/react';
import logoImg from '../../assets/images/breiforalogo.png';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({
  className = '',
  iconOnly = false,
  iconSize = 32,
}: LogoProps) {
  if (iconOnly) {
    return (
      <div className={`flex items-center justify-center shrink-0 ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden shrink-0 flex items-center justify-center rounded-xl"
          style={{ width: iconSize, height: iconSize }}
        >
          <img
            src={logoImg}
            alt="Briefora Icon"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/breiforalogo.png';
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      <motion.img
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        src={logoImg}
        alt="Briefora Logo"
        style={{ height: `${iconSize}px` }}
        className="w-auto object-contain shrink-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/breiforalogo.png';
        }}
      />
    </div>
  );
}
