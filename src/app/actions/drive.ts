"use server";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  iconLink?: string;
}

export async function fetchDriveFiles(folderId: string): Promise<DriveFile[]> {
  try {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    
    if (!apiKey) {
      console.warn("GOOGLE_DRIVE_API_KEY is not set. Cannot fetch folder contents from Google Drive API.");
      return [];
    }
    
    // We only select the fields we need to keep the payload small
    const fields = "files(id, name, mimeType, modifiedTime, webViewLink, webContentLink, iconLink)";
    const query = `'${folderId}' in parents and trashed = false`;
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;
    
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Drive API Error (${response.status}):`, errorText);
      return [];
    }
    
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Error fetching drive files:", error);
    return [];
  }
}
