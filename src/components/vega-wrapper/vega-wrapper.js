import React, { useRef, useEffect, useCallback } from "react";
import vegaEmbed from "vega-embed";

const options = {
  actions: {
    export: true,
    source: true,
    compiled: false,
    editor: false
  },
  renderer: "svg"
};

export const VegaWrapper = ({ spec, data }) => {
  const view = useRef(null);
  const div = useRef(null);

  const updateVisualization = useCallback(() => {
    if (!view.current) return;

    view.current
      .data("data", data)
      .run();
  }, [data]);

  useEffect(() => {
    // Remove old visualization
    if (view.current) {
      view.current.finalize();
    }

    // Create new visualization
    vegaEmbed(div.current, spec, options).then(result => {
      view.current = result.view;

      updateVisualization();
    });

    return () => {
      // Clean up
      view.current.finalize();
    };
  }, [spec, updateVisualization]);

  useEffect(() => {
    updateVisualization();
  }, [updateVisualization]);

  return (
    <div 
      style={{ width: "100%" }} 
      ref={ div } 
    >
      Loading...
    </div>
  );
};