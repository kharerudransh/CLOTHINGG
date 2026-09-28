import { motion, AnimatePresence } from 'framer-motion';

const defaultStaggerTimes = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit:   { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const presetVariants = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden:  { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)'  },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden:  { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden:  { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0   },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden:  { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
    },
  },
  shake: {
    container: defaultContainerVariants,
    item: {
      hidden:  { x: -40, opacity: 0 },
      visible: { x: 0,   opacity: 1 },
    },
  },
};

function splitSegments(text, per) {
  if (per === 'char') return text.split('');
  if (per === 'line') return text.split('\n');
  return text.split(/(\s+)/); // 'word' — keeps spaces
}

/**
 * TextEffect — motion-primitives inspired per-char / per-word text animation.
 *
 * Props:
 *   children  {string}  — text to animate
 *   per       {'char'|'word'|'line'}  default 'word'
 *   preset    {'fade'|'blur'|'slide'|'scale'|'shake'}  default 'fade'
 *   as        {string}  — HTML tag  default 'p'
 *   delay     {number}  — delay in seconds before first segment
 *   trigger   {boolean} — mount/unmount to re-trigger (default true)
 *   className {string}
 *   segmentClassName {string}
 */
export function TextEffect({
  children,
  per = 'word',
  preset = 'fade',
  as: Component = 'p',
  delay = 0,
  trigger = true,
  className,
  segmentClassName,
}) {
  const segments = splitSegments(String(children), per);
  const { container: containerVars, item: itemVars } = presetVariants[preset] ?? presetVariants.fade;
  const stagger = defaultStaggerTimes[per] ?? 0.05;

  const modifiedContainer = {
    ...containerVars,
    visible: {
      ...containerVars.visible,
      transition: {
        ...(containerVars.visible?.transition ?? {}),
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <Component className={className}>
          <motion.span
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modifiedContainer}
            style={{ display: 'inline' }}
          >
            {segments.map((seg, i) => (
              <motion.span
                key={`${seg}-${i}`}
                variants={itemVars}
                style={{ display: per === 'line' ? 'block' : 'inline-block', whiteSpace: 'pre' }}
                className={segmentClassName}
              >
                {seg}
              </motion.span>
            ))}
          </motion.span>
        </Component>
      )}
    </AnimatePresence>
  );
}
