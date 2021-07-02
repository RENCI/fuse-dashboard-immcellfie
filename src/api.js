import axios from "axios";

export const api = {
  loadGroupId: async id => {
    const response = await axios.get(`${process.env.REACT_API_ROOT}/get_group_id/${id}`);

    return response.data;
  },
  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadPracticeData: async name => {
    const response = await axios.get(`${process.env.REACT_APP_DATA_API_ROOT}${name}`);

    return response.data;
  }
}
