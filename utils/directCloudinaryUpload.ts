/**
 * Utility for direct browser-to-Cloudinary uploads
 * This bypasses the server for better performance and reduced server load
 */

interface CloudinaryUploadOptions {
  uploadPreset: string;
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  onProgress?: (progress: number) => void;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Upload a file directly from the browser to Cloudinary
 * @param file The file to upload
 * @param options Upload options
 * @returns Promise with the Cloudinary upload result
 */
export async function directCloudinaryUpload(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const {
    uploadPreset,
    folder = "writing-ninja-stories",
    resourceType = "auto",
    onProgress,
  } = options;

  // For PDFs, we need to use 'raw' resource type to avoid delivery restrictions
  // file.type === "application/pdf" ? "auto" : "video";
  const actualResourceType =
    file.type === "application/pdf" ? "raw" : resourceType;

  // For PDFs, we use 'raw' resource type which allows them to be accessed
  // without restrictions. The access_mode parameter is not compatible with
  // unsigned upload presets and causes 400 Bad Request errors
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${actualResourceType}/upload`;
  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Note: access_mode parameter removed as it's not compatible with unsigned upload presets

      if (folder) formData.append("folder", folder);

      xhr.open("POST", url, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(
              new Error(
                `Upload failed: ${
                  errorData.error?.message || JSON.stringify(errorData)
                }`
              )
            );
          } catch (e) {
            reject(
              new Error(
                `Upload failed with status ${xhr.status}: ${xhr.statusText}`
              )
            );
          }
        }
      };

      xhr.onerror = function () {
        reject(new Error("Network error during upload"));
      };

      xhr.send(formData);
    });
  } else {
    // Use fetch API if progress tracking is not needed
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    // Note: access_mode parameter removed as it's not compatible with unsigned upload presets
    if (folder) formData.append("folder", folder);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Get more detailed error information from the response
      try {
        const errorData = await response.json();
        throw new Error(
          `Upload failed: ${
            errorData.error?.message || JSON.stringify(errorData)
          }`
        );
      } catch (e) {
        // If we can't parse the response as JSON, throw a generic error with status
        throw new Error(
          `Upload failed with status ${response.status}: ${response.statusText}`
        );
      }
    }

    return response.json();
  }
}
