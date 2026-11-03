// Regras puras do PATCH-017 (código na slug, comissão e atribuição de vendas). Sem dependências de servidor.
export const CODIGOS_RESERVADOS = new Set([
  "admin", "loja", "api", "auth", "r", "convite", "painel", "docs", "termos", "privacidade", "reset-password",
  "ao-vivo-k7q9", "lovable", "assets", "static", "login", "entrar", "planos", "suporte", "afiliaplace",
]);

export function validarCodigo(raw: string): string | null {
  const c = raw.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,20}$/.test(c)) return "Use de 3 a 20 caracteres: letras minúsculas, números ou hífen.";
  if (CODIGOS_RESERVADOS.has(c)) return "Esse código é reservado pelo sistema.";
  return null;
}

/** Comissão em reais, arredondada a centavos. */
export const COMISSAO_INICIAL = 50;
export function validarComissao(p: number): string | null {
  return Number.isFinite(p) && p >= 0 && p <= 100 ? null : "A comissão deve ficar entre 0% e 100%.";
}

export function validarLinks(mensal: string, vitalicio: string, dominios: string[], padrao: string[], outros: string[]): string | null {
  for (const l of [mensal, vitalicio]) {
    let u: URL;
    try { u = new URL(l); } catch { return "Link inválido."; }
    if (u.protocol !== "https:") return "O link precisa começar com https://.";
    if (!dominios.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`))) return "O link precisa ser do checkout da Applyfy.";
  }
  if (mensal === vitalicio) return "Os links do Mensal e do Vitalício precisam ser diferentes.";
  if (padrao.includes(mensal) || padrao.includes(vitalicio)) return "Use os seus links de afiliado, não os links padrão.";
  if (outros.includes(mensal) || outros.includes(vitalicio)) return "Esse link já pertence a outro influenciador.";
  return null;
}

/** Código de afiliado (?code=) dentro de um link de checkout. */

export type ConviteEstado = { ativo: boolean; expira_em: string; usos: number; limite_usos: number };
/** Motivo pelo qual o convite não pode ser usado, ou null se está válido. */
export function motivoConviteInvalido(c: ConviteEstado | null, agora = new Date()): string | null {
  if (!c) return "Convite não encontrado.";
  if (!c.ativo) return "Este convite foi desativado.";
  if (new Date(c.expira_em) <= agora) return "Este convite expirou.";
  if (c.usos >= c.limite_usos) return "Este convite já atingiu o limite de usos.";
  return null;
}

/** Link de afiliação/coprodução do gerente: https e domínio da Applyfy. */
export function validarLinkGerente(link: string): string | null {
  try {
    const u = new URL(link);
    if (u.protocol !== "https:" || !/(^|\.)applyfy\.com\.br$/.test(u.hostname)) return "Use um link https da Applyfy.";
    return null;
  } catch { return "Link inválido."; }
}

export function validarLinksGerente(mensal: string, vitalicio: string): string | null {
  const a = validarLinkGerente(mensal); if (a) return `Mensal: ${a}`;
  const b = validarLinkGerente(vitalicio); if (b) return `Vitalício: ${b}`;
  if (mensal.trim() === vitalicio.trim()) return "Os links Mensal e Vitalício precisam ser diferentes.";
  return null;
}

/** Gera código de convite com 10 letras/números minúsculos. */
export function gerarCodigoConvite(rand: () => number = Math.random): string {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => a[Math.floor(rand() * a.length)]).join("");
}

export const LIMITE_CADASTROS_POR_IP_HORA = 5;

/** Aprovação do cadastro pelo admin: próxima etapa, ou mensagem de erro. */
export type AcaoRevisao = "aprovar_afiliacao" | "aprovar_links" | "recusar";
export function proximaEtapa(status: string, acao: AcaoRevisao): { status: string } | { erro: string } {
  if (acao === "aprovar_afiliacao") return status === "afiliacao_pedida" || status === "conta_applyfy" ? { status: "afiliacao_aprovada" } : { erro: "Essa pessoa não está aguardando aprovação da afiliação." };
  if (acao === "aprovar_links") return status === "links_enviados" ? { status: "ativo" } : { erro: "Essa pessoa ainda não enviou os links." };
  return ["afiliacao_pedida", "conta_applyfy", "afiliacao_aprovada", "links_enviados"].includes(status) ? { status: "recusado" } : { erro: "Não há nada para recusar nessa etapa." };
}

/** Retorna o motivo pelo qual a conta não pode ser excluída, ou null se pode. */
export function motivoBloqueioExclusao(alvoUserId: string | null, chamadorId: string, alvoEhAdmin: boolean): string | null {
  if (alvoEhAdmin) return "A conta do administrador não pode ser excluída.";
  if (alvoUserId && alvoUserId === chamadorId) return "Você não pode excluir a sua própria conta.";
  return null;
}
