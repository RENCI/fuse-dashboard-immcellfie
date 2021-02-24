import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
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

export const VegaWrapper = ({ spec, data, signals }) => {
  const view = useRef(null);
  const div = useRef(null);

  const setSignals = (view, signals) => {
    signals.forEach(({ name, value }) => {
      view.signal(name, value);
    });
  };

  useEffect(() => {
    // Remove old visualization
    if (view.current) {
      view.current.finalize();
    }

    // Create new visualization
    vegaEmbed(div.current, spec, options).then(result => {
      view.current = result.view;

      setSignals(view.current, signals);

      view.current
      .data("data", data)      
      .run();
    });

    return () => {
      // Clean up
      view.current.finalize();
    };
  }, [spec, data]);

  useEffect(() => {
    if (!view.current) return;

    setSignals(view.current, signals);

    view.current.runAsync();
  }, [signals]);

  return (
    <div className="wrapperDiv" ref={ div }>
      <LoadingSpinner />
    </div>
  );
};

VegaWrapper.defaultProps = {
  data: [],
  signals: []
};

VegaWrapper.propTypes = {
  spec: PropTypes.object.isRequired,
  data: PropTypes.array,
  signals: PropTypes.array
};