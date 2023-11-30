import path from "path";
import fs from "fs";
import { successResponse } from "../../helper/apiResponse.js";

const uploadsDirectory = path.join(process.cwd(), "uploads");
const ongoingUploads = {};
const uploadedChunks = {};

/**(Method : 1) Append chunk in file */
export const appendChunkInFile = async (req) => {
  try {
    // destructure required keys
    const { fileId } = req.params;
    const { buffer } = req.file;
    const { fileName, totalChunks, currentChunk, isLastChunk } = req.body;

    if (ongoingUploads[fileId]) {
      // Stop the ongoing upload
      ongoingUploads[fileId].destroy();
      delete ongoingUploads[fileId];
    }

    // upload percentage
    const chunks = Math.floor((currentChunk / totalChunks) * 100);
    console.log(chunks + "%");

    // get file extension from filename
    const fileExt = fileName.split(".").pop();

    // create dir if not exist
    if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

    // output filename
    const outputFileName = `${fileId}.${fileExt}`;

    // create a write stream for the file
    const fileStream = fs.createWriteStream(
      `${uploadsDirectory}/${outputFileName}`,
      {
        flags: "a",
      }
    );

    // store the write stream in ongoingUploads
    ongoingUploads[fileId] = fileStream;

    // compare the current chunk and chunk with last upload chunk
    if (currentChunk === uploadedChunks[fileId]) {
      console.log("Resuming upload from chunk", currentChunk);
    } else {
      console.log("Starting upload from chunk", currentChunk);
    }

    // write the buffer to the file
    fileStream.write(buffer);

    // Track the uploaded chunk
    uploadedChunks[fileId] = currentChunk;

    // when it's the last chunk, close the file stream
    if (isLastChunk) {
      fileStream.end();
      console.log("File uploading successfully.");
      delete ongoingUploads[fileId];
      delete uploadedChunks[fileId];
    }
  } catch (error) {
    console.log(`[ERROR]:`, error);
  }
};

/**(Method : 2) Read all chunks and create file */
export const readAllChunkAndCreateFile = async (req) => {
  try {
    const { fileId } = req.params;
    const chunk = req.file.buffer;
    const { totalChunks, currentChunk, fileName, isLastChunk } = req.body;
    const tempchunkDir = `${uploadsDirectory}/chunks`;

    // create dir if not exist
    if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

    // create chunks directory if not exist
    if (!fs.existsSync(tempchunkDir)) {
      fs.mkdirSync(tempchunkDir);
    }

    const fileExt = fileName.split(".").pop();

    /**upload percentage */
    const percentage = Math.floor((currentChunk / totalChunks) * 100);
    console.log(percentage + "%");

    const chunkFileName = `${fileId}_part_${currentChunk}.${fileExt}`;

    await fs.promises.writeFile(`${tempchunkDir}/${chunkFileName}`, chunk);

    if (Number(totalChunks) === Number(currentChunk)) {
      // create dir if not exist
      if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

      // output filename
      const fileName = `${req.params.fileId}.${fileExt}`;

      /**create writeable stream */
      const writeStream = fs.createWriteStream(
        `${uploadsDirectory}/${fileName}`
      );

      const bufferArray = [];
      for (let i = 1; i <= totalChunks; i++) {
        const chunkFilePath = `${tempchunkDir}/${fileId}_part_${i}.${fileExt}`;

        const chunkBuffer = await fs.promises.readFile(chunkFilePath);
        bufferArray.push(chunkBuffer);

        fs.unlinkSync(chunkFilePath);
      }

      const buffer = Buffer.concat(bufferArray);
      writeStream.write(buffer);
    }

    if (isLastChunk) {
      fileStream.end();
      console.log("File uploading successfully.");
      delete ongoingUploads[fileId];
      delete uploadedChunks[fileId];
    }
  } catch (error) {
    console.log(`[ERROR]:`, error);
  }
};

/**read large file */
export const readLargeFile = async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      res.status(400).send("Bad Request: Please provide a filename.");
      return;
    }

    const filePath = path.join(uploadsDirectory, fileName);

    if (!fs.existsSync(filePath)) {
      return successResponse({
        res,
        statusCode: 404,
        message: "Not Found: The specified file does not exist.",
      });
    }

    const chunkSize = 1024 * 1024;
    /**read stream */
    const readStream = fs.createReadStream(filePath, {
      highWaterMark: chunkSize,
    });

    /**handle event */
    readStream.on("data", (chunk) => {
      res.write(chunk);
    });

    readStream.on("end", () => {
      res.end();
    });

    readStream.pipe(res);
  } catch (error) {
    console.log(`[ERROR]:`, error);
  }
};
