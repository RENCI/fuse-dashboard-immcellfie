import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useResize } from "../../hooks";
import "./resize-wrapper.css";

export const ResizeWrapper = ({ useWidth, useHeight, aspectRatio, children }) => {
  const ref = useRef();
  const { width, height } = useResize(ref, 100, 100);

  const props = {};
  if (useWidth) props.width = width;
  if (useHeight) props.height = aspectRatio ? width / aspectRatio : height;

  return (
    <div ref={ ref }>
      { React.cloneElement(children, props) }
    </div>
  );
};           

ResizeWrapper.defaultProps = {
  useWidth: true,
  useHeight: false,
  aspectRatio: null
};

ResizeWrapper.propTypes = {
  useWidth: PropTypes.bool,
  useHeight: PropTypes.bool,
  aspectRatio: PropTypes.number
};