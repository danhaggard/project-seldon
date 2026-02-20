"use client";

import { useMemo } from "react";
import { GuruCommentWithProfile } from "@/actions/guru-comments";
import { CommentItem, LocalCommentWithChildren } from "./comment-item";
import { CommentEditor } from "./comment-editor";
import { usePathname } from "next/navigation";

export type GuruCommentWithPermissions = GuruCommentWithProfile & {
  canDelete: boolean;
};

interface CommentTreeProps {
  comments: GuruCommentWithPermissions[];
  guruId: string;
  currentUserId?: string;
}

export function CommentTree({
  comments,
  guruId,
  currentUserId,
}: CommentTreeProps) {
  const pathname = usePathname();

  // Reconstruct the nested tree from the flat list
  const rootComments = useMemo(() => {
    const commentMap = new Map<string, LocalCommentWithChildren>();
    const roots: LocalCommentWithChildren[] = [];

    // First pass: create all map entries
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // Second pass: wire up children
    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // Fallback if parent is missing (e.g. data anomaly)
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  return (
    <div>
      {/* Top level editor */}
      <div className="mb-8">
        <CommentEditor
          guruId={guruId}
          pathname={pathname}
          placeholder="Join the conversation..."
        />
      </div>

      {/* Render roots */}
      <div className="space-y-6">
        {rootComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            guruId={guruId}
            pathname={pathname}
            currentUserId={currentUserId}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
