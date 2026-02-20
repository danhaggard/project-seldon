import { AuthModal } from "@/components/auth/auth-modal";
import { SignUpForm } from "@/app/auth/sign-up/_components/sign-up-form";

export default function SignUpInterceptRoute() {
  return (
    <AuthModal>
      <SignUpForm isModal />
    </AuthModal>
  );
}
