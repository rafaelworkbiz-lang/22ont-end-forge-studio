<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Frontend architecture
- Subdirectories may have their own AGENTS.md (see src/components/AGENTS.md); read it before changing files there.
- Keep financial overview separate from navigation; missing real affiliate reports are unavailable. Influencer simulations are explicitly labeled and persisted separately, never used for attributed sales or payouts.
- Generate deterministic demo batches server-side after verifying influencer membership, without requiring personal Mercado Livre OAuth; immutable batch keys prevent duplicate events across tabs and refreshes.
- Admin member summaries reuse the protected member-management data source; no parallel demo member store.
- Keep the affiliate dashboard in a focused browser-safe component rendered by the session-gated /painel route; authentication does not imply subscription or administrative authorization.
- Account access uses public /auth and /reset-password routes and a shared AuthProvider; one root-owned session listener keeps account UI consistent without introducing profile storage or granting administrative roles.
- Define dashboard colors and layout styling in the global stylesheet and use the shared Button for controls; this keeps visual changes consistent with the reference.
- Mercado Livre API calls run only inside server functions (src/lib/meli.functions.ts); credentials are server secrets and must never reach the browser.
- Hot catalog products must come from official category highlights with preserved category rank; separate query caches and bounded enrichment prevent ordinary results masquerading as best sellers and uncontrolled API fan-out.
- Member management functions use requireAdmin before loading the admin client; influencer flags remain in member_roles, while auth administrator privileges are stored in user_roles with a database unique index allowing only one administrator.
- Resolve catalog access and account mode through one server-only helper using authenticated role reads: administrators and influencers may browse without personal OAuth, clients require a real connection, and affiliate links for anyone come only from their own real connection plus confirmed tag; this keeps UI and search authorization consistent without fake credentials or affiliate tags.
- Always render the public presentation at / and the session-gated dashboard at /painel; separate addresses let signed-in visitors view the public site without changing account permissions.

- Lazy-load dashboard management and catalog views; opening the public presentation must not eagerly load every account tool.
- Applyfy receipts are service-only and processed through atomic claim/finish operations; administrative reads require server-verified admin access and failures remain retryable.
- Admin role rows in user_roles are locked by a DB trigger and revoked client writes; the single admin cannot be granted or removed from the app, preventing privilege escalation.
- Product profile publishing uses locally built affiliate links (no official link API), so 'published' is only recorded on explicit user confirmation in perfil_publicacoes; eligibility is computed server-side in getProductDetail.
- The signed-in panel is a /painel layout route (gate + PanelShell + Outlet) with one child route per tab; tab state lives in the URL so back/refresh keep context. /painel/integracoes redirects to /painel/fornecedores.
- Panel design v2 is light-only: tokens are overridden via `:root:has(.v2-app)` in styles.css so portals inherit them; never reintroduce dark blocks inside the panel.
- Influencer coupons are read through RLS using the security-definer `is_influencer()` (member_roles), and written only by requireAdmin server functions.
- Supplier credentials (fornecedor_conexoes) have no browser grants: reads go through security-definer minhas_conexoes_fornecedor() with a masked app id, writes only via server functions; secrets are AES-GCM encrypted with FORNECEDOR_CRYPTO_KEY so plaintext never reaches the client.
- Product library is a shared server-filled cache (produtos_cache) refreshed one category per call by /api/public/jobs/refresh-library (managed cron, 06:00 BRT window) or the admin button; reads require tem_acesso_ativo(), so the catalog never calls supplier APIs per visitor.
- Personal affiliate links are built server-side (affiliate-links.server.ts) from the user's own connection: ML confirmed tag, Shopee generateShortLink.
- Stores: limits via trigger limite_lojas; publish fields set only by admin-client server fns after checklist; public reads via loja_publica(slug); clicks only via /r/$lojaId/$produtoId. Prevents self-publish and draft leaks.
- Store AI logo/banner: server-only generation; pure store-ai-core.ts orchestrates limit→moderation→generation (only 'ok' rows count, weighted by peso); temp options purged after 24h by cron.
- Divulgação groups and message templates are admin-curated DB rows (grupos, modelos_mensagem) readable only with active access and written only via requireAdmin functions; posting is always manual and logged in divulgacoes, so no bot ever posts and every share channel stays traceable.
- Store editor saves through saveStore with optimistic versioning (lojas.versao) and persists the current step (passo_atual + ?passo); theme/layout/banner options live in pure store-theme.ts shared by preview, public store and art, so one source drives every surface.
- Store AI uses the Lovable AI Gateway server-side: a text art director (store-ai-gen.server.ts) writes distinct concepts from lojas.briefing + store context and reviews images; usage sums ia_geracoes.peso (refine = 0.5) so limits stay comparable; style rules live in pure store-ai-art.ts.
- In-panel actions/details open as URL-addressed windows (?janela=name&params) rendered by one JanelaHost in PanelShell with a registry in janela.tsx; old deep routes redirect to the tab plus ?janela so back/reload/links keep working. Shared Dialog/AlertDialog use the same window styling.
- Panel density: PanelShell adds .v2-compact below 1600px width or 800px height; compact rules live only in styles.css so wide layouts stay untouched.
- Influencer data lives in `influenciadores` (one row per member with the influencer tag, with a reference-only negotiated commission %); the app never counts influencer sales because Applyfy tracks and pays them, and `vendas_influenciador` is deprecated.
- Public influencer pages are the `/$codigo` route reading `influenciador_publico()` (only active code + checkout links); reserved codes live in `influencer-rules.ts`, old codes redirect for 90 days via `codigos_redirect`.
- Admin area is one hub at /painel/usuarios with tabs in `?aba=`; all admin writes go through requireAdmin functions and admin_audit_log.
- Influencer onboarding/teams/invites run only through server functions (influencer-onboarding, teams, invite .functions.ts) using the admin client after resolving the caller's own row from the session email; times/convites/convite_usos/cadastro_rate have no browser grants. /convite/$codigo is the only signup path outside purchase (IP rate-limited; account is created with the user-chosen password and profile photo, so the email is not verified). Non-admin influencers whose status isn't 'ativo' see the full-screen onboarding instead of PanelShell.
- Subscription expiry and recovery run in SQL (rotina_vencimentos, registrar_recuperacao, pagamento_aprovado; service-role only) called by the Applyfy webhook and the daily /api/public/jobs/subscriptions-daily cron; pure rules live in subscription-rules.ts so UI and tests share one source. WhatsApp contact is always manual.
