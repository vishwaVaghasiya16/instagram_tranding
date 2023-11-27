import postModel from "./model.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { deleteFile, handleFile } from "../../helper/buffer.js";
import fs from "fs";
import path from "path";
import { isExist } from "../../helper/common.js";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../../config/env.js";

import {
  appendChunkInFile,
  readAllChunkAndCreateFile,
  readLargeFile,
} from "./chunkupload.helper.js";

/**track last uploaded chunks */
const uploadedChunks = {};

class controller {
  /**create post */
  static createPost = async (req, res) => {
    const userId = req.user._id;
    try {
      const { caption, description, url } = req.body;

      const imageUrl = await handleFile({
        file: url,
        folderName: "/images/post",
      });

      const doc = {
        url: imageUrl,
        caption: caption,
        description: description,
        userId,
      };

      /**result */
      const result = await postModel(doc).save();

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Your post has been created! 🚀",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get upload url */
  static getUploadUrl = async (req, res) => {
    try {
      const fileId = uuidv4();
      const url = `${BASE_URL}/api/post/upload/${fileId}`;

      return successResponse({
        res,
        statusCode: 200,
        data: { fileId, url },
        message: "URL generated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**large file uploading */
  static upload = async (req, res) => {
    try {
      // Method 1
      await appendChunkInFile(req);

      // Method 2
      // await readAllChunkAndCreateFile(req);

      successResponse({
        res,
        statusCode: 200,
        message: "File uploaded successfully.",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({ res, error });
    }
  };

  /**read file */
  static readFile = async (req, res) => {
    try {
      await readLargeFile(req, res);
    } catch (error) {
      console.log(error);
      return errorResponse({ res, error });
    }
  };

  /**get last uploaded chunk */
  static lastUploadedChunk = async (req, res) => {
    try {
      const { fileId } = req.params;
      const lastUploadedChunk = uploadedChunks[fileId];

      return successResponse({
        res,
        message: "Last uploaded chunk information retrieved successfully.",
        data: {
          fileId,
          lastUploadedChunk,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        message: "Error retrieving last uploaded chunk information.",
      });
    }
  };

  // Import necessary modules

  /**(Method : 2) Resume file upload */
  static resumeFileUpload = async (req, res) => {
    try {
      const { fileId } = req.params;
      const { fileName, totalChunks } = req.body;

      const fileExt = fileName.split(".").pop();
      const tempchunkDir = `${uploadsDirectory}/chunks`;

      if (!fs.existsSync(tempchunkDir)) {
        return res
          .status(400)
          .json({ error: "No chunks found for resuming upload" });
      }

      const bufferArray = await Promise.all(
        Array.from({ length: totalChunks }, (_, i) => {
          const chunkFilePath = `${tempchunkDir}/${fileId}_part_${i + 1
            }.${fileExt}`;
          return fs.promises.readFile(chunkFilePath);
        })
      );

      const outputFileName = `${fileId}.${fileExt}`;
      const writeStream = fs.createWriteStream(
        `${uploadsDirectory}/${outputFileName}`,
        {
          flags: "a", // append mode
        }
      );

      bufferArray.forEach((chunkBuffer, i) => {
        const chunkFilePath = `${tempchunkDir}/${fileId}_part_${i + 1
          }.${fileExt}`;
        fs.unlinkSync(chunkFilePath);
        writeStream.write(chunkBuffer);
      });

      writeStream.end();

      return res.json(successResponse("File upload resumed successfully"));
    } catch (error) {
      console.error("[ERROR]:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**get all posts */
  static getAllPost = async (req, res) => {
    try {
      const { id } = req.params;
      let filter = {};
      if (id) filter._id = id;
      const getPost = await postModel.find(filter);

      return successResponse({
        res,
        statusCode: 200,
        data: getPost,
        message: "Post list retrived successfully",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**update post */
  static updatePost = async (req, res) => {
    const { id } = req.params;
    try {
      const { caption, url, description } = req.body;

      const post = await postModel.findById(id);
      if (!post) {
        return errorResponse({
          funName: "post.update",
          res,
          error: Error("Post not found"),
          statusCode: 404,
        });
      }

      // Upload the new image
      const buffer = Buffer.from(url, "base64");
      const newFilePath = path.join(
        process.cwd(),
        "public",
        "images",
        "post",
        post.url
      );

      fs.writeFileSync(newFilePath, buffer);

      // Update the post details with the new URL
      const result = await postModel.findByIdAndUpdate(
        id,
        { $set: { caption, description } },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Post updated!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete post */
  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await isExist({ res, id, Model: postModel });

      // Remove image from folder
      await deleteFile({ fileName: result.url, folderName: "/images/post" });

      // Delete document from database
      await postModel.findByIdAndDelete(id);

      // success response
      return successResponse({
        res,
        statusCode: 200,
        message: "post deleted successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "post.delete", res, error });
    }
  };
}

export default controller;
