import postModel from "./model.js";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {deleteFile,handleFile} from "../../helper/buffer.js";
import fs from "fs";
import path from "path";
import {isExist} from "../../helper/isExist.js";
import {v4 as uuidv4} from "uuid";
import {BASE_URL} from "../../config/env.js";
import authModel from "../auth/model.js";
import notificationModel from "../notification/model.js";
import {io} from "../../index.js";

import {
  appendChunkInFile,
  readAllChunkAndCreateFile,
  readLargeFile,
} from "./chunkupload.helper.js";

/**track last uploaded chunks */
const uploadedChunks = {};
const uploading = {};

class controller {
  /**create post */
  static createPost = async (req,res) => {
    const userId = req.user._id;
    try {
      const {caption,description,url} = req.body;

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
      return errorResponse({res,error});
    }
  };

  /**get upload url */
  static getUploadUrl = async (req,res) => {
    try {
      const userId = req.user._id;
      const fileName = req.query.fileName;
      const fileId = req.params.fileId;

      let uploadInfo = uploading[ fileId ];

      if (!uploadInfo) {
        const existingFileId = Object.keys(uploading).find(
          (key) => uploading[ key ].fileName === fileName
        );

        if (existingFileId) {
          uploadInfo = uploading[ existingFileId ];
        } else {
          const newFileId = uuidv4();

          uploadInfo = {
            fileId: newFileId,
            fileName,
            uploadedChunks,
          };

          uploading[ newFileId ] = uploadInfo;
        }
      }

      const url = `${ BASE_URL }/api/post/upload/${ uploadInfo.fileId }`;
      console.log(url);

      return successResponse({
        res,
        statusCode: 200,
        data: {
          fileId: uploadInfo.fileId,
          fileName,
          url,
          userId,
        },
        message: "URL generated successfully.",
      });
    } catch (error) {
      return errorResponse({res,error});
    }
  };

  /**large file uploading */
  static upload = async (req,res) => {
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
      return errorResponse({res,error});
    }
  };

  /**resume chunk uploading */
  static resumeUpload = async (req,res) => {
    try {
      const fileId = req.params.fileId;

      let uploadInfo = uploading[ fileId ];

      if (!uploadInfo) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "Upload information not found for the specified file ID.",
        });
      }

      const url = `${ BASE_URL }/api/post/upload/${ uploadInfo.fileId }`;
      console.log(url);

      return successResponse({
        res,
        statusCode: 200,
        data: {
          fileId: uploadInfo.fileId,
          fileName: uploadInfo.fileName,
          url,
          userId: uploadInfo.userId,
        },
        message: "Upload resumed successfully.",
      });
    } catch (error) {
      return errorResponse({res,error});
    }
  };

  /**read file */
  static readFile = async (req,res) => {
    try {
      await readLargeFile(req,res);
    } catch (error) {
      console.log(error);
      return errorResponse({res,error});
    }
  };

  /**get all posts */
  static getAllPost = async (req,res) => {
    try {
      const {id} = req.params;
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
      return errorResponse({res,error});
    }
  };

  /**update post */
  static updatePost = async (req,res) => {
    const {id} = req.params;
    try {
      const {caption,url,description} = req.body;

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
      const buffer = Buffer.from(url,"base64");
      const newFilePath = path.join(
        process.cwd(),
        "public",
        "images",
        "post",
        post.url
      );

      fs.writeFileSync(newFilePath,buffer);

      // Update the post details with the new URL
      const result = await postModel.findByIdAndUpdate(
        id,
        {$set: {caption,description}},
        {new: true}
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Post updated!",
      });
    } catch (error) {
      return errorResponse({res,error});
    }
  };

  /**delete post */
  static delete = async (req,res) => {
    const {id} = req.params;
    try {
      const result = await isExist({res,id,Model: postModel});

      // Remove image from folder
      await deleteFile({fileName: result.url,folderName: "/images/post"});

      // Delete document from database
      await postModel.findByIdAndDelete(id);

      // success response
      return successResponse({
        res,
        statusCode: 200,
        message: "post deleted successfully!",
      });
    } catch (error) {
      return errorResponse({funName: "post.delete",res,error});
    }
  };

  /**like post */
  static like = async (req,res) => {
    try {
      const post = await postModel.findById(req.params.id);

      // Notify other users about the like
      io.emit("like_post",{userId: post.userId,post: post._id});

      const notification = new notificationModel({
        user: post.userId,
        type: "LIKE_POST",
        post: req.params.id,
      });

      await notification.save();

      if (!post.like.includes(req.user._id)) {
        await postModel.updateOne(
          {_id: req.params.id},
          {$push: {like: req.user._id}}
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "Post is liked.",
        });
      }
    } catch (error) {
      return errorResponse({res,error});
    }
  };

  /**unlike post */
  static unlike = async (req,res) => {
    try {
      const post = await postModel.findById(req.params.id);
      if (post.like.includes(req.user._id)) {
        await postModel.updateOne(
          {_id: req.params.id},
          {$pull: {like: req.user._id}}
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "Post is unliked.",
        });
      } else {
        return successResponse({
          res,
          statusCode: 200,
          message: "Post was not liked before.",
        });
      }
    } catch (error) {
      return errorResponse({res,error});
    }
  };

  /**get timeline (i show my following friends post) */
  static timeline = async (req,res) => {
    const userId = req.user._id;
    try {
      const currentUser = await authModel.findById(userId);
      const post = await postModel.find({userId: currentUser._id});
      const friendPosts = await Promise.all(
        currentUser.following.map((friendId) => {
          return postModel.find({userId: friendId});
        })
      );
      res.json(post.concat(...friendPosts));
    } catch (error) {
      return errorResponse({res,error});
    }
  };
}

export default controller;
