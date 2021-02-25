import axios from "axios";

export const api = {
  loadPracticeData: async (inputName, outputName) => {
    try {
      const input = await axios.get(`${process.env.REACT_APP_DATA_API_ROOT}${inputName}`);
      const output = await axios.get(`${process.env.REACT_APP_DATA_API_ROOT}${outputName}`);

      return [input.data, output.data];
    }
    catch (error) {
      console.log(error);
    }
  }
}
