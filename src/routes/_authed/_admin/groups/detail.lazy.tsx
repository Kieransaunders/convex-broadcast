import { useSearch, Link, createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
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
import {
  ArrowLeft,
  Plus,
  User,
  Loader2,
  Trash2,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useConvex } from "convex/react";
import type { Id } from "../../../../../convex/_generated/dataModel.js";

export const Route = createLazyFileRoute("/_authed/_admin/groups/detail")({
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { id } = useSearch({ from: "/_authed/_admin/groups/detail" }) as { id: string };
  const convex = useConvex();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedRole, setSelectedRole] = useState<"member" | "manager">(
    "member",
  );

  const { data: group, isLoading: groupLoading } = useQuery(
    convexQuery(api.groups.getById, { id: id as Id<"groups"> }),
  );
  const { data: members, isLoading: membersLoading } = useQuery(
    convexQuery(api.groups.getMembers, { groupId: id as Id<"groups"> }),
  );
  const { data: users, isLoading: usersLoading } = useQuery(
    convexQuery(api.users.list, {}),
  );

  const addMembersMutation = useMutation({
    mutationFn: async ({
      groupId,
      userIds,
      role,
    }: {
      groupId: Id<"groups">;
      userIds: Id<"users">[];
      role: "member" | "manager";
    }) => {
      // Add members one by one
      for (const userId of userIds) {
        await convex.mutation(api.groups.addMember, { groupId, userId, role });
      }
    },
    onSuccess: () => {
      setAddMemberOpen(false);
      setSelectedUserIds(new Set());
      setSearchQuery("");
      setSelectedRole("member");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId: Id<"groupMemberships">) => {
      return await convex.mutation(api.groups.removeMember, { membershipId });
    },
  });

  // Filter out users already in the group
  const availableUsers = useMemo(() => {
    if (!users) return [];
    const memberIds = new Set(members?.map((m) => m.userId) || []);
    return users.filter((user) => !memberIds.has(user._id));
  }, [users, members]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [availableUsers, searchQuery]);

  const selectedUsers = useMemo(() => {
    return availableUsers.filter((user) => selectedUserIds.has(user._id));
  }, [availableUsers, selectedUserIds]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      // Deselect all visible
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        filteredUsers.forEach((u) => newSet.delete(u._id));
        return newSet;
      });
    } else {
      // Select all visible
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        filteredUsers.forEach((u) => newSet.add(u._id));
        return newSet;
      });
    }
  };

  const handleRemoveSelected = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.size === 0) return;
    addMembersMutation.mutate({
      groupId: id as Id<"groups">,
      userIds: Array.from(selectedUserIds) as Id<"users">[],
      role: selectedRole,
    });
  };

  const handleClose = () => {
    setAddMemberOpen(false);
    setSelectedUserIds(new Set());
    setSearchQuery("");
    setSelectedRole("member");
  };

  if (groupLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-[#6366F1]/30" />
        <p className="mt-4 text-lg text-[#1E1B4B]">Group not found</p>
        <Button variant="outline" className="mt-4 bg-[#6366F1] text-white">
          <Link to="/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#1E1B4B]">
          <Link to="/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">{group.name}</h1>
          <p className="text-[#1E1B4B]/60">
            {group.description || "No description"}
          </p>
        </div>
      </div>

      <Card className="border-[#6366F1]/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-[#1E1B4B]">
            Members ({members?.length || 0})
          </CardTitle>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger
              render={
                <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Members
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
              <form
                onSubmit={handleAddMembers}
                className="flex flex-col h-full"
              >
                <DialogHeader>
                  <DialogTitle className="text-[#1E1B4B]">
                    Add Members
                  </DialogTitle>
                  <DialogDescription className="text-[#1E1B4B]/60">
                    Search and select users to add to this group.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 flex flex-col gap-4 py-4">
                  {/* Selected users chips */}
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <Badge
                          key={user._id}
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <span className="truncate max-w-[150px]">
                            {user.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSelected(user._id)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#6366F1]/20"
                    />
                  </div>

                  {/* Role selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#1E1B4B]">
                      Role:
                    </span>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => {
                        if (value === "member" || value === "manager") {
                          setSelectedRole(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-32 border-[#6366F1]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-[#1E1B4B]/60 ml-auto">
                      {selectedUserIds.size} selected
                    </span>
                  </div>

                  {/* User list */}
                  <div className="flex-1 min-h-0 border border-[#6366F1]/20 rounded-lg overflow-hidden flex flex-col">
                    {/* Header with select all */}
                    <div className="flex items-center gap-3 p-3 border-b border-[#6366F1]/10 bg-gray-50/50">
                      <Checkbox
                        checked={
                          filteredUsers.length > 0 &&
                          filteredUsers.every((u) => selectedUserIds.has(u._id))
                        }
                        onCheckedChange={handleSelectAll}
                        disabled={filteredUsers.length === 0}
                      />
                      <span className="text-sm font-medium text-[#1E1B4B]">
                        {filteredUsers.length > 0 &&
                        filteredUsers.every((u) => selectedUserIds.has(u._id))
                          ? "Deselect All"
                          : "Select All"}
                      </span>
                      <span className="text-sm text-[#1E1B4B]/60 ml-auto">
                        {filteredUsers.length} available
                      </span>
                    </div>

                    {/* Scrollable user list */}
                    <div className="flex-1 overflow-y-auto">
                      {usersLoading ? (
                        <div className="p-4 space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="h-12 bg-gray-100 rounded animate-pulse"
                            />
                          ))}
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        <div className="divide-y divide-[#6366F1]/10">
                          {filteredUsers.map((user) => (
                            <label
                              key={user._id}
                              className="flex items-center gap-3 p-3 hover:bg-[#6366F1]/5 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={selectedUserIds.has(user._id)}
                                onCheckedChange={() =>
                                  handleToggleUser(user._id)
                                }
                              />
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10">
                                  <User className="h-4 w-4 text-[#6366F1]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-[#1E1B4B] truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-sm text-[#1E1B4B]/60 truncate">
                                    {user.email}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`shrink-0 capitalize ${
                                    user.role === "admin" ||
                                    user.role === "super_admin"
                                      ? "border-[#6366F1]/20 text-[#6366F1]"
                                      : "border-gray-200 text-gray-500"
                                  }`}
                                >
                                  {user.role}
                                </Badge>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="p-8 text-center">
                          <User className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                          <p className="mt-2 text-[#1E1B4B]/60">
                            No available users to add
                          </p>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Search className="mx-auto h-12 w-12 text-[#6366F1]/30" />
                          <p className="mt-2 text-[#1E1B4B]/60">
                            No users match your search
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-[#6366F1]"
                          >
                            Clear search
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="border-[#6366F1]/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      selectedUserIds.size === 0 || addMembersMutation.isPending
                    }
                    className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                  >
                    {addMembersMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        Add{" "}
                        {selectedUserIds.size > 0 &&
                          `(${selectedUserIds.size})`}{" "}
                        Members
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {membersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#1E1B4B]/60">Member</TableHead>
                  <TableHead className="text-[#1E1B4B]/60">Role</TableHead>
                  <TableHead className="text-[#1E1B4B]/60">Added</TableHead>
                  <TableHead className="text-[#1E1B4B]/60 w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]/10">
                          <User className="h-4 w-4 text-[#6366F1]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1E1B4B]">
                            {member.user?.name}
                          </p>
                          <p className="text-sm text-[#1E1B4B]/60">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "manager" ? "default" : "secondary"
                        }
                        className={
                          member.role === "manager"
                            ? "bg-[#6366F1] text-white"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#1E1B4B]/60">
                      {new Date(member.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeMemberMutation.mutate(member._id)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-[#6366F1]/30" />
              <p className="mt-2 text-[#1E1B4B]/60">No members yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
