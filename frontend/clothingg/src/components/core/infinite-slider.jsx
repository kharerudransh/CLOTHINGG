import { useMotionValue, motion, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * InfiniteSlider — motion-primitives port (plain JS, framer-motion)
 *
 * Props:
 *   children       — slide items
 *   gap            — px gap between items (default 16)
 *   speed          — px/second scroll speed (default 80)
 *   speedOnHover   — px/second speed when hovered (slower = more dramatic)
 *   direction      — 'horizontal' | 'vertical'  (default 'horizontal')
 *   reverse        — scroll direction (default false)
 *   className      — wrapper className
 */
export function InfiniteSlider({
  children,
  gap = 16,
  speed = 80,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}) {
  const translation = useMotionValue(0);
  const innerRef     = useRef(null);
  const controlsRef  = useRef(null);
  const currentSpeed = useRef(speed);

  const startAnimation = (spd) => {
    if (!innerRef.current) return;

    const isHorizontal = direction === 'horizontal';
    const size = isHorizontal
      ? innerRef.current.scrollWidth  / 2
      : innerRef.current.scrollHeight / 2;

    // where we want to end up (one full copy width/height away)
    const target = reverse ? size + gap / 2 : -(size + gap / 2);

    // current position
    const current = translation.get();

    // distance left to travel
    const distance = Math.abs(target - current);

    // stop current animation
    if (controlsRef.current) controlsRef.current.stop();

    controlsRef.current = animate(translation, [current, target], {
      ease     : 'linear',
      duration : distance / spd,
      onComplete: () => {
        // snap back to start without animating, then loop
        translation.set(reverse ? -(size + gap / 2) : 0);
        startAnimation(currentSpeed.current);
      },
    });
  };

  // kick off on mount
  useEffect(() => {
    // small delay so DOM is measured correctly
    const id = setTimeout(() => startAnimation(speed), 50);
    return () => {
      clearTimeout(id);
      controlsRef.current?.stop();
    };
  }, []); // eslint-disable-line

  const handleHoverStart = () => {
    if (speedOnHover === undefined) return;
    currentSpeed.current = speedOnHover;
    startAnimation(speedOnHover);
  };

  const handleHoverEnd = () => {
    if (speedOnHover === undefined) return;
    currentSpeed.current = speed;
    startAnimation(speed);
  };

  return (
    <div
      className={className}
      style={{ overflow: 'hidden', display: 'flex' }}
    >
      <motion.div
        ref={innerRef}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        style={{
          display  : 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          gap      : `${gap}px`,
          x        : direction === 'horizontal' ? translation : 0,
          y        : direction === 'vertical'   ? translation : 0,
          width    : direction === 'horizontal' ? 'max-content' : '100%',
        }}
      >
        {/* render children twice for seamless loop */}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
