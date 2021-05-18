import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import vegaEmbed from "vega-embed";
import { LoadingSpinner } from "../loading-spinner";
import "./vega-wrapper.css";

export const VegaWrapper = ({ 
  width, height, options, spec, data, signals, eventListeners, tooltip, spinner 
}) => {
  const div = useRef(null);
  const view = useRef(null);
  const [tooltipProps, setTooltipProps] = useState(null);  

  const setSignals = (view, signals) => {
    signals.forEach(({ name, value }) => {
      view.signal(name, value);
    });
  };  

  const setEventListeners = (view, eventListeners) => {
    eventListeners.forEach(({ type, callback }) => {
      view.addEventListener(type, callback);
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

  // Initial effect when mounting
  useEffect(() => {
    if (view.current) return;

    // Create new visualization
    vegaEmbed(div.current, spec, options).then(result => {
      view.current = result.view;

      setSignals(view.current, signals);
      setEventListeners(view.current, eventListeners);

      if (tooltip) {
        view.current.tooltip(tooltipCallback);
      }

      view.current
        .data("data", data)              
        .runAsync();
    });

    return () => {
      // Clean up
      if (view.current) view.current.finalize();
    };
  }, []);
  
  // Update signals
  useEffect(() => {
    if (!view.current) return;

    setSignals(view.current, signals);

    view.current.runAsync();
  }, [signals]);
  
  // Update data
  useEffect(() => {
    if (!view.current) return;

    view.current
      .data("data", data)              
      .runAsync();
  }, [data]);

  // Update spec
  // XXX: Look into better way to update spec without creating new view
  useEffect(() => {
    if (!view.current) return;

    const oldView = view.current;

    // Create new visualization
    vegaEmbed(div.current, spec, options).then(result => {
      view.current = result.view;

      setSignals(view.current, signals);
      setEventListeners(view.current, eventListeners);

      if (tooltip) {
        view.current.tooltip(tooltipCallback);
      }

      view.current
        .data("data", data)              
        .run();

      if (oldView) oldView.finalize();
    });
  }, [spec]);

  return (
    <>
      <div 
        ref={ div }
        className="wrapperDiv"
        style={{ width: width, height: height }}
      >
        { spinner && <LoadingSpinner /> }
      </div>
      { tooltip && React.cloneElement(tooltip, tooltipProps) }
    </>
  );
};

VegaWrapper.defaultProps = {
  width: "100%",
  height: "auto",
  options: {
    actions: {
      export: true,
      source: true,
      compiled: false,
      editor: false
    },
    renderer: "svg"
  },
  data: [],
  signals: [],
  eventListeners: [],
  tooltip: null,
  spinner: true
};

VegaWrapper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  spec: PropTypes.object.isRequired,
  options: PropTypes.object,
  data: PropTypes.array,
  signals: PropTypes.array,
  eventListeners: PropTypes.array,
  tooltip: PropTypes.element,
  spinner: PropTypes.bool
};