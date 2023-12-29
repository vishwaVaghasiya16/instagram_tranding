import express from "express";
import cors from "cors";
import http from "http";
import {PORT} from "./config/env.js";
import connectDB from "./helper/dbConnection.js";
import * as route from "./router.js";
import chatModel from "./features/chat/model.js";
import {Server as SocketIOServer} from "socket.io";
import notificationModel from "./features/notification/model.js";
import groupChatModel from "./features/groupChat/model.js";
import groupModel from "./features/group/model.js";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server,{
  cors: {
    origin: "*",
    methods: [ "GET","POST" ],
  },
});

export {io};

const onlineUsers = {};
const typingUsers = {};

io.on("connection",(socket) => {
  console.log(`User connected: ${ socket.id }`);

  /**join room */
  socket.on("join_room",async ({room,userId}) => {
    socket.join(room);
    console.log(`User: ${ socket.id }, Room: ${ room }`);

    // Track online status
    onlineUsers[ socket.id ] = userId;
    io.emit("update_online_status",{
      userId: userId,
      status: "online",
    });
  });

  /**start typing */
  socket.on("start_typing",async ({room,userId}) => {
    typingUsers[ socket.id ] = room;
    io.to(room).emit("user_typing",{
      room,
      user: userId,
      isTyping: true,
    });
    console.log({user: socket.id,isTyping: true,room});
  });

  /**stop typing */
  socket.on("stop_typing",async ({room,userId}) => {
    io.to(room).emit("user_typing",{
      room,
      user: userId,
      isTyping: false,
    });

    console.log({user: socket.id,isTyping: false,room});

    // check if socket id is delete or not
    if (typingUsers[ socket.id ]) {
      console.log(`User ${ socket.id } is still in the typing user object `);
    } else {
      console.log(
        `User ${ socket.id } is successfully removed from typing users`
      );
    }
    delete typingUsers[ socket.id ];
  });

  /**send message */
  socket.on("send_message",async ({sender,reciever,message}) => {
    io.to(sender)
      .to(reciever)
      .emit("receive_message",{
        sender: sender,
        reciever: reciever,
        message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      });

    // Save the message to the database
    const doc = new chatModel({
      sender: sender,
      reciever: reciever,
      message,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    });

    await doc.save();

    // for notification
    const notification = await notificationModel({
      type: "MESSAGE",
      sender: sender,
      reciever: reciever,
    });

    await notification.save();
  });

  /**like post */
  socket.on("like_post",async (data) => {
    console.log(`User ${ data.data.user } liked post ${ data.data.post }`);

    // create notification for the liked post
    const notification = new notificationModel({
      user: data.data.user,
      type: "LIKE_POST",
      post: data.data.post,
    });

    await notification.save();

    // Emit socket event to notify other users about the like
    io.emit("update_feed",{user: data.data.user,post: data.data.post});
  });

  /**like comment */
  socket.on("like_comment",async (data) => {
    console.log(`User ${ data.data.user } liked comment ${ data.data.comment }`);

    // create notification for the liked comment
    const notification = new notificationModel({
      user: data.data.user,
      type: "LIKE_COMMENT",
      comment: data.data.comment,
    });

    await notification.save();
  });

  /**friend request */
  socket.on("friend_request",async (data) => {
    try {
      const {senderId,receiverId} = data.data;

      console.log(`User ${ senderId } sent a friend request to ${ receiverId }`);

      io.to(receiverId).emit("notification",{
        senderId: senderId,
        receiverId: receiverId,
      });
    } catch (error) {
      console.error("Error processing friend request:",error);
    }
  });

  /**follow request */
  socket.on("follow",async (data) => {
    console.log(`User ${ data.data.follower } started following`);

    // create notification for the follow
    const notification = await notificationModel({
      user: data.data.follower,
      type: "FOLLOW",
    });

    await notification.save();
  });

  /**friend request accepted */
  socket.on("friend_request_accepted",async (data) => {
    console.log(`User ${ data.data.sender } accepted friend request.`);

    // create a notification for the friend request acceptance
    const notification = await notificationModel({
      user: data.data.sender,
      type: "ACCEPT_REQUEST",
    });

    await notification.save();
  });

  /**send group message */
  socket.on("send_group_message",async (data) => {
    socket.broadcast.to(data.user).emit("recieve_group_message",data);
    console.log("Group message : ",data);

    const doc = new groupChatModel({
      user: data.user,
      groupId: data.groupId,
      message: data.message,
      time: new Date(),
    });

    await doc.save();
  });

  /**binary data with socket.io */
  socket.on("file",async (data) => {
    const binaryData = Buffer.from(data.binaryData,"base64");

    socket.broadcast.to(data.room).emit("recieve_file",{binaryData});

    const doc = new groupModel({
      user: {userId: data.userId},
      room: data.room,
      binaryData: binaryData,
      time: new Date(),
    });

    await doc.save();

    const totalBytes = binaryData.length;
    let uploadedBytes = 0;

    const updateProgress = () => {
      const progress = Math.round((uploadedBytes / totalBytes) * 100);
      console.log(progress);
    };

    const uploadInterval = setInterval(() => {
      const chunkSize = 1024;
      const chunk = binaryData.slice(uploadedBytes,uploadedBytes + chunkSize);

      uploadedBytes += chunk.length;
      updateProgress();

      if (uploadedBytes >= totalBytes) {
        clearInterval(uploadInterval);
        console.log("Upload complete");

        socket.emit("upload_complete");
      }
    },100);
  });

  /**socket disconnect */
  socket.on("disconnect",() => {
    if (typingUsers[ socket.id ]) {
      io.to(typingUsers[ socket.id ]).emit("user_typing",{
        user: socket.id,
        isTyping: false,
      });
      delete typingUsers[ socket.id ];
    }
    const userId = onlineUsers[ socket.id ];
    if (userId) {
      io.emit("update_online_status",{userId,status: "offline"});
    }
    delete onlineUsers[ socket.id ];
    console.log(`User disconnected: ${ socket.id }`);
  });
});

/** Connect database */
connectDB();

/** CORS */
app.use(
  cors({
    origin: [ "http://localhost:3000" ],
  })
);

app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({extended: true}));

app.use(express.static("./public"));
app.use(express.static("./uploads"));

/** Route */
app.use("/api/auth",route.authRoute);
app.use("/api/post",route.postRoute);
app.use("/api/comment",route.commentRoute);
app.use("/api/replycomment",route.replyCommentRoute);
app.use("/api/report",route.reportRoute);
app.use("/api/reportList",route.reportListRoute);
app.use("/api/chat",route.chateRoute);
app.use("/api/group",route.groupRoute);
app.use("/api/group-chat",route.groupChatRoute);
app.use("/api/notification",route.notificatinRoute);

/** Server running */
server.listen(PORT,() => {
  console.log(`Server is running on port http://localhost:${ PORT }`);
});

/** Uncaught exceptions and unhandled rejections */
process.on("uncaughtException",function (err) {
  console.error("Uncaught Exception:",err.message);
});
process.on("unhandledRejection",function (err) {
  console.error("Unhandled Rejection:",err.message);
});

// // track online status
// io.emit("update_online_status", {
//   sender: sender,
//   reciever: reciever,
//   status: "Online",
// });

// PORT=8000
// MONGODB_URL="mongodb://127.0.0.1:27017"
// JWT_SECRET_KEY="jwtsecretkeyhere"
// SERVER_URL="http://localhost:8000"
// BASE_URL="http://localhost:8000"
// SMTP_PORT="587"
// SMTP_HOST="smtp.gmail.com"
// EMAIL_FROM="node <vishwa.logicgoinfotech@gmail.com>"
// SMTP_USERNAME="vishwa.logicgoinfotech@gmail.com"
// SMTP_PASSWORD="mmtnygivjkejxyse"
// SOCKET_TIMEOUT=30000
