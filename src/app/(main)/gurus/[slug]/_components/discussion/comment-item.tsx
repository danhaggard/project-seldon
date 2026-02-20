"use client";

import { useState } from "react";
import { deleteGuruComment } from "@/actions/guru-comments";
import { CommentEditor } from "./comment-editor";
import { formatDistanceToNow } from "date-fns";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GuruCommentWithPermissions } from "./comment-tree";

export type LocalCommentWithChildren = GuruCommentWithPermissions & {
  children: LocalCommentWithChildren[];
};

interface CommentItemProps {
  comment: LocalCommentWithChildren;
  guruId: string;
  pathname: string;
  currentUserId?: string;
  depth: number;
}

export function CommentItem({
  comment,
  guruId,
  pathname,
  currentUserId,
  depth,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Depth styling configuration
  const hasChildren = comment.children && comment.children.length > 0;
  // Use a subtle distinct avatar color based on depth purely for visual hierarchy aesthetics
  const avatarColors = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100",
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100",
    "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-100",
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-100",
    "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-100",
  ];
  const colorClass = avatarColors[depth % avatarColors.length];

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setIsDeleting(true);
      await deleteGuruComment(comment.id, comment.user_id, pathname);
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <div className="flex gap-3">
        {/* Left Avatar & Thread Line Column */}
        <div className="flex flex-col items-center relative">
          {/* Thread Line Extension (Upwards) for children */}
          {depth > 0 && (
            <>
              {/* Vertical line connecting up to parent */}
              <div className="absolute -left-[22px] -top-8 bottom-4 w-px bg-border"></div>
              {/* Horizontal line pointing to this comment */}
              <div className="absolute -left-[22px] top-4 w-4 h-px bg-border"></div>
            </>
          )}

          <div className="flex items-center gap-1 relative z-10">
            {/* DESIGN CORRECTION: Collapse Toggle on the Left */}
            {hasChildren && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -left-6 text-muted-foreground hover:text-foreground transition-colors bg-background rounded-full"
                aria-label={isCollapsed ? "Expand thread" : "Collapse thread"}
              >
                {isCollapsed ? (
                  <PlusCircle className="w-4 h-4 bg-background" />
                ) : (
                  <MinusCircle className="w-4 h-4 bg-background" />
                )}
              </button>
            )}

            <div
              className={cn(
                "rounded-full border overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase",
                depth === 0 ? "h-8 w-8" : "h-6 w-6 mt-1",
                colorClass,
              )}
            >
              {comment.profiles?.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles?.username || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                comment.profiles?.username?.[0] || "?"
              )}
            </div>
          </div>

          {/* Thread Line (Downwards) to children, visible only if not collapsed */}
          {!isCollapsed && hasChildren && (
            <div className="h-full w-px bg-border mt-2 group-hover:bg-muted-foreground/30 transition-colors"></div>
          )}
        </div>

        {/* Right Content Column */}
        <div className={cn("flex-1", hasChildren ? "pb-4" : "pb-6")}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.profiles?.username || "Anonymous"}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="text-sm leading-relaxed text-foreground/90 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          <div className="flex items-center gap-4 mt-2">
            {!isCollapsed && (
              <>
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reply
                </button>

                {comment.canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs font-medium text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </>
            )}

            {isCollapsed && hasChildren && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="text-xs font-medium text-blue-500 hover:underline"
              >
                {comment.children.length} repl
                {comment.children.length === 1 ? "y" : "ies"} hidden
              </button>
            )}
          </div>

          {/* Inline Reply Editor */}
          {isReplying && (
            <div className="mt-4 mb-2 animate-in fade-in slide-in-from-top-2">
              <CommentEditor
                guruId={guruId}
                pathname={pathname}
                parentId={comment.id}
                placeholder={`Reply to ${comment.profiles?.username || "user"}...`}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => setIsReplying(false)}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Children Container */}
      {!isCollapsed && hasChildren && (
        <div className="flex gap-3 relative mt-2">
          {/* Spacer to align children under the parent's content block */}
          <div className="w-8 flex justify-center flex-shrink-0 relative" />

          <div className="flex-1 space-y-4">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                guruId={guruId}
                pathname={pathname}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
