import axios from "axios";

let token = null;

let status = null;

const getToken = async () => {
  const response = await axios.post(`${ process.env.REACT_APP_API_ROOT }${ process.env.REACT_APP_API_TOKEN}`, {}, {
    auth: {
      username: "rods",
      password: "woot"
    }
  });

  return response.data;
};

const getObjectIds = async id => {
  const response = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ process.env.REACT_APP_API_OBJECTS_DIR}${ id }`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  return response.data.contents.map(({ id }) => id);
};

const getDataUrl = async id => {
  const response = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ process.env.REACT_APP_API_OBJECTS_DIR}${ id }/access/irods-rest`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  return response.data.url;
};

const getStream = async url => {
  const response = await fetch(url, {
    method: "get",
    headers: new Headers({
      Authorization: 'Bearer ' + token
    })
  });

  return response.body;
}; 

const readStream = async stream => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let result = "";

  for (let i = 0; ; i++) {
    let { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += decoder.decode(value);
  }
};

const cellfieFileUrl = (id, file) => `${ process.env.REACT_APP_API_ROOT }/get_output/${ id }/${ file }`;

export const api = {
  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadPracticeData: async name => {
    const response = await axios.get(`${ process.env.REACT_APP_PRACTICE_DATA_ROOT }${ name }`);

    return response.data;
  },
  getDataInfo: async id => {
    if (!token) {
      token = await getToken();
    }

    const [phenotype_id, expression_id] = await getObjectIds(id);

    const phenotype_url = await getDataUrl(phenotype_id);
    const expression_url = await getDataUrl(expression_id);

    return [
      { name: phenotype_id, url: phenotype_url },
      { name: expression_id, url: expression_url }
    ];
  },
  loadDataUrl: async url => {
    const stream = await getStream(url);
    const data = await readStream(stream);

    return data;
  },
  runCellfie: async (data, model, parameters) => {
/*    
    const result = await axios.post(`${ process.env.REACT_APP_API_ROOT }/run`, {
      data: data,
      ref: model,
      param: parameters
    });

    console.log(result);
*/
    console.log(data, model, parameters);

    status = "Running";

    setTimeout(() => {
      status = "Finished";
    }, 5000);

    return "abcd"    
  },
  checkCellfieStatus: async id => {
/*    
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }/check_status/${ id }`);

    console.log(result);
*/
    return status;    
  },
  getCellfieOutput: async id => {
/*    
    const results = await Promise.all([
      axios.get(cellfieFileUrl(id, "taskInfo")), 
      axios.get(cellfieFileUrl(id, "score")),
      axios.get(cellfieFileUrl(id, "score_binary"))
    ]);
*/
    const results = await Promise.all([
      axios.get(`${ process.env.REACT_APP_PRACTICE_DATA_ROOT }taskInfo.csv`),
      axios.get(`${ process.env.REACT_APP_PRACTICE_DATA_ROOT }score.csv`),
      axios.get(`${ process.env.REACT_APP_PRACTICE_DATA_ROOT }score_binary.csv`)
    ]);

    console.log(results);
  }
}
