import axios from "axios";

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

const getTasks = async (path, email) => {
  const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }${ path }/task_ids/${ email }`);

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

  // General file loading

  loadFile: async file => {
    const response = await axios.get(window.URL.createObjectURL(file));

    return response.data;
  },
  loadPracticeData: async name => {
    const response = await axios.get(`${ process.env.REACT_APP_PRACTICE_DATA_ROOT }/${ name }`);

    return response.data;
  },

  // Generic Cellfie API (e.g. for uploaded data)

  runCellfie: async (email, expressionData, phenotypeData, sampleNumber, model, parameters) => {   
    // Set data and parameters as form data
    const formData = new FormData();
    formData.append("expression_data", expressionData);
    formData.append("phenotype_data", phenotypeData);
    formData.append("SampleNumber", sampleNumber);
    formData.append("Ref", model);
    Object.entries(parameters).forEach(([key, value]) => formData.append(key, value));

    // Make post request
    const result = await axios.post(
      `${ process.env.REACT_APP_API_ROOT }/cellfie/submit`, 
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" },
        params: { "email": email }
      }
    );

    return result.data.task_id;    
  }, 
  getCellfieExpressionData: async id => await resultStream(CELLFIE_PATH, id, "geneBySampleMatrix"),
  getCellfiePhenotypes: async id => await resultStream(CELLFIE_PATH, id, "phenoDataMatrix"),

  // ImmuneSpace download API

  getImmuneSpaceDownloadId: async (email, groupId, apiKey) => {
    const result = await axios.post(`${ process.env.REACT_APP_API_ROOT }/immunespace/download`, null, {
      params: {
        email: email,
        group: groupId,
        apikey: apiKey
      }
    });

    return result.data.immunespace_download_id;
  },
  getImmuneSpaceDownloads: async email => {
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }/immunespace/download/ids/${ email }`);

    const downloads = result.data.map(({ immunespace_download_id }) => ({ id: immunespace_download_id }));

    const loaded = [];
    const failed = [];
  
    for (const download of downloads) {
      try {
        download.status = await checkTaskStatus(IMMUNESPACE_DOWNLOAD_PATH, download.id);
        download.info = await getTaskInfo(IMMUNESPACE_DOWNLOAD_PATH, download.id);
        download.tasks = [];

        loaded.push(download);
      }
      catch (error) {
        console.log(error);
        console.log(`Error loading download ${ download.id }. Removing from download list.`);

        failed.push(download);
      }
    }
  
    return {
      downloads: loaded,
      failed: failed
    };
  },
  checkImmuneSpaceDownloadStatus: async downloadId => await checkTaskStatus(IMMUNESPACE_DOWNLOAD_PATH, downloadId),
  getImmuneSpaceDownloadInfo: async downloadId => await getTaskInfo(IMMUNESPACE_DOWNLOAD_PATH, downloadId),
  getImmuneSpaceExpressionData: async downloadId => await resultStream(IMMUNESPACE_DOWNLOAD_PATH, downloadId, "geneBySampleMatrix"),
  getImmuneSpacePhenotypes: async downloadId => await resultStream(IMMUNESPACE_DOWNLOAD_PATH, downloadId, "phenoDataMatrix"),

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

  getTasks: async email => {
    const results = await Promise.all([
      getTasks(CELLFIE_PATH, email),
      getTasks(IMMUNESPACE_CELLFIE_PATH, email)
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
}
