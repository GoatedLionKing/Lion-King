/**
 * Self-hosted Better Auth. No Grok, OAuth broker, preview identity service, or
 * external authentication system is required. The site owns its own sessions
 * and email/password accounts at /api/auth/*.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { getPglite, getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { Pool } from "pg";
import { pgliteDialect } from "./pglite-dialect";

const explicitBaseURL = env("BETTER_AUTH_URL");
const localOrigins = ["http://localhost:8080", "http://127.0.0.1:8080", "http://[::1]:8080"];
const trustedOrigins = explicitBaseURL ? [explicitBaseURL, ...localOrigins] : localOrigins;
const databaseUrl = env("DATABASE_URL");

const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

const globalRef = globalThis as typeof globalThis & { __goatedAuthSecret__?: string };
function secret() {
  const configured = env("BETTER_AUTH_SECRET");
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production.");
  }
  globalRef.__goatedAuthSecret__ ??= randomBytes(32).toString("hex");
  return globalRef.__goatedAuthSecret__;
}

export const authConfigured = true;
export const SESSION_TOKEN_COOKIE = "__Host-goated-auth.session_token";

export const auth = betterAuth({
  baseURL: explicitBaseURL,
  basePath: "/api/auth",
  secret: secret(),
  database,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 12,
  },
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
    },
  },
  plugins: [tanstackStartCookies()],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Keep DB bootstrap eager for self-hosted startup/readiness.
void getSql();
