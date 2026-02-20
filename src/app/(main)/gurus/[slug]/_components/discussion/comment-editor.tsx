"use client";

import { useActionState, useRef } from "react";
import { createGuruComment } from "@/actions/guru-comments";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Bold, Italic, LinkIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface CommentEditorProps {
  guruId: string;
  pathname: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

function SubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size={compact ? "sm" : "default"}
      className={cn(
        "px-4 font-medium transition-opacity",
        pending && "opacity-70",
      )}
    >
      {pending ? "Posting..." : compact ? "Reply" : "Comment"}
    </Button>
  );
}

export function CommentEditor({
  guruId,
  pathname,
  parentId,
  placeholder = "Join the conversation...",
  onSuccess,
  onCancel,
  compact = false,
}: CommentEditorProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // We wrap the action to handle the success callback
  const [state, action] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await createGuruComment(prevState, formData);
      if (result.unauthenticated) {
        router.push(routes.auth.login);
      } else if (result.success) {
        formRef.current?.reset();
        onSuccess?.();
      }
      return result;
    },
    undefined,
  );

  return (
    <form ref={formRef} action={action}>
      {/* Hidden inputs for the Server Action */}
      <input type="hidden" name="guru_id" value={guruId} />
      <input type="hidden" name="pathname" value={pathname} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <div
        className={cn(
          "border rounded-lg bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden",
          state?.errors?.content ? "border-red-500" : "border-border",
        )}
      >
        <textarea
          name="content"
          className={cn(
            "w-full bg-transparent border-0 text-sm focus:ring-0 placeholder:text-muted-foreground resize-none focus-visible:outline-none",
            compact ? "px-3 py-2 min-h-[60px]" : "p-4 min-h-[100px]",
          )}
          placeholder={placeholder}
        />

        {/* Toolbar & Actions */}
        <div
          className={cn(
            "flex items-center justify-between bg-muted/30 border-t",
            compact ? "px-2 py-1.5" : "px-3 py-2",
          )}
        >
          {!compact && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                type="button"
                aria-label="Bold text"
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Italic text"
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Link"
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Right align buttons if compact toolbar is hidden */}
          <div className={cn("flex items-center gap-2", compact && "ml-auto")}>
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size={compact ? "sm" : "default"}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <SubmitButton compact={compact} />
          </div>
        </div>
      </div>
      {state?.errors?.content && (
        <p className="text-sm text-red-500 mt-1">{state.errors.content[0]}</p>
      )}
      {state?.message && !state?.success && (
        <p className="text-sm text-red-500 mt-1">{state.message}</p>
      )}
    </form>
  );
}
