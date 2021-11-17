import axios from "axios";

// Paths for services
const CELLFIE_PATH = "/cellfie";
const IMMUNESPACE_DOWNLOAD_PATH = "/immunespace/download";
const IMMUNESPACE_CELLFIE_PATH = "/immunespace/cellfie";

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

  for (const task of tasks) {
    task.status = await checkTaskStatus(CELLFIE_PATH, task.id);
    task.parameters = await getTaskParameters(CELLFIE_PATH, task.id);
    task.info = await getTaskInfo(CELLFIE_PATH, task.id);
  }

  return tasks;
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
  getCellfieTasks: async email => await getTasks(CELLFIE_PATH, email),
  checkCellfieTaskStatus: async id => await checkTaskStatus(CELLFIE_PATH, id), 
  getCellfieTaskParameters: async id => await getTaskParameters(CELLFIE_PATH, id),
  getCellfieTaskInfo: async id => await getTaskInfo(CELLFIE_PATH, id),
  deleteCellfieTask: async id => await deleteTask(CELLFIE_PATH, id),
  getCellfieExpressionData: async id => await resultStream(CELLFIE_PATH, id, "geneBySampleMatrix"),
  getCellfiePhenotypes: async id => await resultStream(CELLFIE_PATH, id, "phenoDataMatrix"),
  getCellfieOutput: async id => await getOutput(CELLFIE_PATH, id),
  getCellfieDetailScoring: async id => await resultStream(CELLFIE_PATH, id, "detailScoring"),

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
  getImmuneSpaceDownloadIds: async email => {
    const result = await axios.get(`${ process.env.REACT_APP_API_ROOT }/immunespace/download/ids/${ email }`);

    return result.data.map(d => d.immunespace_download_id);
  },
  checkImmunspaceDownloadStatus: async downloadId => await checkTaskStatus(IMMUNESPACE_DOWNLOAD_PATH, downloadId),
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
  getImmuneSpaceCellfieTasks: async email => await getTasks(IMMUNESPACE_CELLFIE_PATH, email),
  checkImmuneSpaceCellfieTaskStatus: async id => await checkTaskStatus(IMMUNESPACE_CELLFIE_PATH, id), 
  getImmuneSpaceCellfieTaskParameters: async id => await getTaskParameters(IMMUNESPACE_CELLFIE_PATH, id),
  getImmuneSpaceCellfieTaskInfo: async id => await getTaskInfo(IMMUNESPACE_CELLFIE_PATH, id),
  deleteImmuneSpaceCellfieTask: async id => await deleteTask(IMMUNESPACE_CELLFIE_PATH, id),
  getImmuneSpaceCellfieOutput: async id => await getOutput(IMMUNESPACE_CELLFIE_PATH, id),
  getImmuneSpaceCellfieDetailScoring: async id => await resultStream(IMMUNESPACE_CELLFIE_PATH, id, "detailScoring"),

  // Combined API

  getTasks: async email => {
    const results = await Promise.all([
      getTasks(CELLFIE_PATH, email),
      getTasks(IMMUNESPACE_CELLFIE_PATH, email)
    ]);

    return [
      ...results[0],
      ...results[1]
    ];
  }
}
