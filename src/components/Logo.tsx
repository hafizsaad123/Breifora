import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({
  className = '',
  iconOnly = false,
  iconSize = 36,
  textSize = 'text-xl',
}: LogoProps) {
  // SVG of the B with a lightning bolt cut out
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium custom SVG logo mark */}
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <g>
          {/* Main solid B shape in pristine brand-primary color */}
          <path
            d="M 22 15 H 58 C 74 15, 82 23, 82 35 C 82 44, 76 49, 67 51 C 77 53, 83 59, 83 71 C 83 83, 74 91, 58 91 H 22 Z"
            fill="#5956E9"
          />
          {/* Perfect lightning bolt overlay with crisp geometric spacing */}
          <path
            d="M 46 8 L 16 52 H 44 L 21 92 L 77 44 H 46 Z"
            fill="#FFFFFF"
            className="mix-blend-normal"
          />
        </g>
      </motion.svg>

      {/* Wordmark in custom layout directly matching the user's uploaded banner text */}
      {!iconOnly && (
        <span className={`font-display font-semibold ${textSize} tracking-tight text-slate-900 flex items-center`}>
          Breifora
        </span>
      )}
    </div>
  );
}
