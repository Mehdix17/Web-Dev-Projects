"use client";

import { useEffect, useRef } from "react";
import "kursor/dist/kursor.css";

type KursorInstance = {
  destroy?: () => void;
};

type KursorConstructor = new (options: {
  type?: number;
  color?: string;
}) => KursorInstance;

export function AppCursor() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let instance: KursorInstance | null = null;

    const HOVER_CLASS = "k-hover";
    const INTERACTIVE_SELECTOR =
      "a, button, input, textarea, select, label, summary, [role='button'], [tabindex], .k-hover";

    const applyHoverClass = () => {
      const nodes =
        document.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);
      nodes.forEach((node) => {
        if (
          node.matches("[tabindex='-1']") ||
          node.hasAttribute("disabled") ||
          node.getAttribute("aria-disabled") === "true"
        ) {
          return;
        }
        node.classList.add(HOVER_CLASS);
      });
    };

    const initCursor = async () => {
      // Skip custom cursor on touch-first devices.
      if (window.matchMedia("(pointer: coarse)").matches) return;

      applyHoverClass();

      const observer = new MutationObserver(() => {
        applyHoverClass();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const kursorModule = (await import("kursor")) as {
        default: KursorConstructor;
      };

      const color =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim() || "#B353FF";

      const Kursor = kursorModule.default;
      instance = new Kursor({
        type: 1,
        color,
      });

      return observer;
    };

    let mutationObserver: MutationObserver | null = null;
    void initCursor().then((observer) => {
      mutationObserver = observer || null;
    });

    return () => {
      mutationObserver?.disconnect();
      if (instance?.destroy) {
        instance.destroy();
      }
    };
  }, []);

  return null;
}
