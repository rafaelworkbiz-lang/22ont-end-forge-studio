import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { panelHead } from "@/lib/panel-head";
import { useCreateStore } from "@/components/stores-list";

export const Route = createFileRoute("/painel/lojas/nova")({
  head: panelHead("Nova loja", "Crie uma nova loja com seus produtos."),
  component: NewStore,
});
function NewStore() {
  const create = useCreateStore(); const started = useRef(false); const [failed, setFailed] = useState(false);
  useEffect(() => { if (started.current) return; started.current = true; void create().then(id => { if (!id) setFailed(true); }); }, [create]);
  return <div className="v2-page"><div className="v2-card v2-empty">{failed ? <><p>Não foi possível criar a loja.</p><Button asChild><Link to="/painel/lojas">Minhas lojas</Link></Button></> : <p role="status">Criando sua loja…</p>}</div></div>;
}
