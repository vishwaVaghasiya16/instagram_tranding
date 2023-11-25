// import React, { useCallback, useState } from "react";
// import axios from "axios";

// const Main = () => {
//   const [file, setFile] = useState();
//   const [uploadCancelToken, setUploadCancelToken] = useState(null);

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/post/uploadUrl"
//       );
//       const { url } = response.data.data;

//       const chunkSize = 1024 * 1024; // 1MB
//       const chunks = [];

//       const fileSize = file.size;
//       const totalChunks = Math.ceil(fileSize / chunkSize);

//       let offset = 0;

//       while (offset < fileSize) {
//         const slice = file.slice(offset, offset + chunkSize);
//         const buffer = await readFileAsync(slice);
//         chunks.push(buffer);
//         offset += chunkSize;
//       }

//       const cancelToken = axios.CancelToken.source();
//       setUploadCancelToken(cancelToken);

//       for (let i = 0; i < chunks.length; i++) {
//         if (cancelToken.token.reason) {
//           console.log("Upload paused by user");
//           return;
//         }

//         const formData = new FormData();
//         formData.append("chunk", new Blob([chunks[i]]));
//         formData.append("fileName", file.name);
//         formData.append("totalChunks", totalChunks);
//         formData.append("currentChunk", i + 1);

//         await axios.post(url, formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           cancelToken: cancelToken.token,
//         });
//       }

//       console.log("File uploaded successfully!");
//     } catch (error) {
//       if (axios.isCancel(error)) {
//         console.log("Upload paused by user");
//       } else {
//         console.error(error);
//       }
//     } finally {
//       setUploadCancelToken(null);
//     }
//   };

//   const handlePause = () => {
//     if (uploadCancelToken) {
//       uploadCancelToken.cancel("Upload paused by user");
//     }
//   };

//   const readFileAsync = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();

//       reader.onload = (event) => {
//         resolve(event.target.result);
//       };

//       reader.onerror = (error) => {
//         reject(error);
//       };

//       reader.readAsArrayBuffer(file);
//     });
//   };

//   return (
//     <div>
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleUpload}>Upload</button>
//       <button onClick={handlePause}>Pause</button>
//     </div>
//   );
// };

// export default Main;


/**progress bar is successfully working */
import React, { useCallback, useState } from "react";
import axios from "axios";

const Main = () => {
  const [file, setFile] = useState();
  const [uploadUrl, setUploadUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelToken, setCancelToken] = useState(null);
  const [resumeChunk, setResumeChunk] = useState(1);

  const handleStartUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      // Get upload URL from the server
      const response = await axios.get(
        "http://localhost:8000/api/post/uploadUrl"
      );
      setUploadUrl(response.data.data.url);

      if (!uploading) {
        setUploading(true);
        setProgress(0);
        setCancelToken(axios.CancelToken.source());
      } else {
        console.log("Upload is already in progress");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStopUpload = () => {
    if (cancelToken) {
      cancelToken.cancel("Upload canceled by the user");
      setCancelToken(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || !uploadUrl) {
      alert("Please select a file and start the upload");
      return;
    }

    try {
      const chunkSize = 1024 * 1024; // 1MB
      const chunks = [];

      const fileSize = file.size;
      const totalChunks = Math.ceil(fileSize / chunkSize);

      let offset = (resumeChunk - 1) * chunkSize;

      while (offset < fileSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buffer = await readFileAsync(slice);
        chunks.push(buffer);
        offset += chunkSize;
      }

      for (let i = 0; i < chunks.length; i++) {
        if (!uploading) {
          console.log("Upload stopped by user");
          return;
        }

        const formData = new FormData();
        formData.append("chunk", new Blob([chunks[i]]));
        formData.append("fileName", file.name);
        formData.append("totalChunks", totalChunks);
        formData.append("currentChunk", resumeChunk + i);

        await axios.post(uploadUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: cancelToken.token,
        });

        const currentProgress = Math.floor(
          ((resumeChunk + i) / totalChunks) * 100
        );
        setProgress(currentProgress);
      }

      console.log("File uploaded successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const readFileAsync = (file) => {
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
      <button onClick={handleStartUpload}>Start Upload</button>
      <button onClick={handleStopUpload}>Stop Upload</button>
      <button onClick={handleSubmit}>Upload</button>
      {uploading && <div>Progress: {progress}%</div>}
    </div>
  );
};

export default Main;


