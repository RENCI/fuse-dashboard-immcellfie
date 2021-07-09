import axios from "axios";
import * as d3 from "d3";

let immcellfieInstance;
let token;

const getToken = async () => {
  const response = await axios.post(`http://dev-immcellfie.edc.renci.org:80/irods-rest2/token`, { responseType: "stream" }, {
    auth: {
      username: "rods",
      password: "woot"
    }
  });

  return response.data;
};

const createInstance = async () => {
  token = await getToken();

  return axios.create({
    baseURL: `http://dev-immcellfie.edc.renci.org:80`,
    headers: { Authorization: 'Bearer ' + token }
  });
};

const getUrl = async id => {
  if (!immcellfieInstance) {
    immcellfieInstance = await createInstance();
  }

  const response = await immcellfieInstance.get(`/ga4gh/drs/v1/objects/${ id }/access/irods-rest`);

  console.log(response);

  return response.data.url;
};

const readStream = async stream => {
  const reader = stream.getReader();
  let result = "";

  for (let i = 0; ; i++) {
    console.log(i);

    let { done, value } = await reader.read();

    console.log(done, value);

    if (done) {
      return result;
    }

    console.log(value.length);
    console.log(result.length);

    result += value;
  }
}

export const api = {
  loadGroupId: async id => {
    const response = await axios.get(`${ process.env.REACT_API_ROOT }/get_group_id/${ id }`);

    return response.data;
  },
  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadPracticeData: async name => {
    const response = await axios.get(`${ process.env.REACT_APP_DATA_API_ROOT }${ name }`);

    return response.data;
  },
  getDataInfo: async () => {
    if (!immcellfieInstance) {
      immcellfieInstance = await createInstance();
    }

    const response = await immcellfieInstance.get(`/ga4gh/drs/v1/objects/mock_obj1`);

    const [phenotype_id, expression_id] = response.data.contents.map(({ id }) => id);

    //const phenotype_url = await getUrl(phenotype_id);
    const expression_url = await getUrl(expression_id);

    //console.log(phenotype_url);
    console.log(expression_url);

    //const exp = await immcellfieInstance.get(expression_url);
    //const exp = await immcellfieInstance.get(`/irods-rest2/fileStream?path=/devImmcellfieZone/home/test1/study/gene.csv`);
    
    const exp = await fetch(`http://dev-immcellfie.edc.renci.org:80/irods-rest2/fileStream?path=/devImmcellfieZone/home/test1/study/gene.csv`, {
      method: "get",
      headers: new Headers({
        Authorization: 'Bearer ' + token
      })
    });

    const data = await readStream(exp.body);
    
/*
    d3.csv(`http://dev-immcellfie.edc.renci.org:80/irods-rest2/fileStream?path=/devImmcellfieZone/home/test1/study/gene.csv`, {
      headers: new Headers({
        Authorization: 'Bearer ' + token
      })
    }).then(data => {
      console.log(data);
    });
    */

    //console.log(exp);

    //console.log(exp.data);

    return response.data.contents;
  }
}
