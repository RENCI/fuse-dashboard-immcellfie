import React, { useRef, useState, useEffect } from "react";
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

export const VegaWrapper = ({ spec, data, signals, tooltip }) => {
  const view = useRef(null);
  const div = useRef(null);
  const [tooltipProps, setTooltipProps] = useState(null);

  const setSignals = (view, signals) => {
    signals.forEach(({ name, value }) => {
      view.signal(name, value);
    });
  };  

  const tooltipCallback = (handler, event, item, value) => {
    setTooltipProps({
      handler: handler,
      event: event,
      item: item,
      value: value
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

      if (tooltip) {
        view.current.tooltip(tooltipCallback);
      }

      view.current
        .data("data", data)              
        .run();
    });

    return () => {
      // Clean up
      if (view.current) view.current.finalize();
    };
  }, [spec, data, signals, tooltip]);

  useEffect(() => {
    if (!view.current) return;

    setSignals(view.current, signals);

    view.current.runAsync();
  }, [signals]);

  return (
    <>
      <div 
        ref={ div }
        className="wrapperDiv"
      >
        <LoadingSpinner />
      </div>
      { tooltip && React.cloneElement(tooltip, tooltipProps) }
    </>
  );
};

VegaWrapper.defaultProps = {
  data: [],
  signals: [],
  tooltip: null
};

VegaWrapper.propTypes = {
  spec: PropTypes.object.isRequired,
  data: PropTypes.array,
  signals: PropTypes.array,
  tooltip: PropTypes.element
};