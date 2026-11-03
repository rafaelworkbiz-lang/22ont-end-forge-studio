import { createFileRoute } from "@tanstack/react-router";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (msg: string, status = 404) => new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Link indisponível</title><body style="font-family:sans-serif;padding:40px;text-align:center"><h1>Link indisponível</h1><p>${msg}</p></body>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

/** Clique da loja: valida vínculo loja↔produto, registra o clique e redireciona (302) ao link de afiliado do dono. */
export const Route = createFileRoute("/r/$lojaId/$produtoId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!UUID.test(params.lojaId) || !UUID.test(params.produtoId)) return fail("Endereço inválido.");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: link } = await supabaseAdmin.from("loja_produtos").select("loja_id, lojas!inner(user_id, status), meus_produtos!inner(id, user_id, fornecedor, item_id, link_afiliado)")
          .eq("loja_id", params.lojaId).eq("meu_produto_id", params.produtoId).maybeSingle();
        const loja = link?.lojas, mp = link?.meus_produtos;
        if (!link || !loja || !mp || mp.user_id !== loja.user_id || loja.status === "pausada") return fail("Este produto não está mais nesta loja.");
        const { data: c } = await supabaseAdmin.from("produtos_cache").select("link_origem, status").eq("fornecedor", mp.fornecedor).eq("item_id", mp.item_id).maybeSingle();
        if (!c || c.status !== "ativo") return fail("Este produto saiu do ar no fornecedor.");
        let url = mp.link_afiliado;
        if (!url) {
          let made: string | null = null;
          if (mp.fornecedor === "ml") {
            const [{ data: conn }, { data: prof }] = await Promise.all([
              supabaseAdmin.from("meli_connections").select("affiliate_tag").eq("user_id", loja.user_id).maybeSingle(),
              supabaseAdmin.from("meli_affiliate_profile").select("tag_confirmed_at").eq("user_id", loja.user_id).maybeSingle(),
            ]);
            const { isValidTag, safeAffiliateLink } = await import("@/lib/product-share");
            if (conn && isValidTag(conn.affiliate_tag) && prof?.tag_confirmed_at) made = safeAffiliateLink(c.link_origem, conn.affiliate_tag, true);
          } else {
            const { buildAffiliateLink } = await import("@/lib/affiliate-links.server");
            made = (await buildAffiliateLink(supabaseAdmin, loja.user_id, "shopee", c.link_origem).catch(() => ({ url: null }))).url;
          }
          if (!made) return fail("O link deste produto ainda não está pronto.", 409);
          url = made;
          await supabaseAdmin.from("meus_produtos").update({ link_afiliado: url, link_gerado_em: new Date().toISOString() }).eq("id", mp.id);
        }
        const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
        if (!/(^|\.)(mercadolivre\.com\.br|mercadolibre\.com|shopee\.com\.br|shp\.ee|s\.shopee\.com\.br)$/.test(host)) return fail("Destino inválido.", 409);
        const canal = new URL(request.url).searchParams.get("c")?.replace(/[^\w-]/g, "").slice(0, 40) || null;
        await supabaseAdmin.from("cliques").insert({ loja_id: params.lojaId, meu_produto_id: params.produtoId, canal });
        return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer-when-downgrade" } });
      },
    },
  },
});
