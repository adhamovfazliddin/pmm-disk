"use server";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export async function fetchDriveFiles(folderId: string): Promise<DriveFile[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  
  if (!apiKey) {
    console.warn("GOOGLE_DRIVE_API_KEY is not set. Cannot fetch folder contents from Google Drive API.");
    return [];
  }

  if (!folderId || folderId.trim().length < 10) {
    console.warn("Invalid or missing folder ID:", folderId);
    return [];
  }
  
  try {
    // We only select the fields we need to keep the payload small
    const fields = "files(id, name, mimeType, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink)";
    const query = `'${folderId}' in parents and trashed = false`;
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Drive API] Query: ${query}`);
    }
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;
    
    console.log(`[Drive API] Endpoint URL being called: ${url.replace(apiKey, "HIDDEN_API_KEY")}`);
    
    const response = await fetch(url, { cache: 'no-store' }); // Disable cache to prevent stale empty responses
    
    console.log(`[Drive API] Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Drive API] Raw error body:`, errorText);
      console.error(`Google Drive API Error (${response.status}):`, errorText);
      
      if (response.status === 403) {
        throw new Error("Google Drive jildiga kirish taqiqlangan. Jild «Barcha uchun ochiq» holatda ekanligini tekshiring.");
      }
      if (response.status === 404) {
        throw new Error("Google Drive jildi topilmadi. Jild havolasi to'g'ri ekanligini tekshiring.");
      }
      throw new Error(`Google Drive API xatoligi (${response.status})`);
    }
    
    const data = await response.json();
    console.log(`[Drive API] Parsed ${data.files?.length || 0} files from response`);
    return data.files || [];
  } catch (error) {
    // Re-throw known user-facing errors
    if (error instanceof Error && !error.message.startsWith("Error fetching")) {
      throw error;
    }
    console.error("Error fetching drive files:", error);
    throw new Error("Google Drive bilan bog'lanishda xatolik yuz berdi.");
  }
}
