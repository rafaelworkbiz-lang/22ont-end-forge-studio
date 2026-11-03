import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export type PaletteItem = { to: string; label: string };

/** Busca rápida (Ctrl+K / ⌘K) para ir direto a abas e ações do painel. */
export function CommandPalette({ items, open, onOpenChange }: { items: PaletteItem[]; open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); onOpenChange(!open); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, onOpenChange]);
  const go = (to: string) => { onOpenChange(false); void navigate({ to: to as "/painel" }); };
  const actions: PaletteItem[] = [
    { to: "/painel/lojas", label: "Nova loja" },
    { to: "/painel/perfil", label: "Meu Perfil e senha" },
  ];
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Ir para… (abas, ações)" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Abas">{items.map(i => <CommandItem key={i.to} value={i.label} onSelect={() => go(i.to)}>{i.label}</CommandItem>)}</CommandGroup>
        <CommandGroup heading="Ações">{actions.map(i => <CommandItem key={i.label} value={i.label} onSelect={() => go(i.to)}>{i.label}</CommandItem>)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useOpenState() { return useState(false); }
