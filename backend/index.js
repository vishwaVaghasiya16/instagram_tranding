import express from "express";
import { PORT } from "./config/env.js";
import connectDB from "./helper/dbConnection.js";
import * as route from "./router.js";
import cors from "cors";
const app = express();

/**connect database */
connectDB();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./public"));
app.use(express.static("./uploads"));

/**route */
app.use("/api/auth", route.authRoute);
app.use("/api/post", route.postRoute);
app.use("/api", route.likeRoute);
app.use("/api/comment", route.commentRoute);
app.use("/api/comment", route.commentsLikeDislikeRoute);
app.use("/api/replycomment", route.replyCommentRoute);
app.use("/api/likeReply", route.replyLikeRoute);
app.use("/api/report", route.reportRoute);
app.use("/api/reportList", route.reportListRoute);

/**server running */
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

/**Uncaught exceptions and unhandled rejections */
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err.message);
});
