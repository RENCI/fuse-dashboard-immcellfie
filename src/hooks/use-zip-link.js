import { useState, useEffect } from "react";
import * as JSZip from "jszip";

export const useZipLink = data => {
  const [link, setLink] = useState(null);

  useEffect(() => {
    if (!data || !data.find(data => data.data)) {
      setLink(null);
      return;
    }

    const createZipLink = async () => {
      const zip = new JSZip();

      data.forEach(data => {
        if (data.data) {
          zip.file(data.fileName, data.data);
        }
      });      

      const blob = await zip.generateAsync({ type: "blob" });
  
      setLink(URL.createObjectURL(blob));
    };

    createZipLink();
  }, [data]);

  return link;
};