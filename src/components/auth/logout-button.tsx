"use client";

import { signout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => signout()}>
      Logout
    </Button>
  );
}
