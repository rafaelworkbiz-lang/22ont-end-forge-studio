import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar ou criar conta | AfiliaPlace" },
    { name: "description", content: "Entre na AfiliaPlace ou crie sua conta com e-mail e senha." },
    { property: "og:title", content: "Sua conta | AfiliaPlace" },
    { property: "og:description", content: "Seu acesso às oportunidades da AfiliaPlace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AuthScreen,
});