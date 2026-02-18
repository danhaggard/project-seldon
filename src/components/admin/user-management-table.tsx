"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Loader2, RefreshCcw } from "lucide-react";
import { toggleUserRole, deleteUser, fetchUsers, User } from "@/actions/admin";
import { Constants } from "@/lib/definitions/database.types";
import { AppRole } from "@/lib/definitions/auth";

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      console.log("data", data);
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleRole = async (
    userId: string,
    role: AppRole,
    isActive: boolean,
  ) => {
    // We unique track processing by user + role to avoid UI flickering
    const processId = `${userId}-${role}`;
    setIsProcessing(processId);

    try {
      await toggleUserRole(userId, role, isActive);

      // Optimistic Update: Update the specific user's roles array
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const newRoles = isActive
            ? [...u.roles, role]
            : u.roles.filter((r: string) => r !== role);
          return { ...u, roles: newRoles };
        }),
      );
    } catch (error) {
      console.error("Failed to toggle role:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This is permanent.")) return;
    setIsProcessing(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Syncing user directory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.display_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-4">
                      {Constants.public.Enums.app_role.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${user.id}-${role}`}
                            checked={user.roles.includes(role)}
                            disabled={
                              isProcessing === `${user.id}-${role}` ||
                              isProcessing === user.id
                            }
                            onCheckedChange={(checked) =>
                              handleToggleRole(
                                user.id,
                                role as AppRole,
                                !!checked,
                              )
                            }
                          />
                          <label
                            htmlFor={`${user.id}-${role}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {role}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isProcessing === user.id}
                      onClick={() => handleDelete(user.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      {isProcessing === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
