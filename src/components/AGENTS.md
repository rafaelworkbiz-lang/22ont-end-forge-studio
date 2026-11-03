# Components rules
- Share the daily sales summary presentation across account modes and size analysis columns by available content width; this preserves a centered today-only total when navigation collapses or analysis periods change.
- Share browser-safe sales-period controls and pure São Paulo date/month aggregation helpers across account presentations; inclusive bounds and distinct revenue/commission totals prevent period inconsistencies.
- Store dashboard theme preferences under account-scoped browser keys and restore before writing; this prevents hydration mismatches and one account overwriting another's choice.
- Keep researched WhatsApp invitations and provenance in a browser-safe data module separate from its catalog component; this separates public-source data from presentation and requires no account or messaging integration.
- Keep publicly sourced Facebook groups and URL normalization in a browser-safe data module separate from their catalog; provenance and canonical URLs prevent fabricated records and duplicates.
- Keep illustrative presentation products and reconciled preview totals in a browser-safe module separate from real sales; visibility-triggered counters never mutate account data.
- Render animation only while visible and active, respecting reduced motion; decorative rendering must not consume background frame time.
