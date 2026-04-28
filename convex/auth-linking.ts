export type AuthLinkIdentity = {
  authRecordId: string;
  linkedUserId?: string | null;
  email?: string | null;
};

export type ResolveProjectUserLinkArgs<TUser> = {
  authUser: AuthLinkIdentity;
  getById: (id: string) => Promise<TUser | null>;
  getByEmail: (email: string) => Promise<TUser | null>;
  getUserId: (user: TUser) => string;
  getUserAuthRecordId: (user: TUser) => string | null | undefined;
};

/**
 * Resolve which project user (if any) corresponds to an authenticated identity and whether the link requires repair.
 *
 * Attempts resolution first by `authUser.linkedUserId` then by `authUser.email`. When a user is found, `needsRepair`
 * indicates whether the stored auth record id or linked user id is inconsistent with `authUser.authRecordId` or
 * `authUser.linkedUserId`.
 *
 * @param authUser - Authenticated identity containing `authRecordId`, optional `linkedUserId`, and optional `email`
 * @param getById - Lookup function to fetch a user by id
 * @param getByEmail - Lookup function to fetch a user by email
 * @param getUserId - Function that returns the given user's id
 * @param getUserAuthRecordId - Function that returns the given user's stored auth record id (or null/undefined)
 * @returns An object with:
 *  - `user`: the resolved `TUser` or `null` if no matching user was found
 *  - `resolvedBy`: `"linkedUserId"`, `"email"`, or `null` indicating which field was used to resolve the user
 *  - `needsRepair`: `true` if the resolved user's stored auth/link information is inconsistent with `authUser`, `false` otherwise
 */
export async function resolveProjectUserLink<TUser>({
  authUser,
  getById,
  getByEmail,
  getUserId,
  getUserAuthRecordId,
}: ResolveProjectUserLinkArgs<TUser>) {
  if (authUser.linkedUserId) {
    const linkedUser = await getById(authUser.linkedUserId);
    if (linkedUser) {
      return {
        user: linkedUser,
        resolvedBy: "linkedUserId" as const,
        needsRepair: getUserAuthRecordId(linkedUser) !== authUser.authRecordId,
      };
    }
  }

  if (!authUser.email) {
    return {
      user: null,
      resolvedBy: null,
      needsRepair: false,
    };
  }

  const emailUser = await getByEmail(authUser.email);
  if (!emailUser) {
    return {
      user: null,
      resolvedBy: null,
      needsRepair: false,
    };
  }

  return {
    user: emailUser,
    resolvedBy: "email" as const,
    needsRepair:
      authUser.linkedUserId !== getUserId(emailUser) ||
      getUserAuthRecordId(emailUser) !== authUser.authRecordId,
  };
}
