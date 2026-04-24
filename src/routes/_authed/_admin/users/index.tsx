import { createFileRoute, useRouter  } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Eye, Loader2, Mail, Plus, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../../convex/_generated/api.js";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/_authed/_admin/users/")({
  component: UsersPage,
});

function UsersPage() {
  const convex = useConvex();
  const router = useRouter();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    convexQuery(api.users.list, {}),
  );
  const { data: invites, isLoading: isLoadingInvites } = useQuery(
    convexQuery(api.invites.listPending, {}),
  );
  const { data: currentUser } = useQuery(
    convexQuery(api.auth.getCurrentUser, {}),
  );

  const isLoading = isLoadingUsers || isLoadingInvites;

  const inviteMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: "member" | "admin";
    }) => {
      return await convex.mutation(api.invites.create, { email, role });
    },
    onSuccess: () => {
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: Id<"invites">) => {
      return await convex.mutation(api.invites.revoke, { id });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: Id<"users">) => {
      if (
        confirm(
          "Are you sure you want to delete this user? This action cannot be undone.",
        )
      ) {
        return await convex.mutation(api.users.remove, { userId });
      }
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async ({ userId, authUserId }: { userId: Id<"users">; authUserId?: string }) => {
      await authClient.admin.impersonateUser({ userId: authUserId || userId });
      await convex.mutation(api.impersonation.logStart, { impersonatedUserId: userId });
    },
    onSuccess: () => {
      router.navigate({ to: "/" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: Id<"users">; role: "member" | "admin" | "super_admin" }) => {
      return await convex.mutation(api.users.updateRole, { userId, role });
    },
  });

  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">Users</h1>
          <p className="text-[#1E1B4B]/60 mt-1">
            Manage organization members and invitations.
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle className="text-[#1E1B4B]">
                  Invite User
                </DialogTitle>
                <DialogDescription className="text-[#1E1B4B]/60">
                  Send an invitation email to join your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1E1B4B]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@organization.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[#1E1B4B]">
                    Role
                  </Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) => {
                      if (value === "member" || value === "admin") {
                        setInviteRole(value);
                      }
                    }}
                  >
                    <SelectTrigger className="border-[#6366F1]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-[#6366F1]/10 bg-white overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#1E1B4B]/60">User</TableHead>
              <TableHead className="text-[#1E1B4B]/60">Role</TableHead>
              <TableHead className="text-[#1E1B4B]/60">Joined</TableHead>
              <TableHead className="text-[#1E1B4B]/60">Status</TableHead>
              <TableHead className="text-right text-[#1E1B4B]/60 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {users?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]/10">
                          <User className="h-4 w-4 text-[#6366F1]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1E1B4B]">
                            {user.name}
                          </p>
                          <p className="text-sm text-[#1E1B4B]/60">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSuperAdmin && user._id !== currentUser._id ? (
                        <Select
                          value={user.role}
                          onValueChange={(value: "member" | "admin" | "super_admin" | null) => {
                            if (value && confirm(`Change ${user.name}'s role to ${value}?`)) {
                              updateRoleMutation.mutate({ userId: user._id, role: value });
                            }
                          }}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className={`w-[130px] h-8 text-xs capitalize ${
                            user.role === "admin" || user.role === "super_admin"
                              ? "border-[#6366F1]/20 text-[#6366F1]"
                              : "border-gray-200 text-gray-500"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`${
                            user.role === "admin" || user.role === "super_admin"
                              ? "border-[#6366F1]/20 text-[#6366F1]"
                              : "border-gray-200 text-gray-500"
                          } capitalize`}
                        >
                          {user.role === "super_admin" && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-[#1E1B4B]/60">
                      {new Date(user._creationTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#6366F1] hover:text-[#6366F1]/80 hover:bg-[#6366F1]/10 h-8"
                          onClick={() => impersonateMutation.mutate({ userId: user._id, authUserId: user.authUserId })}
                          disabled={
                            impersonateMutation.isPending ||
                            user._id === currentUser?._id
                          }
                          title="Impersonate user"
                        >
                          {impersonateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                          onClick={() => deleteUserMutation.mutate(user._id)}
                          disabled={
                            deleteUserMutation.isPending ||
                            user._id === currentUser?._id
                          }
                        >
                          {deleteUserMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {invites?.map((invite) => (
                  <TableRow key={invite._id} className="bg-gray-50/50">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Mail className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1E1B4B]">
                            {invite.email}
                          </p>
                          <p className="text-sm text-[#1E1B4B]/60 italic font-light">
                            Invitation pending
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-gray-200 text-gray-400 capitalize"
                      >
                        {invite.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#1E1B4B]/60">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                        onClick={() => revokeMutation.mutate(invite._id)}
                        disabled={revokeMutation.isPending}
                      >
                        {revokeMutation.isPending ? "..." : "Revoke"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
