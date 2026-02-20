import { AuthModal } from "@/components/auth/auth-modal";
import { LoginForm } from "@/app/auth/login/_components/login-form";

export default function LoginInterceptRoute() {
  return (
    <AuthModal>
      <LoginForm />
    </AuthModal>
  );
}
