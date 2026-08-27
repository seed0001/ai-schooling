import { db } from "./db";

/**
 * Placeholder identity layer. Until Auth.js is wired in, every request runs as a
 * single dev user derived from env. Swap `getCurrentUser` for a real session
 * lookup later — nothing else in the app needs to change.
 */
export async function getCurrentUser() {
  const email = process.env.DEV_USER_EMAIL ?? "dev@example.com";
  const name = process.env.DEV_USER_NAME ?? "Dev User";
  return db.user.upsert({
    where: { email },
    update: {},
    create: { email, name },
  });
}
