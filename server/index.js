import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/User.js";
import courseRoutes from "./routes/Course.js";
import paymentRoutes from "./routes/Payments.js";
import profileRoutes from "./routes/Profile.js";
import { connectdb } from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { cloudinaryConnect } from "./config/cloudinary.js";
import fileUpload from "express-fileupload";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 4000;

//database connect 
connectdb();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000"
    })
)
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
)

//cloudinary connect
cloudinaryConnect();

//routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/profile",profileRoutes);

//Default Route
app.get("/", (req, res) => {
    res.send("Your server is up and running...");
})

app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT}`);
})