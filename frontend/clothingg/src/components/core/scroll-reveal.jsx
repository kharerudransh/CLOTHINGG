import { motion } from 'framer-motion';

/**
 * ScrollReveal — wraps content and animates it smoothly when scrolled into view.
 */
export function ScrollReveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.45,
  once = true,
  className,
  style,
}) {
  return (
    <motion.div
      className={className}
      style={{ willChange: 'opacity, transform', ...style }}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.1 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
