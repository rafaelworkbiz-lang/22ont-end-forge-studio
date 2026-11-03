import { somarUso } from "./store-ai-art";
import { custoEstimado, contaNoLimite, inicioDoMes, moderar, msgLimite, MSG_BLOQUEIO, MSG_ERRO, IA_OPCOES, type IaEstilo, type IaTipo } from "./store-ai-moderation";

export type GerarInput = { userId: string; lojaId: string; tipo: IaTipo; estilo: IaEstilo; descricao: string | null; nome: string; nicho: string | null; cor: string; plano: "mensal" | "vitalicio"; comTexto?: boolean; peso?: number };
export type GerarRepo = {
  limite(plano: "mensal" | "vitalicio"): Promise<number>;
  statusDoMes(userId: string, desde: Date): Promise<(string | { status: string; peso?: number | null })[]>;
  bloqueios(): Promise<{ marcas: string[]; reservados: string[] }>;
  registrar(row: { tipo: IaTipo; estilo: string; descricao: string | null; status: "ok" | "erro" | "bloqueado"; motivo?: string | null; opcoes?: string[]; custo?: number; conceitos?: unknown[]; peso?: number }): Promise<string>;
  gerarImagens(tipo: IaTipo, n: number, input: GerarInput): Promise<string[] | { paths: string[]; conceitos?: unknown[]; custo?: number }>; // caminhos salvos
};
export type GerarResult =
  | { ok: true; geracaoId: string; opcoes: string[]; conceitos: unknown[]; usado: number; limite: number }
  | { ok: false; code: "limite" | "bloqueado" | "erro"; error: string; usado: number; limite: number };

/** Orquestra limite → moderação → geração. Só status 'ok' conta no limite. */
export async function gerarCore(repo: GerarRepo, input: GerarInput, now = new Date()): Promise<GerarResult> {
  const [limite, statuses] = await Promise.all([repo.limite(input.plano), repo.statusDoMes(input.userId, inicioDoMes(now))]);
  const usado = somarUso(statuses.map(x => typeof x === "string" ? { status: x } : x)); const peso = input.peso ?? 1; void contaNoLimite;
  if (usado + peso > limite + 1e-9) return { ok: false, code: "limite", error: msgLimite(limite, now), usado, limite };
  const { marcas, reservados } = await repo.bloqueios();
  const hit = moderar([input.nome, input.nicho, input.descricao], marcas, reservados);
  if (hit) {
    await repo.registrar({ tipo: input.tipo, estilo: input.estilo, descricao: input.descricao, status: "bloqueado", motivo: hit });
    return { ok: false, code: "bloqueado", error: MSG_BLOQUEIO, usado, limite };
  }
  let paths: string[]; let conceitos: unknown[] = []; let custo = custoEstimado(input.tipo);
  try {
    const g = await repo.gerarImagens(input.tipo, IA_OPCOES[input.tipo], input);
    if (Array.isArray(g)) paths = g; else { paths = g.paths; conceitos = g.conceitos ?? []; if (g.custo != null) custo = g.custo; }
    if (!paths.length) throw new Error("vazio");
  } catch (e) {
    // Recusa da moderação do provedor: tratada como bloqueio (não conta no limite).
    if (e instanceof Error && e.message === "moderacao") {
      await repo.registrar({ tipo: input.tipo, estilo: input.estilo, descricao: input.descricao, status: "bloqueado", motivo: "moderação do provedor" });
      return { ok: false, code: "bloqueado", error: MSG_BLOQUEIO, usado, limite };
    }
    await repo.registrar({ tipo: input.tipo, estilo: input.estilo, descricao: input.descricao, status: "erro", motivo: e instanceof Error ? e.message.slice(0, 200) : "erro" });
    return { ok: false, code: "erro", error: e instanceof Error && e.message === "creditos" ? "Os créditos de IA acabaram. Avise o administrador para recarregar." : e instanceof Error && e.message === "gateway 429" ? "Muitos pedidos agora. Tente de novo em instantes." : MSG_ERRO, usado, limite };
  }
  const geracaoId = await repo.registrar({ tipo: input.tipo, estilo: input.estilo, descricao: input.descricao, status: "ok", opcoes: paths, custo, conceitos, peso });
  return { ok: true, geracaoId, opcoes: paths, conceitos, usado: usado + peso, limite };
}
