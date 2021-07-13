import axios from "axios";

let token = null;

const getToken = async () => {
  const response = await axios.post(`http://dev-immcellfie.edc.renci.org:80/irods-rest2/token`, {}, {
    auth: {
      username: "rods",
      password: "woot"
    }
  });

  return response.data;
};

const getObjectIds = async id => {
  const response = await axios.get(`http://dev-immcellfie.edc.renci.org:80/ga4gh/drs/v1/objects/${ id }`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  return response.data.contents.map(({ id }) => id);
};

const getDataUrl = async id => {
  const response = await axios.get(`http://dev-immcellfie.edc.renci.org:80/ga4gh/drs/v1/objects/${ id }/access/irods-rest`, {
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
}

export const api = {
  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadPracticeData: async name => {
    const response = await axios.get(`${ process.env.REACT_APP_DATA_API_ROOT }${ name }`);

    return response.data;
  },
  getDataInfo: async id => {
    if (!token) {
      token = await getToken();
    }

    const [phenotype_id, expression_id] = await getObjectIds("mock_obj" + id);

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
  }
}
