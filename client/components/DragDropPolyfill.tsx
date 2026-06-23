"use client";

import { useEffect } from "react";
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

export default function DragDropPolyfill() {
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      polyfill({
        // use this to make use of the scroll behaviour
        dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
      });
      
      // prevent default touchmove on window when dragging
      window.addEventListener("touchmove", function() {}, { passive: false });
    }
  }, []);

  return null;
}
