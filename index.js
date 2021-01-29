import { config } from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import cloudinary from "cloudinary";
import morgan from "morgan";

config();
const app = express();
const storage = multer.diskStorage({});
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image")) cb(null, false);
    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", upload.single("image"), async (req, res) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      public_id: "eujin03/image-uploads/" + (Date.now() % 7),
      overwrite: true,
      resource_type: "image",
    });
    res.json({
      success: true,
      url: uploadResult.url,
    });
  } catch (error) {
    res.json({ success: false });
    console.log(error);
  }
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build/"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(PORT));
