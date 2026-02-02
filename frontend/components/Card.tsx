'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
  hoverEffect?: boolean;
  animateOnView?: boolean;
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  animateOnView = true
}: CardProps) {
  const baseClasses = "rounded-2xl shadow-xl border transition-all duration-300";

  const variantClasses = {
    default: "bg-white/80 backdrop-blur-sm border-white/20",
    gradient: "bg-gradient-to-br from-white/70 to-gray-50/70 backdrop-blur-sm border-white/30",
    glass: "bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl"
  };

  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const motionProps = hoverEffect ? {
    whileHover: { y: -5, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
    whileTap: { scale: 0.98 }
  } : {};

  {animateOnView ? (
    <motion.div
      className={cardClasses}
      {...motionProps}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  ) : (
    <div className={cardClasses} {...motionProps}>
      {children}
    </div>
  )}
}