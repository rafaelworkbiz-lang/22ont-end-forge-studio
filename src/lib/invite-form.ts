export type InviteForm = { foto: string; nome: string; sobrenome: string; email: string; whatsapp: string; senha: string; senha2: string; termos: boolean };
export const FOTO_MAX_BYTES = 2 * 1024 * 1024;
export function validateInviteForm(f: InviteForm): string | null {
  if (!f.foto) return "Adicione sua foto de perfil.";
  if (f.nome.trim().length < 2) return "Digite seu nome.";
  if (f.sobrenome.trim().length < 2) return "Digite seu sobrenome.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Digite um e-mail válido.";
  const d = f.whatsapp.replace(/\D/g, "");
  if (d.length < 10 || d.length > 13) return "Digite seu WhatsApp com DDD.";
  if (f.senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (f.senha !== f.senha2) return "As senhas não são iguais.";
  if (!f.termos) return "Aceite os termos para continuar.";
  return null;
}
