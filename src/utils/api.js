import axios from "axios";

//axios.defaults.headers = {
//  "Cache-Control": "max-age-0, must-revalidate"
//};

//axios.defaults.headers = {
//  "Cache-Control": "no-store"
//};

//axios.defaults.headers ={
//  "Cache-Control": "no-cache, no-transform, no-store, must-revalidate, max-age=3",
//  "Pragma": "no-cache",
//  "Expires": "0"
//};

const inputDataType = "class_dataset_expression";

// Stream helper functions
/*
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

const resultStream = async (path, id, name) => {
  const stream = await getStream(`${ process.env.REACT_APP_API_ROOT }${ path }/results/${ id }/${ name }`);
  const data = await readStream(stream);

  return data;
};

const getOutput = async (path, id) => {
  const results = await Promise.all([
    resultStream(path, id, "taskInfo"), 
    resultStream(path, id, "score"),
    resultStream(path, id, "score_binary")
  ]);

  return {
    taskInfo: results[0],
    score: results[1],
    scoreBinary: results[2]
  };
};
*/

// API helper functions

const convertDate = date => date + "Z";

const getDataset = async id => {
  const response = await axios.get(`${ process.env.REACT_APP_FUSE_AGENT_API}/objects/${ id }`);

  const { agent, provider } = response.data;

  if (!agent) throw new Error(`Error loading object ${ id }`);

  //console.log(response.data);

  const dataset = {};

  let finishedTime = -1;

  const updateTime = file => {
    const time = new Date(convertDate(file.updated_time));

    if (!finishedTime || time > finishedTime) finishedTime = time;
  };

  const files = {};
  if (provider) {
    for (const key in provider) {
      const file = provider[key];
      updateTime(file);

      switch (file.file_type) {
        case "filetype_dataset_expression":
          files.expression = file;
          break;
        
        case "filetype_dataset_properties":
          files.properties = file;
          break;

        case "filetype_dataset_archive":
          files.archive = file;
          break;

        case "filetype_results_PCATable":
          files.pcaTable = file;
          break;

        default:
          console.log(`Unknown filetype: ${ file.file_type }`);            
      }
    }    
  }

  if (Object.keys(files).length > 0) dataset.files = files;

  const service = agent.parameters.service_id;

  const type = 
    service.includes("fuse-provider") ? "input" : 
    service.includes("fuse-tool") ? "result" : 
    "unknown";

  dataset.status = agent.agent_status ? agent.agent_status : "unknown";
  dataset.detail = agent.detail;
  dataset.parameters = agent.parameters;
  dataset.service = service;
  dataset.type = type;
  dataset.id = agent.object_id;
  dataset.createdTime = new Date(convertDate(agent.created_time));
  dataset.finishedTime = finishedTime === -1 ? null : finishedTime;
  dataset.description = agent.parameters.description;
  dataset.apiKey = agent.parameters.apikey;
  dataset.accessionId = agent.parameters.accession_id;

  return dataset;
};

const getFile = async (dataset, type = "filetype_dataset_properties") => {
  const urlResponse = await axios.get(`${ process.env.REACT_APP_FUSE_AGENT_API}/objects/url/${ dataset.id }/type/${ type }`);
  const dataResponse = await axios.get(urlResponse.data.url);

  return dataResponse.data;
};

// Exported API functions

export const api = {

  // System config

  getProviders: async () => {
    const response = await axios.get(`${ process.env.REACT_APP_FUSE_AGENT_API }/services/providers`);

    return response.data;
  },

  getTools: async () => {
    const response = await axios.get(`${ process.env.REACT_APP_FUSE_AGENT_API }/services/tools`);

    return response.data;
  },

  // User
  addUser: async user => {
    const response = await axios.post(`${ process.env.REACT_APP_FUSE_AGENT_API }/submitters/add`, null, {
      params: {
        submitter_id: user
      }
    });

    if (response.data.submitter_action_status === "unknown") {
      throw new Error("Submitting user name failed");
    }

    return {
      user: response.data.submitter_id,
      status: response.data.submitter_action_status
    };
  },

  // Dataset objects

  getDataset: getDataset,

  getDatasets: async user => {
    const response = await axios.get(`${ process.env.REACT_APP_FUSE_AGENT_API }/objects/search/${ user }`);

    let datasets = [];
    let failed = [];
    for (const object of response.data.slice(-10)) { // XXX: JUST GET MOST RECENT 10 FOR TESTING
      const id = object.object_id;

      try {
        const dataset = await getDataset(id);

        datasets.push(dataset);
      }
      catch (error) {
        console.log(error);

        failed.push(id);
      }
    }

    datasets.sort((a, b) => b.finishedTime - a.finishedTime);

    return [datasets, failed];
  },

  deleteDataset: async id => {
    const response = await axios.delete(`${ process.env.REACT_APP_FUSE_AGENT_API}/delete/${ id }`);

    return response.data;
  },

  // Data

  getFile: getFile,

  getFiles: async dataset => {
    const files = [];

    for (const key in dataset.files) {
      const data = await getFile(dataset, dataset.files[key].file_type);
      
      files.push(data);
    }

    return files;
  },

  uploadData: async (service, user, expressionFile, propertiesFile, description) => {
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("optional_file_expression", expressionFile);
    if (propertiesFile) formData.append("optional_file_properties", propertiesFile);
    formData.append("service_id", service);
    formData.append("submitter_id", user);
    formData.append("data_type", inputDataType);
    if (description) formData.append("description", description);

    const response = await axios.post(`${ process.env.REACT_APP_FUSE_AGENT_API}/objects/load`, formData);

    return response.data.object_id;
  },

  loadImmunespace: async (service, user, apiKey, groupId, description) => {
    // Dummy files for getting expression and properties data
    const expression = new Blob(["expression"], { type: "text/plain" });
    const properties = new Blob(["properties"], { type: "text/plain" });


    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("service_id", service);
    formData.append("submitter_id", user);
    formData.append("data_type", inputDataType);    
    formData.append("apikey", apiKey);
    formData.append("accession_id", groupId);
    if (description) formData.append("description", description);

    // XXX: Add dummy files
    formData.append("optional_file_expression", expression);
    formData.append("optional_file_properties", properties);

    const response = await axios.post(`${ process.env.REACT_APP_FUSE_AGENT_API}/objects/load`, formData);

    return response.data.object_id;
  },

  analyze: async (service, user, parameters, description) => {
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("service_id", service);
    formData.append("submitter_id", user);
    Object.entries(parameters).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (description) formData.append("description", description);

    const response = await axios.post(`${ process.env.REACT_APP_FUSE_AGENT_API}/analyze`, formData);

    return response.data.object_id;  
  } 
}
