export const models = [
  { organism: "human", name: "iHSA", value: "MT_iHsa.mat" },
  { organism: "human", name: "recon v1", value: "MT_recon_1.mat" },
  { organism: "human", name: "recon v2", value: "MT_recon_2.mat" },
  { organism: "human", name: "recon v2.2", value: "MT_recon_2_2_entrez.mat" },
  { organism: "mouse", name: "iMM1416", value: "MT_iMM1415.mat" },
//  { organism: "mouse", name: "inesMouseModel" },
  { organism: "mouse", name: "quek", value: "MT_quek14.mat" },
  { organism: "rat", name: "iRno", value: "MT_iRno.mat" },
  { organism: "Chinese hamster", name: "iCHOv1", value: "MT_iCHOv1_final.mat" }
];

const getOrganisms = models => {
  return models.reduce((organisms, model) => {
    if (!organisms.includes(model.organism)) organisms.push(model.organism);

    return organisms;
  }, []);
};

export const organisms = getOrganisms(models);

export const getModels = organism => {
  return models.filter(model => model.organism === organism);
};