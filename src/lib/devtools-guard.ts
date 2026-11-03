// Browser-only deterrent: blocks common inspect shortcuts. Not a security boundary.
export function installDevtoolsGuard() {
  const editable = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
  const onKey = (e: KeyboardEvent) => {
    if (!location.pathname.startsWith("/painel")) return;
    const k = e.key.toUpperCase();
    const mod = e.ctrlKey || e.metaKey;
    if (k === "F12" || (mod && e.shiftKey && ["I", "J", "C"].includes(k)) || (mod && e.altKey && ["I", "J", "C"].includes(k)) || (mod && k === "U")) {
      e.preventDefault(); e.stopPropagation();
    }
  };
  void editable;
  window.addEventListener("keydown", onKey, true);
  return () => window.removeEventListener("keydown", onKey, true);
}
