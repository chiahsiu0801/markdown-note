import { NextAuth } from "next-auth";
import { authConfig } from "/lib/auth.config.ts";

// export { default } from "next-auth/middleware"
export default NextAuth(authConfig).auth();

export const config = { matcher: ["/dashboard"] }