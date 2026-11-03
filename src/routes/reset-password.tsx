import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Redefinir senha | AfiliaPlace" },
    { name: "description", content: "Recupere o acesso à sua conta AfiliaPlace com uma nova senha." },
    { property: "og:title", content: "Redefinir senha | AfiliaPlace" },
    { property: "og:description", content: "Crie uma nova senha para sua conta AfiliaPlace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResetPasswordScreen,
});