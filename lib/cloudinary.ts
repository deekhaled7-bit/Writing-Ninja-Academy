import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: File,
  resourceType: "auto" | "video" | "raw" = "auto"
) {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: resourceType,
      folder: "writing-ninja-stories",
      use_filename: true,
      unique_filename: true,
      type: "upload",
      access_mode: "public",
    };

    // For PDF files, use raw resource type to avoid delivery restrictions
    if (file.type === "application/pdf") {
      // const resourceType = file.type === "application/pdf" ? "auto" : "video";

      uploadOptions.resource_type =
        file.type === "application/pdf" ? "auto" : "video";
      uploadOptions.public_id = `${uploadOptions.folder}/${file.name.replace(
        /\.[^/.]+$/,
        ""
      )}_${Date.now()}`;
    } else if (resourceType === "video") {
      uploadOptions.allowed_formats = ["mp4", "mov", "avi"];
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(bytes);
  });
}

export default cloudinary;
