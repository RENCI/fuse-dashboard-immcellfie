import React, { useRef, useEffect } from "react";
import vegaEmbed from "vega-embed";
import { LoadingSpinner } from "../loading-spinner";
import "./vega-wrapper.css";

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

  const updateVisualization = (view, data) => {
    if (!view) return;

    view
      .data("data", data)
      .run();
  };

  useEffect(() => {
    // Remove old visualization
    if (view.current) {
      view.current.finalize();
    }

    // Create new visualization
    vegaEmbed(div.current, spec, options).then(result => {
      view.current = result.view;

      updateVisualization(view.current, data);
    });

    return () => {
      // Clean up
      view.current.finalize();
    };
  }, [spec, data]);

  return (
    <div className="wrapperDiv" ref={ div }>
      <LoadingSpinner />
    </div>
  );
};