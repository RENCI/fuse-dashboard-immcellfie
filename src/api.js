import axios from "axios";
import * as d3 from "d3";

const parseInput = data => {
  return {
    data: d3.tsvParseRows(data, row => {
      return {
        gene: row[0],
        values: row.slice(1).map(d => +d)
      };
    })
  };
};

const parseOutput = data => {
  return {
    tasks: d3.tsvParseRows(data, row => {
      if (row.length !== 3) return null;

      const info = d3.csvParseRows(row[0])[0];

      // Reorder phenotype info to go from task to system
      const phenotype = [info[1], info[3], info[2]];

      return {
        id: info[0],
        phenotype: phenotype,
        scores: d3.csvParseRows(row[1])[0].map(d => +d),
        activities: d3.csvParseRows(row[2])[0].map(d => +d)
      };
    })
  };
};

export const api = {
  loadPracticeData: async () => {
    try {
      const input = await axios.get("/data/cellfie/HPA.tsv");
      const output = await axios.get("/data/cellfie/HPA.expected");

      const inputData = parseInput(input.data);
      const outputData = parseOutput(output.data);

      return [inputData, outputData];
    }
    catch (error) {
      console.log(error);
    }
  }
}
