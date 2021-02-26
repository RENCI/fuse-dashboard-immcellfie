import vegaEmbed from "vega-embed";
import * as d3 from "d3";
import { histogram, density } from "../../vega-specs";

const options = {
  actions: false
};

let el = null;
let tooltipView = null;

const calculatePosition = (event, tooltipBox, offsetX, offsetY) => {
  let x = event.clientX + offsetX;

  if (x + tooltipBox.width > window.innerWidth) {
    x = +event.clientX - offsetX - tooltipBox.width;
  }

  let y = event.clientY + offsetY;

  if (y + tooltipBox.height > window.innerHeight) {
    y = +event.clientY - offsetY - tooltipBox.height;
  }

  return { x, y };
};

export const tooltip = (handler, event, item, value) => {
  if (!el) {
    el = document.createElement("div");
    document.body.appendChild(el);
  }

  if (!tooltipView) {
    vegaEmbed(el, density, options).then(result => {
      tooltipView = result.view;
    });
  }

  if (value === null) {
    el.setAttribute("style", "visiblity: hidden;");

    return;
  }
  
  const { x, y } = calculatePosition(event, el.getBoundingClientRect(), 0, 0);

  el.setAttribute("style", `visiblity: visible; position: fixed; z-index: 1000; pointer-events: none; top: ${y}px; left: ${x}px`)

  const values = d3.merge(item.datum.allScores.map(d => d.filter(d => !isNaN(d)).map(d => ({ value: d }))));

  tooltipView
    .data("data", values)
    .run();  
};