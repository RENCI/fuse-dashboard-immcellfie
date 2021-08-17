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

const cellfieFileUrl = (id, file) => `${ process.env.REACT_APP_API_ROOT }get_output/${ id }/${ file }`;

const cellfieResult = (id, name) => `${ process.env.REACT_APP_API_ROOT }cellfie/results/${ id }/${ name }`;

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
  runCellfie: async (file, sampleNumber, model, parameters) => {    
    const formData = new FormData();
    formData.append("data", file);
    formData.append("SampleNumber", sampleNumber);
    formData.append("Ref", model);
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value));

    //formData.append("Param", parameters);

/*
    const result = await fetch(`${ process.env.REACT_APP_API_ROOT }cellfie/run/upload_data`, {
      method: "post",
      body: formData
    });
*/
    
    const result = await axios({
      method: "post",
      url: `${ process.env.REACT_APP_API_ROOT }cellfie/run/upload_data`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    

    console.log(result);

    return result.data.task_id;    
  },
  checkCellfieStatus: async id => {
/*    
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }/check_status/${ id }`);

    console.log(result);
*/
    // XXX: Check for valid file until get status is implemented
    try {
      const result = await axios.get(cellfieResult(id, "taskInfo"));

      return "ready";
    }
    catch {
      return "computing";
    }   
  },
  getCellfieOutput: async id => {
    const results = await Promise.all([
      axios.get(cellfieResult(id, "taskInfo")), 
      axios.get(cellfieResult(id, "score")),
      axios.get(cellfieResult(id, "score_binary"))
    ]);

    return {
      taskInfo: results[0].data,
      score: results[1].data,
      scoreBinary: results[2].data
    };
  }
}
