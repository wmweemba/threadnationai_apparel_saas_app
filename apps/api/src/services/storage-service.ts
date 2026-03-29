import { v2 as cloudinary } from "cloudinary";
import { env } from "../lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload_stream returned no result"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
}

export async function uploadFromUrl(
  url: string,
  folder: string,
  publicId: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(url, {
    folder,
    public_id: publicId,
    resource_type: "image",
  });
  return result.secure_url;
}
