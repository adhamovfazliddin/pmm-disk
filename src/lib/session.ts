import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "default_secret_key_change_me_in_prod";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>, expiresIn: string = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(
  payload: Record<string, unknown>,
  rememberMe: boolean = false
) {
  // rememberMe = true  → 30 kun saqlash (shaxsiy qurilma)
  // rememberMe = false → Session cookie (browser yopilganda o'chadi)
  const expiresIn = rememberMe ? "30d" : "8h";
  const session = await encrypt(payload, expiresIn);

  const cookieStore = await cookies();
  const cookieOptions: Parameters<typeof cookieStore.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  if (rememberMe) {
    cookieOptions.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  // rememberMe = false bo'lganda expires yo'q → session cookie (tab yopilsa tugaydi)

  cookieStore.set("session", session, cookieOptions);
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
