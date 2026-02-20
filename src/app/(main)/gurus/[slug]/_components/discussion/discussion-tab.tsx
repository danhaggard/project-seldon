import { fetchGuruComments } from "@/actions/guru-comments";
import { CommentTree } from "./comment-tree";
import { MessageSquare } from "lucide-react";
import { getClaims, hasPermission } from "@/lib/supabase/rbac";
import { getGuruBySlug } from "@/lib/data/gurus";
import { notFound } from "next/navigation";

interface DiscussionTabProps {
  slug: string;
}

export async function DiscussionTab({ slug }: DiscussionTabProps) {
  // 1. Fetch guru to get the ID
  const guru = await getGuruBySlug(slug);
  if (!guru) {
    notFound();
  }
  const guruId = guru.id;

  const comments = await fetchGuruComments(guruId);
  const claims = await getClaims();
  const currentUserId = claims?.sub;

  const commentsWithPermissions = comments.map((comment) => ({
    ...comment,
    canDelete: hasPermission(claims, "comments.delete", comment.user_id),
  }));

  // 2. Build the tree structure here (or pass flat list to client)
  // We'll pass the flat list to the client component so it can handle
  // optimistic updates and replies easily.

  if (comments.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center pb-24">
        <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">
          No discussions yet. Be the first to start one.
        </p>
        <div className="mt-8 text-left">
          <CommentTree
            comments={[]}
            guruId={guruId}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 pb-24">
      <CommentTree
        comments={commentsWithPermissions}
        guruId={guruId}
        currentUserId={currentUserId}
      />
    </div>
  );
}
