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

// Paths for services
const CELLFIE_PATH = "/cellfie";
const IMMUNESPACE_DOWNLOAD_PATH = "/immunespace/download";
const IMMUNESPACE_CELLFIE_PATH = "/immunespace/cellfie";

const cellfiePath = immuneSpace => immuneSpace ? IMMUNESPACE_CELLFIE_PATH : CELLFIE_PATH;

// Stream helper functions

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

const getDownload = async id => {
  const status = await checkTaskStatus(IMMUNESPACE_DOWNLOAD_PATH, id);
  const info = await getTaskInfo(IMMUNESPACE_DOWNLOAD_PATH, id);

  return {
    id: id,
    status: status,
    info: info,
    tasks: []
  };
};

const getTaskParameters = async (path, id) => {
  const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ path }/parameters/${ id }`);

  return result.data;
};

const checkTaskStatus = async (path, id) => {
  const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ path }/status/${ id }`);

  return result.data.status; 
};

const getTaskInfo = async (path, id) => {
  const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ path }/metadata/${ id }`);

  const info = {...result.data};

  const createDate = key => info[key] ? new Date(info[key]) : null;

  // Convert to dates
  info.date_created = createDate("date_created");
  info.start_date = createDate("start_date");
  info.end_date = createDate("end_date");

  return info;
};

const getTasks = async (path, user) => {
  const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ path }/task_ids/${ user }`);

  const tasks = result.data.map(({ task_id }) => ({ id: task_id }));

  const loaded = [];
  const failed = [];

  for (const task of tasks) {  
    try {
      task.status = await checkTaskStatus(path, task.id);
      task.parameters = await getTaskParameters(path, task.id);
      task.info = await getTaskInfo(path, task.id);

      if (path === IMMUNESPACE_CELLFIE_PATH) task.isImmuneSpace = true;

      loaded.push(task);
    }
    catch (error) {
      console.log(error);
      console.log(`Error loading task ${ task.id }. Removing from task list.`);

      failed.push(task);
    }
  }

  return {
    loaded: loaded,
    failed: failed
  };
};

const deleteTask = async (path, id) => {
  const result = await axios.delete(`${ process.env.REACT_APP_API_ROOT }${ path }/delete/${ id }`);

  return result.data.status === "done";
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
    for (const object of response.data) {
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
  },
/*
  // General file loading

  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadExampleData: async name => {
    const response = await axios.get(`${ process.env.REACT_APP_EXAMPLE_DATA_ROOT }/${ name }`);

    return response.data;
  },

  // Generic Cellfie API (e.g. for uploaded data)

  runCellfie: async (user, expressionData, propertiesData, sampleNumber, model, parameters) => {   
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("expression_data", expressionData);
    formData.append("properties_data", propertiesData);
    formData.append("SampleNumber", sampleNumber);
    formData.append("Ref", model);
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value));

    // Make post request
    const result = await axios.post(
      `${ process.env.REACT_APP_API_ROOT }/cellfie/submit`, 
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" },
        params: { "user": user }
      }
    );

    return result.data.task_id;    
  }, 
  getCellfieExpressionData: async id => await resultStream(CELLFIE_PATH, id, "geneBySampleMatrix"),
  getCellfieproperties: async id => await resultStream(CELLFIE_PATH, id, "phenoDataMatrix"),

  // ImmuneSpace download API

  getImmuneSpaceDownloadId: async (user, groupId, apiKey) => {
    const result = await axios.post(`${ process.env.REACT_APP_API_ROOT }/immunespace/download`, null, {
      params: {
        user: user,
        group: groupId,
        apikey: apiKey
      }
    });

    return result.data.immunespace_download_id;
  },
  getImmuneSpaceDownloads: async user => {
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }/immunespace/download/ids/${ user }`);

    const ids = result.data.map(d => d.immunespace_download_id);

    const loaded = [];
    const failed = [];
  
    for (const id of ids) {
      try {
        const download = await getDownload(id);
        loaded.push(download);
      }
      catch (error) {
        console.log(error);
        console.log(`Error loading download ${ id }. Removing from download list.`);

        failed.push({ id: id });
      }
    }
  
    return {
      downloads: loaded,
      failed: failed
    };
  },
  getImmuneSpaceDownload: async downloadId => await getDownload(downloadId),
  checkImmuneSpaceDownloadStatus: async downloadId => await checkTaskStatus(IMMUNESPACE_DOWNLOAD_PATH, downloadId),
  getImmuneSpaceDownloadInfo: async downloadId => await getTaskInfo(IMMUNESPACE_DOWNLOAD_PATH, downloadId),
  getImmuneSpaceExpressionData: async downloadId => await resultStream(IMMUNESPACE_DOWNLOAD_PATH, downloadId, "geneBySampleMatrix"),
  getImmuneSpaceproperties: async downloadId => await resultStream(IMMUNESPACE_DOWNLOAD_PATH, downloadId, "phenoDataMatrix"),

  // ImmuneSpace Cellfie API

  runImmuneSpaceCellfie: async (downloadId, sampleNumber, model, parameters) => {   
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("SampleNumber", sampleNumber);
    formData.append("Ref", model);
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value));

    // Make post request
    const result = await axios.post(
      `${ process.env.REACT_APP_API_ROOT }/immunespace/cellfie/submit`, 
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" },
        params: { "immunespace_download_id": downloadId }
      }
    );

    return result.data.task_id;    
  },
  
  // Combined API

  getTasks: async user => {
    const results = await Promise.all([
      getTasks(CELLFIE_PATH, user),
      getTasks(IMMUNESPACE_CELLFIE_PATH, user)
    ]);

    return {
      tasks: [...results[0].loaded, ...results[1].loaded],
      failed: [...results[0].failed, ...results[1].failed]
    };
  },
  checkCellfieTaskStatus: async (id, immuneSpace = false) => await checkTaskStatus(cellfiePath(immuneSpace), id), 
  getCellfieTaskParameters: async (id, immuneSpace = false) => await getTaskParameters(cellfiePath(immuneSpace), id),
  getCellfieTaskInfo: async (id, immuneSpace = false) => await getTaskInfo(cellfiePath(immuneSpace), id),
  deleteCellfieTask: async (id, immuneSpace = false) => await deleteTask(cellfiePath(immuneSpace), id),
  getCellfieOutput: async (id, immuneSpace = false) => await getOutput(cellfiePath(immuneSpace), id),
  getCellfieDetailScoring: async (id, immuneSpace = false) => await resultStream(cellfiePath(immuneSpace), id, "detailScoring"),
*/  
}
