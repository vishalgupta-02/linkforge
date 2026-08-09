import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.LINKFLOW_CLOUDINARY_CLOUD_NAME!, // ❗ REQUIRED
  api_key: process.env.LINKFLOW_CLOUDINARY_API_KEY!,
  api_secret: process.env.LINKFLOW_CLOUDINARY_API_SECRET!,
  secure: true,
});

export default cloudinary;
