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
    data: d3.csvParseRows(data, row => {
      row = d3.merge(row.map(d => d.split("\t")));

      return {
        gene: row[0],
        phenotype: row.slice(1, 4),
        values: row.slice(4).map(d => +d)
      };
    }).slice(4)
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
