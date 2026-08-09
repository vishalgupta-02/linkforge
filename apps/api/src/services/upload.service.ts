// import cloudinary from "../lib/cloudinary.ts";
// import { AppError } from "../utils/api-error.ts";

// export const uploadImage = async (filePath: string) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: "avatars",
//       use_filename: true,
//       unique_filename: true,
//       overwrite: true,
//     });

//     console.log("Result of uploading file", result);

//     return {
//       public_id: result.public_id,
//       url: result.secure_url,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new AppError("Image upload failed", 500);
//   }
// };

// services/upload.service.ts
import cloudinary from "../lib/cloudinary.ts";
import streamifier from "streamifier";

export const uploadImage = async (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
