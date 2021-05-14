export const createPValueVersion = spec => {
  const newSpec = JSON.parse(JSON.stringify(spec));

  const strokeScale = newSpec.scales.find(({ name }) => name === "stroke");
  strokeScale.type = "log";
  strokeScale.base = 10;
  strokeScale.domain = [0.01, 1];
  strokeScale.range = { scheme: "greys" };
  strokeScale.reverse = true;

  newSpec.legends.push({
    fill: "stroke",
    title: "p-value",
    values: [0.01, 0.02, 0.05, 0.1, 1]
  });

  return newSpec;
};

export const createLogScaleVersion = spec => {
  const newSpec = JSON.parse(JSON.stringify(spec));

  const scale = newSpec.scales.find(({ name }) => name === "color");
  scale.type = "log";
  scale.base = 2;

  return newSpec;
};