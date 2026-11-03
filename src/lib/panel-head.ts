export const panelHead = (tab: string, description: string) => () => ({
  meta: [
    { title: `${tab} · AfiliaPlace` },
    { name: "description", content: description },
    { name: "robots", content: "noindex" },
    { property: "og:title", content: `${tab} · AfiliaPlace` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
