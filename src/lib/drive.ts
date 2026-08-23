export function extractDriveId(url: string): string | null {
  if (!url) return null;
  // If it's already just an ID (typically 33 characters, alphanumeric with hyphens/underscores)
  if (/^[-\w]{25,}$/.test(url)) {
    return url;
  }
  
  // Regex to match different Google Drive URL formats
  // Matches:
  // - https://drive.google.com/file/d/<FILE_ID>/view
  // - https://drive.google.com/open?id=<FILE_ID>
  // - https://drive.google.com/uc?id=<FILE_ID>
  const match = url.match(/(?:file\/d\/|id=|folders\/|open\?id=)([-\w]+)/);
  return match ? match[1] : null;
}

export function getDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
