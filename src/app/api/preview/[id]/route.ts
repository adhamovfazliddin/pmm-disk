import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  // Next.js 15+ da params bu Promise
  const params = await context.params;
  const fileId = params?.id;
  
  if (!fileId || fileId === "undefined") {
    return new NextResponse(`Fayl ID si topilmadi: ${fileId}`, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return new NextResponse("API Key sozlanmagan", { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    
    // Server-side fetch to Google Drive API
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      console.error(`Google Drive API error for file ${fileId}: ${response.status} ${response.statusText}`);
      
      // Agar faylga ruxsat yo'q bo'lsa yoki topilmasa, Drive View sahifasiga yo'naltirish
      return NextResponse.redirect(`https://drive.google.com/file/d/${fileId}/view`);
    }

    // Proxy the stream back to the browser
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    // "inline" brauzerga buni yuklamasdan o'zining ichki (native) PDF ko'ruvchisida ochishni bildiradi
    headers.set("Content-Disposition", `inline; filename="material-${fileId}.pdf"`);
    
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // response.body is a ReadableStream which NextResponse accepts directly
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in PDF preview proxy:", error);
    // Fallback on error
    return NextResponse.redirect(`https://drive.google.com/file/d/${fileId}/view`);
  }
}