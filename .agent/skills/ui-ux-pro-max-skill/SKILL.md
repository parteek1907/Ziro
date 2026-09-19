---
name: ui-ux-pro-max-skill
description: >-
  Use this skill to implement top-tier frontend animations, motion design, and UI/UX micro-interactions.
  It provides guidelines for Framer Motion, Tailwind CSS animations, and best practices for responsive, accessible motion.
---

# UI/UX Pro Max Skill: Frontend Animation & Interaction

This skill package equips the workspace with top-rated UI/UX motion design patterns, micro-interactions, and framework-specific guidelines for creating premium, dynamic user experiences.

## 1. Motion Design Guidelines

- **Purposeful Animation:** Motion should guide the user's attention, communicate state changes (e.g., loading, success, error), and establish spatial relationships between components.
- **Performance First:** Always animate `transform` (scale, translate) and `opacity`. Avoid animating layout properties (width, height, margin) unless necessary, as they trigger expensive browser reflows.
- **Timing & Easing:**
  - Standard duration: `200ms` - `300ms` for micro-interactions (hover, toggle).
  - Screen transitions: `300ms` - `500ms`.
  - Use `ease-out` for elements entering the screen (deceleration).
  - Use `ease-in` for elements leaving the screen (acceleration).
  - Use `ease-in-out` or custom spring physics for state changes and continuous motion.
- **Accessibility:** Always respect `prefers-reduced-motion`. Disable or significantly simplify animations for users who prefer reduced motion.

## 2. Micro-Interaction Library (Framer Motion)

For complex, physics-based, or orchestrating animations, **Framer Motion** is the recommended library for React/Next.js projects.

### Standard Spring Config
```javascript
const springConfig = { type: "spring", stiffness: 300, damping: 24 };
```

### Staggered List Animation
```javascript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: springConfig }
};
```

### Hover & Tap Micro-Interactions
```javascript
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Interact
</motion.button>
```

## 3. Tailwind CSS Utilities for UI/UX

For simpler transitions and UI states, use Tailwind CSS built-in classes.

- **Fade In & Up:** `transition-all duration-300 ease-out opacity-0 translate-y-4 hover:opacity-100 hover:translate-y-0`
- **Interactive Cards:** `transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20`
- **Skeleton Loaders:** `animate-pulse bg-slate-200/60 rounded-md`
- **Smooth Colors:** `transition-colors duration-200 ease-in-out hover:bg-slate-50`

## 4. Implementation Checklist

When tasked with improving UI/UX or adding animations:
1. Verify if `framer-motion` is installed (`npm i framer-motion`).
2. Add `<AnimatePresence>` around conditionally rendered elements (modals, dropdowns) to enable exit animations.
3. Replace standard `div` or `button` tags with `motion.div` or `motion.button` where interactions are required.
4. Ensure text contrast and touch target sizes (min 44x44px) meet WCAG accessibility standards.
5. Apply glassmorphism (`backdrop-blur-md bg-white/60`) for modern overlays instead of opaque backgrounds when suitable for the theme.
