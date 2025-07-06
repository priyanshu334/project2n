import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";

/**
 * Uploads a file to Appwrite Storage and returns the file URL
 * @param file The file to upload
 * @param bucketId The Appwrite bucket ID
 * @returns Promise with the file URL
 */
export async function uploadFile(
  file: File,
  bucketId: string
): Promise<string> {
  try {
    // Create unique file ID
    const fileId = ID.unique();

    // Upload file to Appwrite Storage
    const response = await storage.createFile(bucketId, fileId, file);

    // Get file view URL
    const fileUrl = storage.getFileView(bucketId, response.$id);

    return fileUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Uploads multiple files to Appwrite Storage and returns array of file URLs
 * @param files Array of files to upload
 * @param bucketId The Appwrite bucket ID
 * @returns Promise with array of file URLs
 */
export async function uploadMultipleFiles(
  files: File[],
  bucketId: string
): Promise<string[]> {
  try {
    // Upload all files concurrently
    const uploadPromises = files.map((file) => uploadFile(file, bucketId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw error;
  }
}
