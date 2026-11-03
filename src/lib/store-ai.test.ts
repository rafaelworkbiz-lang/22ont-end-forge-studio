import { describe, expect, it } from "vitest";
import { moderar, msgLimite } from "./store-ai-moderation";
import { gerarCore, type GerarRepo, type GerarInput } from "./store-ai-core";

const marcas = ["shopee", "mercado livre", "nike"];
const input: GerarInput = { userId: "u", lojaId: "l", tipo: "logo", estilo: "Moderno", descricao: "folha verde", nome: "Casa Achados", nicho: "Casa", cor: "#FFE600", plano: "mensal" };
function repo(statuses: string[], limite: number, fail = false) {
  const reg: string[] = [];
  const r: GerarRepo = {
    limite: async () => limite, statusDoMes: async () => statuses, bloqueios: async () => ({ marcas, reservados: ["shopee", "painel"] }),
    registrar: async row => { reg.push(row.status); return "g1"; },
    gerarImagens: async (_t, n) => { if (fail) throw new Error("boom"); return Array.from({ length: n }, (_, i) => `p${i}`); },
  };
  return { r, reg };
}

describe("IA de identidade", () => {
  it("bloqueia 'logo da Shopee'", () => expect(moderar(["Minha loja", null, "logo da Shopee"], marcas)).toBe("shopee"));
  it("bloqueia nome de famoso", () => expect(moderar(["Loja do Neymar"], marcas)).toBe("neymar"));
  it("permite tema comum", () => expect(moderar(["Casa Achados", "Casa", "folha, casinha"], marcas, ["painel"])).toBeNull());
  it("logo gera 2 opções e conta 1", async () => { const { r } = repo(["ok"], 20); const out = await gerarCore(r, input); expect(out.ok && out.opcoes.length).toBe(2); expect(out.usado).toBe(2); });
  it("banner gera 2 opções", async () => { const { r } = repo([], 20); const out = await gerarCore(r, { ...input, tipo: "banner" }); expect(out.ok && out.opcoes.length).toBe(2); });
  it("limite 2: a 3ª geração é bloqueada", async () => { const { r, reg } = repo(["ok", "ok"], 2); const out = await gerarCore(r, input); expect(out.ok).toBe(false); expect(!out.ok && out.code).toBe("limite"); expect(reg).toEqual([]); });
  it("erros e bloqueios não contam no limite", async () => { const { r } = repo(["ok", "erro", "bloqueado", "erro"], 2); expect((await gerarCore(r, input)).ok).toBe(true); });
  it("bloqueio não conta e não gera", async () => { const { r, reg } = repo([], 20); const out = await gerarCore(r, { ...input, descricao: "logo da nike" }); expect(!out.ok && out.code).toBe("bloqueado"); expect(out.usado).toBe(0); expect(reg).toEqual(["bloqueado"]); });
  it("falha do modelo grava erro e não muda contador", async () => { const { r, reg } = repo(["ok"], 20, true); const out = await gerarCore(r, input); expect(!out.ok && out.code).toBe("erro"); expect(out.usado).toBe(1); expect(reg).toEqual(["erro"]); });
  it("mensagem de limite traz data de renovação", () => expect(msgLimite(20, new Date(Date.UTC(2026, 9, 30)))).toBe("Você usou as 20 gerações de IA deste mês. Renova em 01/11/2026."));
});

import { filtrarConceitos, minAprovadas, somarUso, sugestoes, limparBriefing, promptDiretor } from "./store-ai-art";
describe("PATCH-012 diretor de arte", () => {
  it("refino conta meia geração", async () => { const { r } = repo([], 20); const out = await gerarCore(r, { ...input, peso: 0.5 }); expect(out.usado).toBe(0.5); });
  it("soma pesos só de gerações ok", () => expect(somarUso([{ status: "ok", peso: 1 }, { status: "ok", peso: 0.5 }, { status: "erro", peso: 1 }])).toBe(1.5));
  it("com 19,5 usados de 20, refino passa e geração completa é bloqueada", async () => {
    const rows = [...Array.from({ length: 19 }, () => ({ status: "ok", peso: 1 })), { status: "ok", peso: 0.5 }];
    const rf = repo([], 20); rf.r.statusDoMes = async () => rows;
    expect((await gerarCore(rf.r, { ...input, peso: 0.5 })).ok).toBe(true);
    expect((await gerarCore(rf.r, input)).ok).toBe(false);
  });
  it("descarta conceitos repetidos", () => {
    const c = (tipo: string, ideia: string) => ({ nome_curto: "x", tipo, ideia, prompt_imagem: "p" });
    expect(filtrarConceitos([c("mascote", "Gato feliz"), c("mascote", "Outro"), c("monograma", "Gato feliz"), c("geométrico", "Folha casa")], 4)).toHaveLength(2);
  });
  it("menos de 3 aprovadas exige nova tentativa", () => { expect(minAprovadas(4)).toBe(3); expect(minAprovadas(2)).toBe(2); });
  it("sugestões por nicho", () => expect(sugestoes("Pet Shop").simbolo).toContain("patinha"));
  it("briefing limita personalidade a 3", () => expect(limparBriefing({ personalidade: ["a", "b", "c", "d"] }).personalidade).toHaveLength(3));
  it("prompt proíbe clichês e pede 32px", () => { const p = promptDiretor({ tipo: "logo", n: 4, estilo: "Moderno", nome: "Casa", nicho: "Casa", tema: { cor_destaque: "#FFE600", cor_fundo: "#fff", fonte: "moderna" }, briefing: {}, produtos: [], descricao: null }); expect(p).toContain("shopping cart"); expect(p).toContain("32px"); });
});
