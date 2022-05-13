export const TextHighlight = ({ text, highlight, style = { backgroundColor: "#d5fffd" }}) => {
  if (!highlight || highlight === "") return <>{ text }</>;

  const s1 = text.toLowerCase().indexOf(highlight.toLowerCase());

  if (s1 === -1) return <>{ text }</>;

  const s2 = s1 + highlight.length;

  return (
    <>
      <>{ text.substring(0, s1) }</>
      <span style={ style }>{ text.substring(s1, s2) }</span>
      <>{ text.substring(s2) }</>
    </>
  );
};           