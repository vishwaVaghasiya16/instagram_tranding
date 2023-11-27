import React, { useRef, useState } from "react";
import axios from "axios";

const Main = () => {
  const [file, setFile] = useState();
  const [isPaused, setIsPaused] = useState(false);
  const [lastUploadedChunk, setLastUploadedChunk] = useState(0);
  const cancleTokenSourceRef = useRef();

  /**Upload */
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      // Get uploaded URL from the server
      const response = await axios.get(
        "http://localhost:8000/api/post/uploadUrl"
      );

      const { url } = response.data.data;
      const chunkSize = 1024 * 1024;
      const chunks = [];

      const fileSize = file.size;
      const totalChunks = Math.ceil(fileSize / chunkSize);

      let offset = lastUploadedChunk * chunkSize;

      while (offset < fileSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buffer = await readFileSync(slice);
        chunks.push(buffer);
        offset += chunkSize;
      }

      /**Send each 1MB buffer to the api */
      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData();
        formData.append("chunk", new Blob([chunks[i]]));
        formData.append("fileName", file.name);
        formData.append("totalChunks", totalChunks);
        formData.append("currentChunk", lastUploadedChunk + i + 1);

        // Use Axios to send the formdata to the api
        cancleTokenSourceRef.current = axios.CancelToken.source();
        await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: cancleTokenSourceRef.current.token,
        });

        /**Update the last successfully uploaded chunk */
        setLastUploadedChunk(lastUploadedChunk + i + 1);
      }

      console.log("File uploaded successfully.");
    } catch (error) {
      console.log(error);
    }
  };

  /**Pause large file */
  const handlePause = () => {
    if (cancleTokenSourceRef.current) {
      cancleTokenSourceRef.current.cancel("Upload canceled by the user.");
    }
    setIsPaused(true);
  };

  /**Resume large file */
  const handleResume = () => {
    setIsPaused(false);
    handleUpload();
  };

  /**read file */
  const readFileSync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleResume}>Resume</button>
    </div>
  );
};

export default Main;
