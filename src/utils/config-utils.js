export const getServiceName = service =>
  service.replace("fuse-provider-", "").replace("fuse-tool-", "");

export const getServiceDisplay = service => {
  const name = getServiceName(service);

  return name === "immunespace" ? "ImmuneSpace" :
    name === "cellfie" ? "CellFie" :
    name === "pca" ? "PCA" :
    name.charAt(0).toUpperCase() + name.slice(1);
};