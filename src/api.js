import axios from "axios";

export const api = {
  loadPracticeData: async name => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_DATA_API_ROOT}${name}`);

      return response.data;
    }
    catch (error) {
      console.log(error);
    }
  },
  loadFile: async file => {
    try {
      const response = await axios.get(window.URL.createObjectURL(file));

      return response.data;
    }
    catch (error) {
      console.log(error);
    }
  }
}
