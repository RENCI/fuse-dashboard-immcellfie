import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useResize } from "../../hooks";
import styles from "./resize-wrapper.module.css";

export const ResizeWrapper = ({ useWidth, useHeight, minWidth, aspectRatio, children }) => {
  const ref = useRef();
  const { width, height } = useResize(ref, 100, 100);

  const w = minWidth ? Math.max(width, minWidth) : width;

  const props = {};
  if (useWidth) props.width = w;
  if (useHeight) props.height = aspectRatio ? w / aspectRatio : height;

  return (
    <div ref={ ref } className={ styles.resizeWrapper }>
      { React.cloneElement(children, props) }
    </div>
  );
};           

ResizeWrapper.defaultProps = {
  useWidth: true,
  useHeight: false,
  minWidth: null,
  aspectRatio: null
};

ResizeWrapper.propTypes = {
  useWidth: PropTypes.bool,
  useHeight: PropTypes.bool,
  minWidth: PropTypes.number,
  aspectRatio: PropTypes.number
};