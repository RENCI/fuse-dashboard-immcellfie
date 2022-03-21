const exampleDatasets = {
  HPA_32: {
    properties: "Testproperties_32.csv",
    expressionData: "HPA.csv",
    taskInfo: "HPA_taskInfo.csv",
    score: "HPA_score.csv",
    scoreBinary: "HPA_score_binary.csv",
    detailScoring: "detailScoring.csv"
  },
  cellfie_3: {
    properties: "Testproperties_3.csv",
    expressionData: "dataTest.csv",
    taskInfo: "dataRecon22_global_percentile.taskInfo.csv",
    score: "dataRecon22_global_percentile.score.csv",
    scoreBinary: "dataRecon22_global_percentile.score_binary.csv",
    detailScoring: "dataRecon22_global_percentile.detailScoring.csv"
  }
};

export const exampleData = {...exampleDatasets.HPA_32};