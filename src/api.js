import axios from "axios";

let token = null;

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

const getStream = async (url, token = null) => {
  const params = { method: "get" };

  if (token) params.headers = new Headers({ Authorization: 'Bearer ' + token })

  const response = await fetch(url, params);

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

//const cellfieResult = (id, name) => `${ process.env.REACT_APP_API_ROOT }cellfie/results/${ id }/${ name }`;

const cellfieResultStream = async (id, name) => {
  const stream = await getStream(`${ process.env.REACT_APP_API_ROOT }cellfie/results/${ id }/${ name }`);
  const data = await readStream(stream);

  return data;
};

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
    const stream = await getStream(url, token);
    const data = await readStream(stream);

    return data;
  },
  runCellfie: async (file, sampleNumber, model, parameters) => {    
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("data", file);
    formData.append("SampleNumber", sampleNumber);
    formData.append("Ref", model);
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value));

    // Make post request
    const result = await axios.post(
      `${ process.env.REACT_APP_API_ROOT }cellfie/run/upload_data`, 
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return result.data.task_id;    
  },
  checkCellfieStatus: async id => {
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }cellfie/status/${ id }`);

    return result.data.task_status; 
  },
  getCellfieOutput: async id => {
    const results = await Promise.all([
      cellfieResultStream(id, "taskInfo"), 
      cellfieResultStream(id, "score"),
      cellfieResultStream(id, "score_binary"),
      cellfieResultStream(id, "detailScoring")
    ]);

    return {
      taskInfo: results[0],
      score: results[1],
      scoreBinary: results[2],
      detailScoring: results[3]
    };
  },
  getTasks: async email => {
    // XXX: Stub
    //return [];
    return [0, 0];
  }
}
