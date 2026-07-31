import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ScrollBlurHeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function ScrollBlurHeading({ children, className, id }: ScrollBlurHeadingProps) {
  return (
    <motion.h2
      className={className}
      id={id}
      initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px 0px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.h2>
  );
}
