import { motion } from "motion/react";
import React, { useRef, useMemo, useEffect, useState, CSSProperties } from "react";

type KeyframeRecord = Record<string, number | string | undefined>;

const buildKeyframes = (
  from: KeyframeRecord,
  steps: KeyframeRecord[],
): KeyframeRecord => {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes: KeyframeRecord = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])] as unknown as
      | string
      | number
      | undefined;
  });
  return keyframes;
};

export interface BlurTextProps {
  text?: string;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  className?: string;
  animateBy?: "words" | "chars";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: KeyframeRecord;
  animationTo?: KeyframeRecord[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  once?: boolean;
  paragraphStyles?: CSSProperties;
  textAlign?: CSSProperties["textAlign"];
  playImmediately?: boolean;
}

const BlurText = ({
  text = "",
  as: Component = "p",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.4,
  once = false,
  paragraphStyles,
  textAlign,
  playImmediately = false,
}: BlurTextProps) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(playImmediately);

  useEffect(() => {
    if (playImmediately) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [playImmediately, once, threshold, rootMargin, text]);

  const isInView = playImmediately || inView;

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1),
  );

  const flexJustifyFromTextAlign = (): CSSProperties["justifyContent"] => {
    if (textAlign === undefined || textAlign === "inherit") return undefined;
    if (textAlign === "center") return "center";
    if (textAlign === "end" || textAlign === "right") return "flex-end";
    if (textAlign === "start" || textAlign === "left") return "flex-start";
    return undefined;
  };

  const justifyContent = flexJustifyFromTextAlign();

  return React.createElement(
    Component,
    {
      ref,
      className,
      style: {
        display: "flex",
        flexWrap: "wrap",
        ...(textAlign !== undefined ? { textAlign } : {}),
        ...(justifyContent ? { justifyContent } : {}),
        ...paragraphStyles,
      },
    },
    elements.map((segment, index) => {
      const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

      const spanTransition = {
        duration: totalDuration,
        times,
        delay: (index * delay) / 1000,
        ease: easing,
      };

      return (
        <motion.span
          className="inline-block will-change-[transform,filter,opacity]"
          key={index}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initial={fromSnapshot as any}
          animate={(isInView ? animateKeyframes : fromSnapshot) as any}
          transition={spanTransition}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {segment === " " ? "\u00A0" : segment}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      );
    }),
  );
};

export default BlurText;
