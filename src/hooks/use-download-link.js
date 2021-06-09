// Borrowed from BioData Catalyst Website

import { useMemo } from "react";

export const useDownloadLink = (data, type) => {
  if (!type) type = "text/csv";

  return useMemo(() => {
    if (!data) return null;

    const blob = new Blob([data], { type: type });

    return URL.createObjectURL(blob);
  }, [data]);
};