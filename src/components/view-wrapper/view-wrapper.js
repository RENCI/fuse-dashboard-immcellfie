import styles from "./view-wrapper.module.css";

export const ViewWrapper = ({ children }) => {
  return (
    <div className={ styles.wrapper }>
      { children }
    </div>
  );
};           