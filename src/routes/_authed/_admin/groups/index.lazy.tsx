import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { ArrowRight, FolderOpen, Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../../convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export const Route = createLazyFileRoute("/_authed/_admin/groups/")({
  component: GroupsPage,
});

function GroupsPage() {
  const convex = useConvex();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const { data: groups, isLoading } = useQuery(
    convexQuery(api.groups.list, {}),
  );

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      return await convex.mutation(api.groups.create, { name, description });
    },
    onSuccess: () => {
      setCreateDialogOpen(false);
      setGroupName("");
      setGroupDescription("");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: groupName, description: groupDescription });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">Groups</h1>
          <p className="text-[#1E1B4B]/60 mt-1">
            Organize members into groups for targeted messaging.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="text-[#1E1B4B]">
                  Create Group
                </DialogTitle>
                <DialogDescription className="text-[#1E1B4B]/60">
                  Create a new group to organize your members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#1E1B4B]">
                    Group Name
                  </Label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                    <Input
                      id="name"
                      placeholder="e.g., Marketing Team"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#1E1B4B]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What is this group for?"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-[#6366F1]/10">
              <CardContent className="p-6">
                <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link
              key={group._id}
              to="/groups/detail"
              search={{ id: group._id }}
            >
              <Card className="border-[#6366F1]/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10">
                      <FolderOpen className="h-5 w-5 text-[#6366F1]" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#6366F1]/40" />
                  </div>
                  <CardTitle className="text-lg text-[#1E1B4B] mt-3">
                    {group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#1E1B4B]/60 line-clamp-2">
                    {group.description || "No description provided"}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#1E1B4B]/60">
                    <Users className="h-4 w-4" />
                    <span>Click to view members</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-[#6366F1]/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-[#6366F1]/30" />
            <p className="mt-4 text-lg font-medium text-[#1E1B4B]">
              No groups yet
            </p>
            <p className="text-[#1E1B4B]/60">
              Create your first group to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
