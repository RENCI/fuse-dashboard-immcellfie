import { useState, useRef, useEffect } from "react";

export const useResize = (ref, initialWidth, initialHeight, triggerWindow)  => {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const resize = useRef();

  useEffect(() => {
    if (!ref.current) return;

    setWidth(ref.current.clientWidth);
    setHeight(ref.current.clientHeight);

    if (window.ResizeObserver) {
      resize.current = new ResizeObserver(entries => {
        entries.forEach(entry => {
          if (entry.contentRect) {
            setWidth(entry.contentRect.width);
            setHeight(entry.contentRect.height);
          }
        });

        if (triggerWindow) window.dispatchEvent(new Event("resize"));
      });

      resize.current.observe(ref.current);
    }

    return () => {
      if (resize.current) resize.current.disconnect();
    }
  }, [ref, triggerWindow]);

  return { width, height };
};