import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

export async function assertAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ owner_user_id: string | null }>`
    select owner_user_id from site_settings where id = 1
  `;
  let owner = rows[0]?.owner_user_id ?? null;
  if (!owner) {
    await sql`
      update site_settings
      set owner_user_id = ${userId}, updated_at = now()
      where id = 1 and owner_user_id is null
    `;
    const again = await sql<{ owner_user_id: string | null }>`
      select owner_user_id from site_settings where id = 1
    `;
    owner = again[0]?.owner_user_id ?? null;
  }
  if (owner !== userId) throw new ForbiddenError();
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ owner_user_id: string | null }>`
      select owner_user_id from site_settings where id = 1
    `;
    const owner = rows[0]?.owner_user_id ?? null;
    return {
      isAdmin: owner === context.userId,
      isClaimable: owner === null,
      userId: context.userId,
    };
  });

export const hasOwner = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ owner_user_id: string | null }>`
    select owner_user_id from site_settings where id = 1
  `;
  return { hasOwner: Boolean(rows[0]?.owner_user_id) };
});

export const getPublicSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  if (!user) return { signedIn: false, isAdmin: false as const };
  const sql = await getSql();
  const rows = await sql<{ owner_user_id: string | null }>`
    select owner_user_id from site_settings where id = 1
  `;
  const owner = rows[0]?.owner_user_id ?? null;
  return {
    signedIn: true,
    isAdmin: owner === user.id || owner === null,
    userId: user.id,
  };
});
