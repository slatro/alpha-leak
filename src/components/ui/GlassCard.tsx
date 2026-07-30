import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface GlassCardProps extends React.ComponentProps<typeof motion.div> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-panel rounded-xl overflow-hidden',
        hoverEffect && 'glass-panel-hover',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
