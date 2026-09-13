---
name: sexy-ui-motion
description: Guidelines for building ultra-polished UI with fluid animations, Framer Motion, GSAP ScrollTrigger, and Tailwind.
---

Guidelines for building modern, high-end, responsive user interfaces with fluid animations, physical motion curves, and polished micro-interactions.

---

## 1. Core Physics & Easing Tokens

Avoid generic `transition: all 0.3s ease` or `ease-in-out` which feel robotic and sluggish. Use physical easing curves or damped spring physics.

### Easing Constants

```typescript
// Custom Bezier Easing Curves
export const EASINGS = {
  // Snappy entrance / responsive micro-interactions (Apple-like)
  snappy: [0.16, 1, 0.3, 1],
  // Smooth organic easing for modals, drawers, overlays
  smooth: [0.25, 1, 0.5, 1],
  // Emphasized acceleration & deceleration
  emphasized: [0.4, 0.0, 0.2, 1],
  // Anticipation / bouncy feedback
  bouncy: [0.34, 1.56, 0.64, 1],
} as const;

// Framer Motion Spring Presets
export const SPRINGS = {
  // Hover & tap micro-interactions
  snappy: { type: "spring", stiffness: 400, damping: 25 },
  // Scroll parallax / smooth follow
  damping: { type: "spring", stiffness: 100, damping: 30, restDelta: 0.001 },
  // Bouncy delight (toggle switches, checkmarks)
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  // Heavy modals / page transitions
  gentle: { type: "spring", stiffness: 180, damping: 24 },
} as const;
```

### Tailwind Custom Utilities
Add custom timing functions in `tailwind.config.js` or standard CSS variables:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'bouncy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    }
  }
}
```

---

## 2. Framer Motion Patterns

### A. Staggered Container & Children Entrances
```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function FeatureList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={itemVariants}
          className="rounded-2xl bg-white/5 p-6 backdrop-blur-md border border-white/10"
        >
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### B. Interactive Cards with Hover Depth & Spotlight
```tsx
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(56, 189, 248, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
```

### C. Scroll-Driven Parallax with Spring Damping
```tsx
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth raw scroll output with a spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const yBg = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const yText = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(smoothProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 bg-cover" />
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 flex h-full items-center justify-center text-center"
      >
        <h1 className="text-6xl font-bold tracking-tight text-white">
          Fluid Scroll Motion
        </h1>
      </motion.div>
    </div>
  );
}
```

### D. Animated Tabs with `layoutId`
```tsx
import { motion } from "framer-motion";
import { useState } from "react";

const TABS = ["Overview", "Telemetry", "Analytics", "Settings"];

export function SegmentedTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="flex rounded-full bg-slate-900/80 p-1.5 border border-white/10 backdrop-blur-lg">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### E. Smooth Mount/Unmount with `<AnimatePresence>`
```tsx
import { motion, AnimatePresence } from "framer-motion";

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

---

## 3. GSAP & ScrollTrigger Patterns

When using GSAP in React:
- Always use the official `@gsap/react` hook (`useGSAP`) or `gsap.context()` for automatic cleanup to prevent memory leaks and duplicate triggers.
- Register plugins before executing animations: `gsap.registerPlugin(ScrollTrigger)`.

### Pinned Horizontal Scroll Section
```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalGallery({ items }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1, // 1 second smoothing
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden bg-slate-950">
      <div ref={trackRef} className="flex h-full items-center gap-8 px-16">
        {items.map((item, index) => (
          <div
            key={index}
            className="h-[60vh] w-[450px] shrink-0 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Visual Aesthetics & Tailwind Polish

1. **Subtle Glassmorphism**:
   - `bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40`
   - Use double-bordered highlights: an outer border `border-white/10` and an inset ring `ring-1 ring-white/5`.

2. **Ambient Glowing Backgrounds**:
   ```html
   <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[140px] pointer-events-none -z-10" />
   ```

3. **Subtle Mesh / Grid Background**:
   ```css
   .bg-grid-pattern {
     background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
     background-size: 24px 24px;
   }
   ```

4. **Shimmering / Animated Gradient Borders**:
   ```tsx
   <div className="relative rounded-2xl p-[1px] overflow-hidden">
     <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
     <div className="relative z-10 rounded-2xl bg-slate-950 p-6">
       Content here
     </div>
   </div>
   ```

---

## 5. Performance & Accessibility

1. **Stick to Compositor Properties**:
   - Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.
   - Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding` as they trigger layout recalculations.
   - Use `will-change: transform` sparingly on active scrolling elements.

2. **Respect Reduced Motion**:
   - Framer Motion: Use `useReducedMotion()` hook to disable large positional movements.
     ```tsx
     import { useReducedMotion, motion } from "framer-motion";
     
     const shouldReduceMotion = useReducedMotion();
     const animation = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
     ```
   - Tailwind: Use the `motion-reduce:` and `motion-safe:` variant prefixes:
     ```html
     <div className="transition-transform duration-300 motion-reduce:transition-none hover:scale-105 motion-reduce:hover:scale-100" />
     ```

---

## 6. Page Transitions (Next.js / React Router)

### Next.js App Router with Framer Motion
```tsx
// app/template.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### React Router with Page Slide Transitions
```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Routes, Route } from "react-router-dom";

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};

const pageTransition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.4,
};

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <HomePage />
            </motion.div>
          }
        />
        {/* Add more routes */}
      </Routes>
    </AnimatePresence>
  );
}
```

---

## 7. Loading States & Skeleton Screens

### Pulsing Skeleton Loader
```tsx
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-3/4 rounded-lg bg-slate-700/50" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-700/50" />
        <div className="h-32 rounded-xl bg-slate-700/50" />
      </div>
    </div>
  );
}
```

### Shimmer Loading Effect
```tsx
export function ShimmerCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded-lg bg-slate-700/50" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-700/50" />
        <div className="h-32 rounded-xl bg-slate-700/50" />
      </div>
    </div>
  );
}

// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
}
```

### Spinner with Spring Scale
```tsx
import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-3 w-3 rounded-full bg-blue-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
```

---

## 8. Toast Notifications

### Animated Toast System with Framer Motion
```tsx
import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[9999] flex flex-col gap-3 p-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, x: 100, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-green-500/30 bg-green-500/10"
                : toast.type === "error"
                ? "border-red-500/30 bg-red-500/10"
                : "border-blue-500/30 bg-blue-500/10"
            }`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 9. Advanced GSAP Effects

### Text Reveal on Scroll (Split by Words)
```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function RevealText({ children }: { children: string }) {
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const words = textRef.current?.querySelectorAll(".word");
    if (!words) return;

    gsap.fromTo(
      words,
      { opacity: 0, y: 20, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: textRef });

  return (
    <div ref={textRef} className="text-4xl font-bold">
      {children.split(" ").map((word, i) => (
        <span key={i} className="word inline-block">
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
}
```

### Magnetic Button (Cursor Follows)
```tsx
import { useRef } from "react";
import gsap from "gsap";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-shadow hover:shadow-xl hover:shadow-blue-500/40"
    >
      {children}
    </button>
  );
}
```

### Staggered Image Grid Reveal
```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ImageGrid({ images }: { images: string[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const items = gridRef.current?.querySelectorAll(".grid-item");
    if (!items) return;

    gsap.fromTo(
      items,
      {
        opacity: 0,
        scale: 0.8,
        y: 60,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        stagger: {
          amount: 0.8,
          from: "start",
        },
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: gridRef });

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="grid-item aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl"
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Micro-Interactions & Delight

### Bouncy Checkbox
```tsx
import { motion } from "framer-motion";
import { useState } from "react";

export function BouncyCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
        checked
          ? "border-blue-500 bg-blue-500"
          : "border-slate-600 bg-transparent"
      }`}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-white"
        initial={false}
        animate={checked ? "checked" : "unchecked"}
      >
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          d="M5 13l4 4L19 7"
          variants={{
            unchecked: { pathLength: 0, opacity: 0 },
            checked: { pathLength: 1, opacity: 1 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        />
      </motion.svg>
    </button>
  );
}
```

### Toggle Switch with Spring Physics
```tsx
import { motion } from "framer-motion";
import { useState } from "react";

export function ToggleSwitch() {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative h-8 w-14 rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-slate-700"
      }`}
    >
      <motion.div
        className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-lg"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
```

### Count-Up Animation
```tsx
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
```
