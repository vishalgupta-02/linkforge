// import type { Request, Response } from "express";
// import { uploadImage } from "../../services/upload.service.ts";

// export const uploadController = async (req: Request, res: Response) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const result = await uploadImage(file.path);

//     return res.json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Upload failed",
//     });
//   }
// };

// controllers/upload.controller.ts
import type { Request, Response } from "express";
import { uploadImage } from "../../services/upload.service.ts";

export const uploadController = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only images allowed" });
    }

    const result: any = await uploadImage(file.buffer);

    return res.json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};
