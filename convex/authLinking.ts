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
