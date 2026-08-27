const dotenv = require('dotenv');
dotenv.config();
const folderId = '1dBMdabVY5Dx2vJ_DuvkFZQ1kaG_MtqU_';
const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
const query = `'${folderId}' in parents and trashed = false`;
const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${apiKey}`;
console.log("URL:", url.replace(apiKey, "HIDDEN_API_KEY"));
fetch(url).then(r => r.json().then(t => console.log("Status:", r.status, "\nResponse:", JSON.stringify(t, null, 2))));
