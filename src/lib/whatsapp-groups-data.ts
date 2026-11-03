export type WhatsAppGroup = {
  id: string;
  name: string;
  niche: string;
  members: number | null;
  url: string;
  source?: string;
  permission: "allowed" | "unknown";
  custom?: boolean;
};

export const whatsappNiches = ["Achadinhos", "Compras e Vendas", "Promoções e Cupons", "Vendas", "Outros"];

export function normalizeInvite(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname !== "chat.whatsapp.com") return null;
    const match = /^\/([A-Za-z0-9]{22})\/?$/.exec(url.pathname);
    return match ? `https://chat.whatsapp.com/${match[1]}` : null;
  } catch {
    return null;
  }
}

// Public directory snapshots researched on 2026-10-12; counts are source-reported, not live.
export const whatsappGroups: WhatsAppGroup[] = [
  {
    "id": "IlDbAdF6s9XDUxl11kKRl8",
    "name": "🛍️OFERTAS RELÂMPAGO🛍/AMAZON/ML/SHOPPE 🛍️",
    "niche": "Achadinhos",
    "members": 688,
    "url": "https://chat.whatsapp.com/IlDbAdF6s9XDUxl11kKRl8",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-relampago-amazon-ml-shoppe-mp1bjyle",
    "permission": "unknown"
  },
  {
    "id": "KCPQ6tRh4AZ9N7upUeU76x",
    "name": "Achadinhos da Mih 💥💗",
    "niche": "Compras e Vendas",
    "members": 47,
    "url": "https://chat.whatsapp.com/KCPQ6tRh4AZ9N7upUeU76x",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-mih-mp21a7xp",
    "permission": "unknown"
  },
  {
    "id": "Bx8BALv5nmp6Yx6KFEP2EF",
    "name": "DS oferta. Links, mercado livre, Shoppe, Amazon, magalu",
    "niche": "Vendas",
    "members": 41,
    "url": "https://chat.whatsapp.com/Bx8BALv5nmp6Yx6KFEP2EF",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ds-ofertas-mp2j0jvu",
    "permission": "unknown"
  },
  {
    "id": "Lsc3RfWTnME7aLJDRpLZro",
    "name": "Grupo VIP Mercado Livre e Shopee",
    "niche": "Achadinhos",
    "members": 289,
    "url": "https://chat.whatsapp.com/Lsc3RfWTnME7aLJDRpLZro",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-vip-mercado-livre-e-shopee-mp2lep2f",
    "permission": "allowed"
  },
  {
    "id": "CBCGAwpA0CPE5XEJw7W6Jg",
    "name": "Bode das Ofertas 🐐",
    "niche": "Compras e Vendas",
    "members": 9,
    "url": "https://chat.whatsapp.com/CBCGAwpA0CPE5XEJw7W6Jg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/bode-das-ofertas-mp4c3gps",
    "permission": "unknown"
  },
  {
    "id": "GvUOb3u6nIr8sSWNcSJ7YL",
    "name": "ACHADINHOS DA SHOPEE⭐️🛒",
    "niche": "Compras e Vendas",
    "members": 6,
    "url": "https://chat.whatsapp.com/GvUOb3u6nIr8sSWNcSJ7YL",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-mp4o2qkf",
    "permission": "unknown"
  },
  {
    "id": "FOfD4w0bhPv0OBWaHHY3yr",
    "name": "Achadinhos da Shopee ✨",
    "niche": "Compras e Vendas",
    "members": 25,
    "url": "https://chat.whatsapp.com/FOfD4w0bhPv0OBWaHHY3yr",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-mp4vnvz2",
    "permission": "unknown"
  },
  {
    "id": "FHz497U4jUy7TgFjFnDwGl",
    "name": "HOME DE OFERTAS✨💼 #01",
    "niche": "Compras e Vendas",
    "members": 3,
    "url": "https://chat.whatsapp.com/FHz497U4jUy7TgFjFnDwGl",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-mp5rg1e5",
    "permission": "unknown"
  },
  {
    "id": "HzJCdPEJttiB1drO0zK7OH",
    "name": "Ofertas Do Dia  🔥🔥🔥🔥🔥",
    "niche": "Compras e Vendas",
    "members": 6,
    "url": "https://chat.whatsapp.com/HzJCdPEJttiB1drO0zK7OH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-do-dia-mp61xsw2",
    "permission": "unknown"
  },
  {
    "id": "JSYSKW5WVoxCR1sXBDNZ5j",
    "name": "Achadinhos da Net  🛍️ 🎁",
    "niche": "Compras e Vendas",
    "members": 176,
    "url": "https://chat.whatsapp.com/JSYSKW5WVoxCR1sXBDNZ5j",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-net-mp8h4fgo",
    "permission": "unknown"
  },
  {
    "id": "DDOfHQyh93P5Az9dMAPoLo",
    "name": "🛍 Achadinhos imperdíveis",
    "niche": "Compras e Vendas",
    "members": 7,
    "url": "https://chat.whatsapp.com/DDOfHQyh93P5Az9dMAPoLo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/universo-shopee-mp8wir3l",
    "permission": "unknown"
  },
  {
    "id": "HkJaXVDQ4gl4kcJgZvOXPo",
    "name": "ACHADINHOS 🤩🛍️  @MadameDasPromoss ✨",
    "niche": "Achadinhos",
    "members": 130,
    "url": "https://chat.whatsapp.com/HkJaXVDQ4gl4kcJgZvOXPo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-02-madamedaspromoss-mpa7nun0",
    "permission": "unknown"
  },
  {
    "id": "Ft1oR3QI4nV6Rbo6B9KAjp",
    "name": "#1 🔥 Compra Pra Mim? - Promoções",
    "niche": "Achadinhos",
    "members": 8,
    "url": "https://chat.whatsapp.com/Ft1oR3QI4nV6Rbo6B9KAjp",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/1-compra-pra-mim-promocoes-mpacc1oh",
    "permission": "unknown"
  },
  {
    "id": "IqPe4Lq1c9dGj60juss8EE",
    "name": "🛍️Achadinhos Shopee by Helem",
    "niche": "Compras e Vendas",
    "members": 22,
    "url": "https://chat.whatsapp.com/IqPe4Lq1c9dGj60juss8EE",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-shopee-by-helem-mpbbwhrw",
    "permission": "unknown"
  },
  {
    "id": "HZo02cxenCr54rvWEA99Sf",
    "name": "Achadinhos ( lojas online) ✨💓💥",
    "niche": "Compras e Vendas",
    "members": 10,
    "url": "https://chat.whatsapp.com/HZo02cxenCr54rvWEA99Sf",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-lojas-online-mpbc7yx8",
    "permission": "unknown"
  },
  {
    "id": "IDAD0nefofX1EkM5xv0bKo",
    "name": "achadinhos",
    "niche": "Compras e Vendas",
    "members": 5,
    "url": "https://chat.whatsapp.com/IDAD0nefofX1EkM5xv0bKo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-mpbglbtt",
    "permission": "unknown"
  },
  {
    "id": "H2V49VLDpSkFDAJL4lz6E9",
    "name": "GRUPO VIP 🫶Os Melhores achadinhos online 🤎",
    "niche": "Compras e Vendas",
    "members": 11,
    "url": "https://chat.whatsapp.com/H2V49VLDpSkFDAJL4lz6E9",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-vip-os-melhores-achadinhos-online-mpbqnobu",
    "permission": "unknown"
  },
  {
    "id": "KPlwxNZs5veL2u8DbxENwv",
    "name": "Achadinhos da Lu🤩",
    "niche": "Compras e Vendas",
    "members": 13,
    "url": "https://chat.whatsapp.com/KPlwxNZs5veL2u8DbxENwv",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-lu-mpcj4j9a",
    "permission": "unknown"
  },
  {
    "id": "EQjZtd26dmE7q0kZ8MWuL4",
    "name": "Achadinhos da Jessica",
    "niche": "Compras e Vendas",
    "members": 54,
    "url": "https://chat.whatsapp.com/EQjZtd26dmE7q0kZ8MWuL4",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-jessica-mpckpn46",
    "permission": "unknown"
  },
  {
    "id": "LErusTPj1qxGfshbrWmfRI",
    "name": "✨️ Achadinhos da Lu | Clube VIP",
    "niche": "Achadinhos",
    "members": 89,
    "url": "https://chat.whatsapp.com/LErusTPj1qxGfshbrWmfRI",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-secretas-da-lu-mpcqlz7k",
    "permission": "unknown"
  },
  {
    "id": "KdI2YMY53Wf0CR3l1MSPaM",
    "name": "Achados Meli & Shopee",
    "niche": "Compras e Vendas",
    "members": 8,
    "url": "https://chat.whatsapp.com/KdI2YMY53Wf0CR3l1MSPaM",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-ml-shopee-mpdghrcc",
    "permission": "unknown"
  },
  {
    "id": "ImFiPWX6aYJAJ1Kh9U8uGu",
    "name": "🔥 OFERTAS SECRETAS (DESCONTOS REAIS) 01",
    "niche": "Achadinhos",
    "members": 192,
    "url": "https://chat.whatsapp.com/ImFiPWX6aYJAJ1Kh9U8uGu",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-secretas-descontos-reais-01-mpe4onh6",
    "permission": "unknown"
  },
  {
    "id": "BEoXT6M2qPEEGRLzIG6UsH",
    "name": "Shopee compras 🛍",
    "niche": "Compras e Vendas",
    "members": 62,
    "url": "https://chat.whatsapp.com/BEoXT6M2qPEEGRLzIG6UsH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-insanos-shopee-mpe69r5n",
    "permission": "unknown"
  },
  {
    "id": "GsUkqDx5OKZFhhS2YMOIb0",
    "name": "🛒😍 Ofertas & Achados 😉",
    "niche": "Compras e Vendas",
    "members": 26,
    "url": "https://chat.whatsapp.com/GsUkqDx5OKZFhhS2YMOIb0",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-achados-mpfxj322",
    "permission": "unknown"
  },
  {
    "id": "J5LgTzbCJ2SHDKYa0Dw2GT",
    "name": "GS Ofertas - Links de promoções! 🤑",
    "niche": "Achadinhos",
    "members": 71,
    "url": "https://chat.whatsapp.com/J5LgTzbCJ2SHDKYa0Dw2GT",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/gs-ofertas-links-de-promocoes-mphe7q8k",
    "permission": "unknown"
  },
  {
    "id": "DhGC7JpoUsr9JRv2b2F5UM",
    "name": "MEGA OFERTAS OFICIAIS #2 🛍️🔥",
    "niche": "Achadinhos",
    "members": 106,
    "url": "https://chat.whatsapp.com/DhGC7JpoUsr9JRv2b2F5UM",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mega-ofertas-oficiais-2-mphr5k09",
    "permission": "unknown"
  },
  {
    "id": "FumzwsM2aMZHqJnkm60Zqs",
    "name": "⚡ Achadinhos Vip Shopee e Mercado Livre",
    "niche": "Vendas",
    "members": 32,
    "url": "https://chat.whatsapp.com/FumzwsM2aMZHqJnkm60Zqs",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-vip-shopee-e-mercado-livre-mpixz1bx",
    "permission": "unknown"
  },
  {
    "id": "Jxer0qqHavbACjl3bMeQ65",
    "name": "Ofertas Shopee",
    "niche": "Compras e Vendas",
    "members": 5,
    "url": "https://chat.whatsapp.com/Jxer0qqHavbACjl3bMeQ65",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-shopee-mpkegghj",
    "permission": "unknown"
  },
  {
    "id": "E2Rf2nG7nRn22Dr7Yb8gG2",
    "name": "Pescando Achadinhos - 🔥Ofertas",
    "niche": "Compras e Vendas",
    "members": 6,
    "url": "https://chat.whatsapp.com/E2Rf2nG7nRn22Dr7Yb8gG2",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/pescando-achadinhos-ofertas-mplvoeim",
    "permission": "unknown"
  },
  {
    "id": "JkRSbRAOuXl7AUO0iVyRs3",
    "name": "🔥 ESQUENTA PROMOÇÕES SHOPEE 🔥",
    "niche": "Compras e Vendas",
    "members": 17,
    "url": "https://chat.whatsapp.com/JkRSbRAOuXl7AUO0iVyRs3",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/esquenta-promocoes-shopee-mpmp5uhi",
    "permission": "unknown"
  },
  {
    "id": "DoYBGfvByV1HCV1chfvVVw",
    "name": "🛒PROMOHDS🛍️ Ofertas & Cupons - 002",
    "niche": "Compras e Vendas",
    "members": 21,
    "url": "https://chat.whatsapp.com/DoYBGfvByV1HCV1chfvVVw",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promohds-ofertas-cupons-002-mpq7cf18",
    "permission": "unknown"
  },
  {
    "id": "L1rKd4Gc0aM4feiNS6rNpx",
    "name": "💲Ofertas Relâmpago Tech 💲Shopee - Mercado Livre",
    "niche": "Compras e Vendas",
    "members": 66,
    "url": "https://chat.whatsapp.com/L1rKd4Gc0aM4feiNS6rNpx",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-relampago-shopee-mercado-livre-amazon-mpr10hsc",
    "permission": "unknown"
  },
  {
    "id": "HPVX3s5ssMd1OS6hk5vPCa",
    "name": "Clube das Melhores Ofertas:  Mercado Livre,  Amazon e Shopee -  Links VIP #1",
    "niche": "Compras e Vendas",
    "members": 86,
    "url": "https://chat.whatsapp.com/HPVX3s5ssMd1OS6hk5vPCa",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-das-melhores-ofertas-mercado-livre-amazon-e-shopee-links-vip-1-mpug5uxj",
    "permission": "unknown"
  },
  {
    "id": "Kldgjbb28rI3YaDfJuvLF1",
    "name": "Caçadores de promoções 🔥💥",
    "niche": "Vendas",
    "members": 32,
    "url": "https://chat.whatsapp.com/Kldgjbb28rI3YaDfJuvLF1",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/cacadores-de-promocoes-mpvxb43f",
    "permission": "unknown"
  },
  {
    "id": "FH0kDKolPYR6tInTVrDyxL",
    "name": "#4 🔥Ofertas Da Casa Da Ninha",
    "niche": "Achadinhos",
    "members": 192,
    "url": "https://chat.whatsapp.com/FH0kDKolPYR6tInTVrDyxL",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/4-ofertas-da-casa-da-ninha-mpy49gxd",
    "permission": "unknown"
  },
  {
    "id": "Ihb27fxg2lFF8K3bjVPZzd",
    "name": "Achadinhos",
    "niche": "Achadinhos",
    "members": 25,
    "url": "https://chat.whatsapp.com/Ihb27fxg2lFF8K3bjVPZzd",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-mpyki2ne",
    "permission": "unknown"
  },
  {
    "id": "J0XRH3bSisaGV1EhjwqbLv",
    "name": "Achadinhos Sol☀️",
    "niche": "Compras e Vendas",
    "members": 72,
    "url": "https://chat.whatsapp.com/J0XRH3bSisaGV1EhjwqbLv",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-sol-mpz0xpkg",
    "permission": "unknown"
  },
  {
    "id": "FkAS2IlFVljJgA6432vUnT",
    "name": "🇧🇷Achadinhos LagroShoP🇧🇷",
    "niche": "Compras e Vendas",
    "members": 94,
    "url": "https://chat.whatsapp.com/FkAS2IlFVljJgA6432vUnT",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-lagroshop-mq0r71nt",
    "permission": "unknown"
  },
  {
    "id": "Da8GICXT45T459xXvDXXWg",
    "name": "Achadinhos da Shopee e TikTok Shop 🛍️",
    "niche": "Vendas",
    "members": 4,
    "url": "https://chat.whatsapp.com/Da8GICXT45T459xXvDXXWg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-e-tiktok-shop-mq0zkmol",
    "permission": "unknown"
  },
  {
    "id": "HJ6mawrC7KgEQvGeE0qcCj",
    "name": "Achadinhos 🛍️🛍️",
    "niche": "Compras e Vendas",
    "members": 32,
    "url": "https://chat.whatsapp.com/HJ6mawrC7KgEQvGeE0qcCj",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-mq1bvkjb",
    "permission": "unknown"
  },
  {
    "id": "G3tvYovTSKxBrwrGC70T30",
    "name": "GRUPO VIP #8 Achei Postei Ofertas",
    "niche": "Vendas",
    "members": 23,
    "url": "https://chat.whatsapp.com/G3tvYovTSKxBrwrGC70T30",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-vip-8-achei-postei-ofertas-mq1eak6d",
    "permission": "unknown"
  },
  {
    "id": "D6eaDHV1McLK00afN8MSCP",
    "name": "Focadas em promoções",
    "niche": "Compras e Vendas",
    "members": 9,
    "url": "https://chat.whatsapp.com/D6eaDHV1McLK00afN8MSCP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/focadas-em-promocoes-mq2e423c",
    "permission": "unknown"
  },
  {
    "id": "H68J9rBMSVzLoWejzadHQ5",
    "name": "💎 VITRINE MULTIOFERTAS ✨️🛍",
    "niche": "Vendas",
    "members": 68,
    "url": "https://chat.whatsapp.com/H68J9rBMSVzLoWejzadHQ5",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-multiofertas-mq5nnlhc",
    "permission": "unknown"
  },
  {
    "id": "Lltw7rtwM1S2jNFubeJN0i",
    "name": "VENDAS E RIFAS BARATEX TUPPERWARE DA RAY ARAÇATUBA/SP",
    "niche": "Vendas",
    "members": 7,
    "url": "https://chat.whatsapp.com/Lltw7rtwM1S2jNFubeJN0i",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendas-e-rifas-baratex-tupperware-da-ray-aracatuba-sp-mq7720ty",
    "permission": "unknown"
  },
  {
    "id": "J8SKgrfvZHPLltyhZ0Xko2",
    "name": "Achadinhos Necessários Top 🔥🤌",
    "niche": "Achadinhos",
    "members": 45,
    "url": "https://chat.whatsapp.com/J8SKgrfvZHPLltyhZ0Xko2",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-necessarios-top-mq9vlofm",
    "permission": "unknown"
  },
  {
    "id": "BUTHG4V4uF9IFZglp8jY9i",
    "name": "#12 Ofertas da Thaa 💜",
    "niche": "Achadinhos",
    "members": 125,
    "url": "https://chat.whatsapp.com/BUTHG4V4uF9IFZglp8jY9i",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/12-ofertas-da-thaa-mqa53r8r",
    "permission": "unknown"
  },
  {
    "id": "G9zjUa8BqOn2ISMGYacT4J",
    "name": "#37 🔥VIP ACHADINHOS DA LALA",
    "niche": "Achadinhos",
    "members": 95,
    "url": "https://chat.whatsapp.com/G9zjUa8BqOn2ISMGYacT4J",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/37-vip-achadinhos-da-lala-mqawil0q",
    "permission": "unknown"
  },
  {
    "id": "LJRZSw0FEgPIjllVbtAzdp",
    "name": "Clube dos achados | Cupons e Ofertas",
    "niche": "Achadinhos",
    "members": 31,
    "url": "https://chat.whatsapp.com/LJRZSw0FEgPIjllVbtAzdp",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-dos-achados-cupons-e-ofertas-mqbn7tow",
    "permission": "unknown"
  },
  {
    "id": "Ef5ODvIbL5tKmITnDBcXmk",
    "name": "🤑✅️ Ton do Brasil — Vendas de Maquininhas 💚",
    "niche": "Achadinhos",
    "members": 150,
    "url": "https://chat.whatsapp.com/Ef5ODvIbL5tKmITnDBcXmk",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-secreto-mqbpaki7",
    "permission": "unknown"
  },
  {
    "id": "HjzfjivAhx1Kq66oaVAqkR",
    "name": "#01 OFERTAS DA QUEILA 💰🤌🏻✨",
    "niche": "Achadinhos",
    "members": 130,
    "url": "https://chat.whatsapp.com/HjzfjivAhx1Kq66oaVAqkR",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/01-ofertas-da-queila-mqbt66dn",
    "permission": "unknown"
  },
  {
    "id": "FQGVVSkwE41Ek4ZXwiUYUa",
    "name": "Peck freestyle 🇧🇷🥷",
    "niche": "Vendas",
    "members": 4,
    "url": "https://chat.whatsapp.com/FQGVVSkwE41Ek4ZXwiUYUa",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendas-de-contas-free-fire-br-mqcqueny",
    "permission": "unknown"
  },
  {
    "id": "IzmseRZvMmVKJXpgL8Rs7N",
    "name": "Achadinhos da Mu #2",
    "niche": "Achadinhos",
    "members": 91,
    "url": "https://chat.whatsapp.com/IzmseRZvMmVKJXpgL8Rs7N",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-mu-2-mqd6md8j",
    "permission": "allowed"
  },
  {
    "id": "KgbrzzcAjhz4Bau1DjePIk",
    "name": "Achadinhos by Emi",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/KgbrzzcAjhz4Bau1DjePIk",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-by-emi-mqdw5efk",
    "permission": "unknown"
  },
  {
    "id": "Kw7tmSmF4YOLIMlWj5FQzC",
    "name": "Outlet de achadinhos 🛍️✨",
    "niche": "Achadinhos",
    "members": 10,
    "url": "https://chat.whatsapp.com/Kw7tmSmF4YOLIMlWj5FQzC",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-baratos-tendencias-mqek7zyu",
    "permission": "unknown"
  },
  {
    "id": "BRvGESh3l7OBQSz0haAsGH",
    "name": "Achadinhos da Tereza 🎆",
    "niche": "Achadinhos",
    "members": 47,
    "url": "https://chat.whatsapp.com/BRvGESh3l7OBQSz0haAsGH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-tereza-mqgi1wtb",
    "permission": "unknown"
  },
  {
    "id": "GMrDIR4afi7KQTduIKriaG",
    "name": "Achadinhos da Madu #101",
    "niche": "Achadinhos",
    "members": 26,
    "url": "https://chat.whatsapp.com/GMrDIR4afi7KQTduIKriaG",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-madu-101-mqhg293r",
    "permission": "unknown"
  },
  {
    "id": "D41WEkTuRer9HFZAEuXXEg",
    "name": "#02 GABI INDICA 💕✨",
    "niche": "Achadinhos",
    "members": 10,
    "url": "https://chat.whatsapp.com/D41WEkTuRer9HFZAEuXXEg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-achadinhos-da-gabi-01-mqhvrtf7",
    "permission": "unknown"
  },
  {
    "id": "D7FxYDgKPMLKX23BvVfq0L",
    "name": "Achados Mercado Livre 🏷️",
    "niche": "Achadinhos",
    "members": 1,
    "url": "https://chat.whatsapp.com/D7FxYDgKPMLKX23BvVfq0L",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/melhores-promo-mercado-livre-mqlbbho5",
    "permission": "unknown"
  },
  {
    "id": "I7GbEOkJKrvI6yQJOca12i",
    "name": "Achadinhos da Nati",
    "niche": "Achadinhos",
    "members": 47,
    "url": "https://chat.whatsapp.com/I7GbEOkJKrvI6yQJOca12i",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-nati-mqp19fb6",
    "permission": "unknown"
  },
  {
    "id": "EUu9izho2n1DK9uUdSv4KA",
    "name": "✨Garimpo de Ofertas✨",
    "niche": "Achadinhos",
    "members": 8,
    "url": "https://chat.whatsapp.com/EUu9izho2n1DK9uUdSv4KA",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-em-promocao-da-shoope-mqp8h35w",
    "permission": "unknown"
  },
  {
    "id": "EO2gNzV0akOC60uh46BIvz",
    "name": "CAÇADORES DE OFERTAS 💰 19",
    "niche": "Achadinhos",
    "members": 174,
    "url": "https://chat.whatsapp.com/EO2gNzV0akOC60uh46BIvz",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/cacadores-de-ofertas-19-mqpgwg5w",
    "permission": "unknown"
  },
  {
    "id": "Kn8C44SKyc16MWCye4snKU",
    "name": "Sua loja de calçados",
    "niche": "Achadinhos",
    "members": 47,
    "url": "https://chat.whatsapp.com/Kn8C44SKyc16MWCye4snKU",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-online-mqpx3xp5",
    "permission": "unknown"
  },
  {
    "id": "FvJaZemaDv2860hfVUf0e3",
    "name": "OFERTAS DO DIA #99 @carimbohub",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/FvJaZemaDv2860hfVUf0e3",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-do-dia-99-carimbohub-mqq1je99",
    "permission": "unknown"
  },
  {
    "id": "BZ2eVC9cpYOGav1DVu36Hu",
    "name": "Achados e Ofertas da Rose",
    "niche": "Achadinhos",
    "members": 28,
    "url": "https://chat.whatsapp.com/BZ2eVC9cpYOGav1DVu36Hu",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-e-ofertas-da-rose-mqr3xqu4",
    "permission": "unknown"
  },
  {
    "id": "LcPAkWyXsr8HoAC3ydkEfo",
    "name": "Achou, Economizou - Achadinhos",
    "niche": "Compras e Vendas",
    "members": 99,
    "url": "https://chat.whatsapp.com/LcPAkWyXsr8HoAC3ydkEfo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achou-economizou-achadinhos-mqsatz4t",
    "permission": "unknown"
  },
  {
    "id": "IL19elpCWFsFPVGn54vt6N",
    "name": "# 🛍️ Achadinhos da Carol 🧡",
    "niche": "Achadinhos",
    "members": 9,
    "url": "https://chat.whatsapp.com/IL19elpCWFsFPVGn54vt6N",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-carol-mqtgresj",
    "permission": "unknown"
  },
  {
    "id": "F6yfi4p3GKe4AC05lUAq9R",
    "name": "Fran_indicaaa Promos e ofertas diversas 💥",
    "niche": "Achadinhos",
    "members": 19,
    "url": "https://chat.whatsapp.com/F6yfi4p3GKe4AC05lUAq9R",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/fran-indicaaa-promos-e-ofertas-diversas-mqu3oo89",
    "permission": "unknown"
  },
  {
    "id": "LbTKdyanoYHICGdIzyGb2j",
    "name": "O Mago das Promoções 🤑💥🧙🏻‍♂️#1",
    "niche": "Achadinhos",
    "members": 23,
    "url": "https://chat.whatsapp.com/LbTKdyanoYHICGdIzyGb2j",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/o-mago-das-promocoes-1-mquxha2d",
    "permission": "unknown"
  },
  {
    "id": "CL3o7kRK0yv52YgdFNJ68p",
    "name": "AchadinhosJK",
    "niche": "Achadinhos",
    "members": 77,
    "url": "https://chat.whatsapp.com/CL3o7kRK0yv52YgdFNJ68p",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhosjk-mqv8ve7w",
    "permission": "unknown"
  },
  {
    "id": "K3Th8NnclTh0X5XyZfx8t2",
    "name": "O Cartão Que Lute - Ofertas",
    "niche": "Achadinhos",
    "members": 47,
    "url": "https://chat.whatsapp.com/K3Th8NnclTh0X5XyZfx8t2",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/o-cartao-que-lute-ofertas-mqvgtcon",
    "permission": "unknown"
  },
  {
    "id": "Itje1treJ1CBHrYBjRITem",
    "name": "SALVEI PRA COMPRAR OFERTAS",
    "niche": "Achadinhos",
    "members": 387,
    "url": "https://chat.whatsapp.com/Itje1treJ1CBHrYBjRITem",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/salvei-pra-comprar-ofertas-mqxs3d35",
    "permission": "unknown"
  },
  {
    "id": "JWfwLGjwCez0H3lZGOZUeh",
    "name": "Achadinhos Shopee",
    "niche": "Achadinhos",
    "members": 6,
    "url": "https://chat.whatsapp.com/JWfwLGjwCez0H3lZGOZUeh",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-meli-mqybwpij",
    "permission": "unknown"
  },
  {
    "id": "IJ4GIQj0VKcFNTt5NqKO8p",
    "name": "Achadinhos da Naty | 01 🛍💗",
    "niche": "Achadinhos",
    "members": 339,
    "url": "https://chat.whatsapp.com/IJ4GIQj0VKcFNTt5NqKO8p",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-naty-01-mr1jt5sk",
    "permission": "unknown"
  },
  {
    "id": "BA9Mi22bswG2bOLTECJQpe",
    "name": "🤑TOP OFERTAS DO DANIEL",
    "niche": "Achadinhos",
    "members": 297,
    "url": "https://chat.whatsapp.com/BA9Mi22bswG2bOLTECJQpe",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/top-ofertas-do-daniel-mr4xyi0k",
    "permission": "unknown"
  },
  {
    "id": "LQLRz8zjktrDozGLaoI00H",
    "name": "Ofertas Shoppee🛍️🛒",
    "niche": "Achadinhos",
    "members": 123,
    "url": "https://chat.whatsapp.com/LQLRz8zjktrDozGLaoI00H",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-shoppee-mr686op9",
    "permission": "unknown"
  },
  {
    "id": "Bu7WpRlQWCyFmQxZ4O5WBP",
    "name": "Alerta de Ofertas",
    "niche": "Promoções e Cupons",
    "members": 15,
    "url": "https://chat.whatsapp.com/Bu7WpRlQWCyFmQxZ4O5WBP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/alerta-de-ofertas-mr6jqeae",
    "permission": "unknown"
  },
  {
    "id": "Kv8xMl9lYmjAQfYmu4UG6l",
    "name": "Fêh Select | Achados Imperdíveis🛍️🩷",
    "niche": "Achadinhos",
    "members": 23,
    "url": "https://chat.whatsapp.com/Kv8xMl9lYmjAQfYmu4UG6l",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-fernanda-silva-mr6yymu5",
    "permission": "unknown"
  },
  {
    "id": "DLlvcsxdPlT6yE5Hbeglqk",
    "name": "TáNaMão - Promoções #02",
    "niche": "Achadinhos",
    "members": 85,
    "url": "https://chat.whatsapp.com/DLlvcsxdPlT6yE5Hbeglqk",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/tanamao-promocoes-02-mra2v6q4",
    "permission": "unknown"
  },
  {
    "id": "BfGt7oCr5318Qch9cTL7Dw",
    "name": "ACHADINHOS DO NOVA",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/BfGt7oCr5318Qch9cTL7Dw",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-do-nova-mrbtsl89",
    "permission": "unknown"
  },
  {
    "id": "KOm0VvQL1JlGwR9MCmN9EZ",
    "name": "🛍️ Angel Store | Promoções Exclusivas",
    "niche": "Achadinhos",
    "members": 56,
    "url": "https://chat.whatsapp.com/KOm0VvQL1JlGwR9MCmN9EZ",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/angel-store-promocoes-exclusivas-mrcvovxz",
    "permission": "unknown"
  },
  {
    "id": "Btx4VEEklpxGyHn1XYvPTm",
    "name": "MM OFERTAS 🔥✨🛍️",
    "niche": "Achadinhos",
    "members": 28,
    "url": "https://chat.whatsapp.com/Btx4VEEklpxGyHn1XYvPTm",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mm-ofertas-mrcvwos5",
    "permission": "unknown"
  },
  {
    "id": "Gnb7dEj3Ja4BHyfGWqQ001",
    "name": "🔥 Achadinhos Farm VIP",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/Gnb7dEj3Ja4BHyfGWqQ001",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-farm-vip-mrdlfyzo",
    "permission": "unknown"
  },
  {
    "id": "JsWfW2OooUC6XsL3RaeCA9",
    "name": "Vitima da Shopee 💅🏻✨🤩",
    "niche": "Achadinhos",
    "members": 30,
    "url": "https://chat.whatsapp.com/JsWfW2OooUC6XsL3RaeCA9",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitima-da-shopee-mrdporm7",
    "permission": "unknown"
  },
  {
    "id": "Js4UoPdWN9T68qQn49zv4c",
    "name": "Achadinhos da Shoppe 👙🛍️🎟️",
    "niche": "Achadinhos",
    "members": 40,
    "url": "https://chat.whatsapp.com/Js4UoPdWN9T68qQn49zv4c",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shoppe-mrfd7luw",
    "permission": "unknown"
  },
  {
    "id": "HACoHEyt98a0sbSsKUoj6Z",
    "name": "💸 Promoção Todo Dia",
    "niche": "Achadinhos",
    "members": 92,
    "url": "https://chat.whatsapp.com/HACoHEyt98a0sbSsKUoj6Z",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-vip-mrgtdhor",
    "permission": "unknown"
  },
  {
    "id": "JDFzJYgibh86Ls3qyedSVy",
    "name": "🛒Promo Imperdível - top achadinhos 🛒💱",
    "niche": "Achadinhos",
    "members": 5,
    "url": "https://chat.whatsapp.com/JDFzJYgibh86Ls3qyedSVy",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-imperdivel-top-achadinhos-mrh9jez6",
    "permission": "unknown"
  },
  {
    "id": "DUuDhimBIBA6ozmApyIHIH",
    "name": "PromoZap Shopee🚀🇧🇷",
    "niche": "Achadinhos",
    "members": 17,
    "url": "https://chat.whatsapp.com/DUuDhimBIBA6ozmApyIHIH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promozap-shopee-mrme7rw9",
    "permission": "unknown"
  },
  {
    "id": "HUukKvKbSqA57Ii4Gh9UsK",
    "name": "#10 🛍 Canal de Promoções",
    "niche": "Achadinhos",
    "members": 7,
    "url": "https://chat.whatsapp.com/HUukKvKbSqA57Ii4Gh9UsK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/10-canal-de-promocoes-mrnokkto",
    "permission": "unknown"
  },
  {
    "id": "JcOf0uwAvzYF8bxnEH0PxX",
    "name": "Amabel imports conde💥vendas📢",
    "niche": "Compras e Vendas",
    "members": 80,
    "url": "https://chat.whatsapp.com/JcOf0uwAvzYF8bxnEH0PxX",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/amabel-imports-condevendas-mrr1zmv4",
    "permission": "unknown"
  },
  {
    "id": "ExaEfa2wVoZJPVTr28iLXd",
    "name": "⚡⚠️Ofertas e preço baixo, você encontra aqui! \"Shopee, SHEIN e Mercado Livre\" ⚠️⚡",
    "niche": "Achadinhos",
    "members": 305,
    "url": "https://chat.whatsapp.com/ExaEfa2wVoZJPVTr28iLXd",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shoppe-e-mercado-livre-mrsj38fj",
    "permission": "unknown"
  },
  {
    "id": "GAWI1qlDB7X7HomGwiU9my",
    "name": "✨Caçadores de Ofertas ✨🔎",
    "niche": "Achadinhos",
    "members": 48,
    "url": "https://chat.whatsapp.com/GAWI1qlDB7X7HomGwiU9my",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/cacadores-de-ofertas-mrtylca0",
    "permission": "unknown"
  },
  {
    "id": "IUovduEODLjLkNXbO7doQN",
    "name": "🛍️Ofertas da Dani",
    "niche": "Achadinhos",
    "members": 7,
    "url": "https://chat.whatsapp.com/IUovduEODLjLkNXbO7doQN",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-mruvdoey",
    "permission": "unknown"
  },
  {
    "id": "KDbxVGwVsJQIdGFAt2m4z1",
    "name": "Ofertas Fitness 💪 #1",
    "niche": "Achadinhos",
    "members": 255,
    "url": "https://chat.whatsapp.com/KDbxVGwVsJQIdGFAt2m4z1",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-fitness-1-mruvpm9t",
    "permission": "unknown"
  },
  {
    "id": "EN0phu2dJWN7kH6DeXVwCI",
    "name": "#20 Achadinhos da Rachel🌹✨",
    "niche": "Achadinhos",
    "members": 381,
    "url": "https://chat.whatsapp.com/EN0phu2dJWN7kH6DeXVwCI",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/20-achadinhos-da-rachel-mruvw55n",
    "permission": "unknown"
  },
  {
    "id": "FoSVC9hsUKIFTdPPxhPlvl",
    "name": "#21 Achadinhos da Rachel",
    "niche": "Achadinhos",
    "members": 158,
    "url": "https://chat.whatsapp.com/FoSVC9hsUKIFTdPPxhPlvl",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/21-achadinhos-da-rachel-mruvxzz1",
    "permission": "unknown"
  },
  {
    "id": "KvkpIPrjYdZDaHz5lcGlTx",
    "name": "#22 Achadinhos da Rachel🛍",
    "niche": "Achadinhos",
    "members": 49,
    "url": "https://chat.whatsapp.com/KvkpIPrjYdZDaHz5lcGlTx",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/22-achadinhos-da-rachel-mruvyi9q",
    "permission": "unknown"
  },
  {
    "id": "Kp4z12f1hzyHGfjDCS4Fp7",
    "name": "Achadinhos da Rachel✨️🛍",
    "niche": "Achadinhos",
    "members": 686,
    "url": "https://chat.whatsapp.com/Kp4z12f1hzyHGfjDCS4Fp7",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-rachel-mruw0ajp",
    "permission": "unknown"
  },
  {
    "id": "Kl121nGEMDIJqxeIJpiSis",
    "name": "🔥 SHOPEE PROMOÇÕES 🔥#2",
    "niche": "Achadinhos",
    "members": 44,
    "url": "https://chat.whatsapp.com/Kl121nGEMDIJqxeIJpiSis",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/shopee-promocoes-3-mrwleeu7",
    "permission": "unknown"
  },
  {
    "id": "Ededqba2QY69axehQVXxDL",
    "name": "Promoções imperdíveis🔥",
    "niche": "Achadinhos",
    "members": 14,
    "url": "https://chat.whatsapp.com/Ededqba2QY69axehQVXxDL",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-imperdiveis-mrwu7rwf",
    "permission": "unknown"
  },
  {
    "id": "LyFk0oufFK15znfQ14hgcz",
    "name": "🛍️ Achadinhos da Mika",
    "niche": "Achadinhos",
    "members": 11,
    "url": "https://chat.whatsapp.com/LyFk0oufFK15znfQ14hgcz",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-mika-mrywya15",
    "permission": "unknown"
  },
  {
    "id": "KcEvdK7MqiVDXPDbAkQX16",
    "name": "Caçadores de Promoções 🛍️🛒",
    "niche": "Achadinhos",
    "members": 59,
    "url": "https://chat.whatsapp.com/KcEvdK7MqiVDXPDbAkQX16",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/cacadores-de-promocoes-mrz2p0xw",
    "permission": "unknown"
  },
  {
    "id": "GimEl7qY6FD3jZ31A76een",
    "name": "Mundo das Promoções🤑🤑",
    "niche": "Achadinhos",
    "members": 64,
    "url": "https://chat.whatsapp.com/GimEl7qY6FD3jZ31A76een",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mundo-das-promocoes-ms1ta6iw",
    "permission": "unknown"
  },
  {
    "id": "Gdetc6pAw8RIvy1k5E7FX0",
    "name": "PROMOZAP - Ofertas 24hrs por dia",
    "niche": "Achadinhos",
    "members": 104,
    "url": "https://chat.whatsapp.com/Gdetc6pAw8RIvy1k5E7FX0",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promozap-ofertas-24hrs-por-dia-ms4y6msr",
    "permission": "unknown"
  },
  {
    "id": "GmcYLbdiypx7wmhhVEYBnM",
    "name": "Shop Ofertas 🎁🛍️",
    "niche": "Achadinhos",
    "members": 37,
    "url": "https://chat.whatsapp.com/GmcYLbdiypx7wmhhVEYBnM",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/gael-ofertas-ms5cxwu4",
    "permission": "unknown"
  },
  {
    "id": "Gkw1QlE5AfpLkoGzMgGyEm",
    "name": "💡 Vitrine VIP TECH",
    "niche": "Achadinhos",
    "members": 35,
    "url": "https://chat.whatsapp.com/Gkw1QlE5AfpLkoGzMgGyEm",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-de-ofertas-ms5jfvcg",
    "permission": "unknown"
  },
  {
    "id": "Eip8k5kpnFC3A5VRnyI141",
    "name": "Achadinho da Magalu",
    "niche": "Achadinhos",
    "members": 25,
    "url": "https://chat.whatsapp.com/Eip8k5kpnFC3A5VRnyI141",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendas-da-magazine-luiza-ms6cazcu",
    "permission": "unknown"
  },
  {
    "id": "FoKcMkxpMMu0OnCDLWjE6C",
    "name": "💎 Cantinho da Mari — Beleza e Ofertas 💎",
    "niche": "Achadinhos",
    "members": 72,
    "url": "https://chat.whatsapp.com/FoKcMkxpMMu0OnCDLWjE6C",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vip-ofertas-shopee-cupons-e-promocoes-ms6hfczq",
    "permission": "unknown"
  },
  {
    "id": "GPJGzBwrWGm4ihCYuc1ZBw",
    "name": "Garimpo Shopee & Mercado Livre",
    "niche": "Achadinhos",
    "members": 28,
    "url": "https://chat.whatsapp.com/GPJGzBwrWGm4ihCYuc1ZBw",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/garimpo-shopee-mercado-livre-ms6i2xn6",
    "permission": "unknown"
  },
  {
    "id": "E7KcQ4ivlW8AAtwp7I9vSt",
    "name": "OFERTAS RADICAIS 🛍️",
    "niche": "Achadinhos",
    "members": 70,
    "url": "https://chat.whatsapp.com/E7KcQ4ivlW8AAtwp7I9vSt",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-radicais-ms6iscgn",
    "permission": "unknown"
  },
  {
    "id": "HoGQkoVujOg1ZjFlYXHcBb",
    "name": "🏠 Vitrine VIP CASA",
    "niche": "Achadinhos",
    "members": 26,
    "url": "https://chat.whatsapp.com/HoGQkoVujOg1ZjFlYXHcBb",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-de-ofertas-2-achados-imperdiveis-ms82iypi",
    "permission": "unknown"
  },
  {
    "id": "D07phSgTZHcIoDe4eDwduT",
    "name": "@Clubeofertas.promoções✨️🎁🎁",
    "niche": "Achadinhos",
    "members": 116,
    "url": "https://chat.whatsapp.com/D07phSgTZHcIoDe4eDwduT",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clubeofertas-promocoes-msd367e2",
    "permission": "unknown"
  },
  {
    "id": "Ht9ukz392jJJPC7Zd5lAmz",
    "name": "Shopee Barato Todo Dia 💸",
    "niche": "Achadinhos",
    "members": 38,
    "url": "https://chat.whatsapp.com/Ht9ukz392jJJPC7Zd5lAmz",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/shopee-barato-todo-dia-msd8pmjs",
    "permission": "unknown"
  },
  {
    "id": "DpOCKTsSovGJlfl5WovS3B",
    "name": "Achadinhos  de milhões 👸💗🛒",
    "niche": "Achadinhos",
    "members": 51,
    "url": "https://chat.whatsapp.com/DpOCKTsSovGJlfl5WovS3B",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-de-milhoes-msfczbp0",
    "permission": "unknown"
  },
  {
    "id": "LdVmXvuiyrIBvVkm4YeCu7",
    "name": "PROMOÇÕES IMPERDÍVEIS",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/LdVmXvuiyrIBvVkm4YeCu7",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-imperdiveis-msgtbq46",
    "permission": "unknown"
  },
  {
    "id": "DQG6DEaktwN3vwamyLvBD7",
    "name": "🏷️Mestre das Ofertas | Oficial",
    "niche": "Achadinhos",
    "members": 12,
    "url": "https://chat.whatsapp.com/DQG6DEaktwN3vwamyLvBD7",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mestre-das-ofertas-oficial-mskbzept",
    "permission": "unknown"
  },
  {
    "id": "LnXAVksD84E25p2448svRw",
    "name": "Promoções e ofertas LF ● @achadinhosdalf 🛍️",
    "niche": "Achadinhos",
    "members": 45,
    "url": "https://chat.whatsapp.com/LnXAVksD84E25p2448svRw",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-e-ofertas-lf-achadinhosdalf-msny7rev",
    "permission": "unknown"
  },
  {
    "id": "Bh6cnHps2sO3qDHqUtjzmO",
    "name": "Promoções e achadinhos",
    "niche": "Achadinhos",
    "members": 20,
    "url": "https://chat.whatsapp.com/Bh6cnHps2sO3qDHqUtjzmO",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-e-achadinhos-mspzuulu",
    "permission": "unknown"
  },
  {
    "id": "DqwpzazM82PGJLuqtWA0vH",
    "name": "🛒🔥 CENTRAL DE OFERTAS JR 🔥🛒",
    "niche": "Achadinhos",
    "members": 39,
    "url": "https://chat.whatsapp.com/DqwpzazM82PGJLuqtWA0vH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/central-de-ofertas-jr-msqdo54v",
    "permission": "unknown"
  },
  {
    "id": "DR3sUB2rT7X9KJMnt5ZRkg",
    "name": "🎯 JJ CAÇA OFERTAS 🎯 #01",
    "niche": "Achadinhos",
    "members": 3,
    "url": "https://chat.whatsapp.com/DR3sUB2rT7X9KJMnt5ZRkg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/jj-caca-ofertas-01-mstdz92b",
    "permission": "unknown"
  },
  {
    "id": "LA8IVHxxcF63XqdR12QvtE",
    "name": "Clube das Ofertas",
    "niche": "Achadinhos",
    "members": 258,
    "url": "https://chat.whatsapp.com/LA8IVHxxcF63XqdR12QvtE",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-das-ofertas-mstk7fhb",
    "permission": "unknown"
  },
  {
    "id": "IC3LXy1ywvWGnrsDjfkH5W",
    "name": "✨Grupo de ofertas✨ #2 Shopee",
    "niche": "Achadinhos",
    "members": 19,
    "url": "https://chat.whatsapp.com/IC3LXy1ywvWGnrsDjfkH5W",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-de-ofertas-1-vitrinedalivia-msuika35",
    "permission": "unknown"
  },
  {
    "id": "Kfsf9a0WrOA7Bm7Eu7FsJO",
    "name": "ACHADINHOS 😉",
    "niche": "Achadinhos",
    "members": 19,
    "url": "https://chat.whatsapp.com/Kfsf9a0WrOA7Bm7Eu7FsJO",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-msw2czoy",
    "permission": "unknown"
  },
  {
    "id": "ChNihMXFaz87FzUGCSZZs1",
    "name": "Achadinhos Premium Shoppe 💎",
    "niche": "Achadinhos",
    "members": 77,
    "url": "https://chat.whatsapp.com/ChNihMXFaz87FzUGCSZZs1",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-premium-shoppe-mszd2tpn",
    "permission": "unknown"
  },
  {
    "id": "HoFSv1zjnUs9ZvoBWlTt2y",
    "name": "Achadinhos e promos 🛍️✨",
    "niche": "Achadinhos",
    "members": 166,
    "url": "https://chat.whatsapp.com/HoFSv1zjnUs9ZvoBWlTt2y",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-e-promos-mt2a18s6",
    "permission": "allowed"
  },
  {
    "id": "DoMsueBqOdtIx3TR8KHZxL",
    "name": "PS Livre Shop | Achadinhos 💰🛒",
    "niche": "Achadinhos",
    "members": 92,
    "url": "https://chat.whatsapp.com/DoMsueBqOdtIx3TR8KHZxL",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ps-livre-shop-achadinhos-mt2e1bt2",
    "permission": "unknown"
  },
  {
    "id": "C8QtAbLGWe28oH8zATRoPK",
    "name": "Achadinhos da Van 🛍️",
    "niche": "Achadinhos",
    "members": 12,
    "url": "https://chat.whatsapp.com/C8QtAbLGWe28oH8zATRoPK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-van-mt2x3rb5",
    "permission": "unknown"
  },
  {
    "id": "I4cvS0tgd15LGBSOTlh6Ao",
    "name": "Achadinhos Shopee 🧡",
    "niche": "Achadinhos",
    "members": 93,
    "url": "https://chat.whatsapp.com/I4cvS0tgd15LGBSOTlh6Ao",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-shopee-mt92jfl2",
    "permission": "unknown"
  },
  {
    "id": "BVxGg4Jvr3k2Esv8t9oWSW",
    "name": "Achadinhos & Ofertas",
    "niche": "Achadinhos",
    "members": 36,
    "url": "https://chat.whatsapp.com/BVxGg4Jvr3k2Esv8t9oWSW",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-ofertas-mtaa9apv",
    "permission": "unknown"
  },
  {
    "id": "JLcUIyHfKyS8edk4opW0zt",
    "name": "Achadinhos dos Fãs | Ofertas & Cupons 02",
    "niche": "Achadinhos",
    "members": 400,
    "url": "https://chat.whatsapp.com/JLcUIyHfKyS8edk4opW0zt",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-dos-fas-ofertas-cupons-02-mtaajgza",
    "permission": "unknown"
  },
  {
    "id": "D0t2T95RHcC9HS7ZMYv0X5",
    "name": "Achadinhos VIP da Brito 🛒🛍🔥",
    "niche": "Achadinhos",
    "members": 102,
    "url": "https://chat.whatsapp.com/D0t2T95RHcC9HS7ZMYv0X5",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-vip-da-brito-mtajkhrc",
    "permission": "unknown"
  },
  {
    "id": "Ic4iiv7i6B37xCIoFnA1uW",
    "name": "GRUPO DE OFERTAS",
    "niche": "Achadinhos",
    "members": 96,
    "url": "https://chat.whatsapp.com/Ic4iiv7i6B37xCIoFnA1uW",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-do-dia-mtan6vyf",
    "permission": "unknown"
  },
  {
    "id": "CQiIU6UCB3Y6VNUr0gJ0Km",
    "name": "vendas Toledo - PR",
    "niche": "Compras e Vendas",
    "members": 6,
    "url": "https://chat.whatsapp.com/CQiIU6UCB3Y6VNUr0gJ0Km",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendas-toledo-pr-mtbo2wfv",
    "permission": "unknown"
  },
  {
    "id": "CjFbb23j2IvAH8LYG4ObjP",
    "name": "Top Ofertas 🥠  ‘Biscoito da Promoção' #1",
    "niche": "Achadinhos",
    "members": 61,
    "url": "https://chat.whatsapp.com/CjFbb23j2IvAH8LYG4ObjP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/top-ofertas-biscoito-da-promocao-1-mtg9u7ab",
    "permission": "unknown"
  },
  {
    "id": "CH9Px64y14nKRq0ja9y9ed",
    "name": "Seleção shopee   #3",
    "niche": "Achadinhos",
    "members": 8,
    "url": "https://chat.whatsapp.com/CH9Px64y14nKRq0ja9y9ed",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/selecao-shopee-3-mtim21ww",
    "permission": "unknown"
  },
  {
    "id": "DKXGXFPiK1w78Julxuogjf",
    "name": "Achadinhos da Shopee😍",
    "niche": "Achadinhos",
    "members": 1,
    "url": "https://chat.whatsapp.com/DKXGXFPiK1w78Julxuogjf",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-shopee-mtitwaaw",
    "permission": "unknown"
  },
  {
    "id": "Fc41t1GfgcIIN33gc2GUWF",
    "name": "ACHADINHOS MERCADO LIVRE 😉",
    "niche": "Achadinhos",
    "members": 2,
    "url": "https://chat.whatsapp.com/Fc41t1GfgcIIN33gc2GUWF",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-mercado-livre-mtlrkb34",
    "permission": "unknown"
  },
  {
    "id": "E3C48IrGiNeIutHHRKnsFO",
    "name": "💸 Achadinhos Shopee VIP",
    "niche": "Achadinhos",
    "members": 113,
    "url": "https://chat.whatsapp.com/E3C48IrGiNeIutHHRKnsFO",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-shopee-vip-mtm9t1s1",
    "permission": "unknown"
  },
  {
    "id": "HLL2EeGEmSOEQFYmFEwUPo",
    "name": "🎀 achadinhos",
    "niche": "Achadinhos",
    "members": 37,
    "url": "https://chat.whatsapp.com/HLL2EeGEmSOEQFYmFEwUPo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/bia-achadinhos-mtmarr73",
    "permission": "unknown"
  },
  {
    "id": "LtVn6npchGm9B55tCjEel0",
    "name": "Achadinhos & Ofertas 🛍️🔐",
    "niche": "Achadinhos",
    "members": 96,
    "url": "https://chat.whatsapp.com/LtVn6npchGm9B55tCjEel0",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-vip-achadinhos-ofertas-mtoc3hqz",
    "permission": "unknown"
  },
  {
    "id": "KYvKbsnh92IH5quDLJVKVl",
    "name": "Caçadores de Ofertas 🏹 🛒",
    "niche": "Achadinhos",
    "members": 24,
    "url": "https://chat.whatsapp.com/KYvKbsnh92IH5quDLJVKVl",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/cacadores-de-ofertas-mtpmq8ug",
    "permission": "unknown"
  },
  {
    "id": "JkGAOnZ8znM2iGHYlAMkAc",
    "name": "⚜️ VELS Ofertas do dia! ⚜️ #01 GERAL",
    "niche": "Achadinhos",
    "members": 80,
    "url": "https://chat.whatsapp.com/JkGAOnZ8znM2iGHYlAMkAc",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vels-ofertas-do-dia-01-geral-mtpp5cfj",
    "permission": "unknown"
  },
  {
    "id": "LTkKn7d64M228E1FEzpb4o",
    "name": "PhVendas ACHADINHOS E PROMO SHOPEE⚡🔥",
    "niche": "Achadinhos",
    "members": 16,
    "url": "https://chat.whatsapp.com/LTkKn7d64M228E1FEzpb4o",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/phstreaming-achadinhos-e-promo-shopee-mttjju1q",
    "permission": "unknown"
  },
  {
    "id": "IGeaXqUTINiDBz0AZsYj4T",
    "name": "🛒 Central dos Descontos | Ofertas & Promoções",
    "niche": "Promoções e Cupons",
    "members": 5,
    "url": "https://chat.whatsapp.com/IGeaXqUTINiDBz0AZsYj4T",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/central-dos-descontos-ofertas-promocoes-mtuxmxdp",
    "permission": "unknown"
  },
  {
    "id": "BsmTS5O62UCG7wqT0BHJip",
    "name": "Achadinhos de casa #5",
    "niche": "Achadinhos",
    "members": 520,
    "url": "https://chat.whatsapp.com/BsmTS5O62UCG7wqT0BHJip",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-de-casa-5-mtvjyvkg",
    "permission": "unknown"
  },
  {
    "id": "C3ZWSifFqKC3r2CRTAZmFH",
    "name": "🛍️ Clube de Ofertas MT | Promoções & Achadinhos",
    "niche": "Achadinhos",
    "members": 5,
    "url": "https://chat.whatsapp.com/C3ZWSifFqKC3r2CRTAZmFH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-de-ofertas-mt-promocoes-achadinhos-mtvyb0se",
    "permission": "unknown"
  },
  {
    "id": "FobNP9GsznKHduhSTNM6Hb",
    "name": "#8 | PROMOTECA - PROMOÇÕES",
    "niche": "Achadinhos",
    "members": 64,
    "url": "https://chat.whatsapp.com/FobNP9GsznKHduhSTNM6Hb",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promoteca-promocoes-8-mtvzwfkf",
    "permission": "unknown"
  },
  {
    "id": "FT1HmrWJmJvFVekz7KXexo",
    "name": "Clube de Ofertas da Clau🛍️",
    "niche": "Achadinhos",
    "members": 92,
    "url": "https://chat.whatsapp.com/FT1HmrWJmJvFVekz7KXexo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-de-ofertas-da-clau-mtxkeloa",
    "permission": "unknown"
  },
  {
    "id": "DwjsX5BhnZ33gwndUSJxh6",
    "name": "MULTI 💰⭐ - Promoções, Descontos, Cupons & Achados. #1",
    "niche": "Achadinhos",
    "members": 37,
    "url": "https://chat.whatsapp.com/DwjsX5BhnZ33gwndUSJxh6",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/multi-promocoes-descontos-cupons-achados-1-mtygyou3",
    "permission": "unknown"
  },
  {
    "id": "KuuBHxLcGVR3XuQnQKoaex",
    "name": "ACHADINHOS CASA DE FAZENDA 🌳👩🏼‍🌾",
    "niche": "Achadinhos",
    "members": 9,
    "url": "https://chat.whatsapp.com/KuuBHxLcGVR3XuQnQKoaex",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-casa-de-fazenda-mtz3afh7",
    "permission": "unknown"
  },
  {
    "id": "I1CcVt8xrYCALXnkj4BvZG",
    "name": "MODA E BELEZA FEMININA OFERTAS",
    "niche": "Achadinhos",
    "members": 7,
    "url": "https://chat.whatsapp.com/I1CcVt8xrYCALXnkj4BvZG",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/moda-e-beleza-feminina-ofertas-mtz3bslb",
    "permission": "unknown"
  },
  {
    "id": "E40b5kb0YgYKJ9AVKvltuW",
    "name": "GRUPO VIP DE ACHADINHOS INCRÍVEIS DO MERCADO LIVRE !!!",
    "niche": "Achadinhos",
    "members": 44,
    "url": "https://chat.whatsapp.com/E40b5kb0YgYKJ9AVKvltuW",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-vip-de-achadinhos-incriveis-do-mercado-livre-mtz95x0l",
    "permission": "unknown"
  },
  {
    "id": "IUoJOkAUPfbELH35fHmF5U",
    "name": "GS Ofertas - Calçados 👟 🤑",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/IUoJOkAUPfbELH35fHmF5U",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/gs-ofertas-calcados-mu1avcsn",
    "permission": "unknown"
  },
  {
    "id": "KHKX0saHDPt7YfXfTyaVbH",
    "name": "- 🛍️ Achadinhos, ofertas e Promoção 🛍️",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/KHKX0saHDPt7YfXfTyaVbH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-que-valem-a-pena-mu1ubtb6",
    "permission": "unknown"
  },
  {
    "id": "Gc0Oc6qAWF94R2LtlUc0Hr",
    "name": "Achadinhos shopee✨",
    "niche": "Achadinhos",
    "members": 106,
    "url": "https://chat.whatsapp.com/Gc0Oc6qAWF94R2LtlUc0Hr",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-shopee-mu4580ck",
    "permission": "unknown"
  },
  {
    "id": "JrjBn5S3kv10H93JhtQSUP",
    "name": "Radar de Promoções #2",
    "niche": "Achadinhos",
    "members": 30,
    "url": "https://chat.whatsapp.com/JrjBn5S3kv10H93JhtQSUP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/radar-de-promocoes-2-mu5qgc0m",
    "permission": "unknown"
  },
  {
    "id": "IN9sey15jMTKI4jDQJVeUf",
    "name": "💄 Achadinhos DELAS VIP",
    "niche": "Achadinhos",
    "members": 17,
    "url": "https://chat.whatsapp.com/IN9sey15jMTKI4jDQJVeUf",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-delas-vip-mu5s51ak",
    "permission": "unknown"
  },
  {
    "id": "HnTQnTHRqpE4l8JlybnT4m",
    "name": "PROMOÇÕES ATIVAS 🛒🛍️",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/HnTQnTHRqpE4l8JlybnT4m",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocoes-ativas-mu61l76l",
    "permission": "unknown"
  },
  {
    "id": "IsAC9yQm84u5wTm2MHH2DN",
    "name": "#10 Radar de Ofertas 🎯📡",
    "niche": "Achadinhos",
    "members": 15,
    "url": "https://chat.whatsapp.com/IsAC9yQm84u5wTm2MHH2DN",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/10-radar-de-ofertas-mu95f8ia",
    "permission": "unknown"
  },
  {
    "id": "KoLSuPaoqH1BTJZjUQxwLB",
    "name": "🛒OFERTAS GERAIS #19 I CARRINHO SEM FREIO",
    "niche": "Achadinhos",
    "members": 122,
    "url": "https://chat.whatsapp.com/KoLSuPaoqH1BTJZjUQxwLB",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-19-i-carrinho-sem-freio-mubeskqm",
    "permission": "unknown"
  },
  {
    "id": "F7PpksT3mbh6ZisJIezQbS",
    "name": "JessCine Vendas de Dvds 💿💽",
    "niche": "Vendas",
    "members": 46,
    "url": "https://chat.whatsapp.com/F7PpksT3mbh6ZisJIezQbS",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendas-de-filmes-mubkhy4s",
    "permission": "unknown"
  },
  {
    "id": "HJHg9n9x0njAm1Enq3YKHU",
    "name": "millydosachadinhos_#777",
    "niche": "Achadinhos",
    "members": 1,
    "url": "https://chat.whatsapp.com/HJHg9n9x0njAm1Enq3YKHU",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/millydosachadinhos-777-muc16bt3",
    "permission": "unknown"
  },
  {
    "id": "BCIvkcPAFUoG29s9Xd5t1E",
    "name": "Tigreza das promoções #11",
    "niche": "Achadinhos",
    "members": 49,
    "url": "https://chat.whatsapp.com/BCIvkcPAFUoG29s9Xd5t1E",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/tigreza-das-promocoes-11-mujzpeio",
    "permission": "unknown"
  },
  {
    "id": "CEXiajOjET7APbTRHhNsa6",
    "name": "Jneto Ofertas",
    "niche": "Achadinhos",
    "members": 25,
    "url": "https://chat.whatsapp.com/CEXiajOjET7APbTRHhNsa6",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/jneto-ofertas-mulin0ln",
    "permission": "unknown"
  },
  {
    "id": "IQ4b64XRPv1JA5f1Dk2BJv",
    "name": "Ofertas e Promoções Magazine Jeffemay",
    "niche": "Achadinhos",
    "members": 70,
    "url": "https://chat.whatsapp.com/IQ4b64XRPv1JA5f1Dk2BJv",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-e-promocoes-magazine-jeffemay-mulsr95u",
    "permission": "unknown"
  },
  {
    "id": "II9wfUc39nKJB0XHHEuw5e",
    "name": "Achadinhos e Ofertas #1",
    "niche": "Achadinhos",
    "members": 2,
    "url": "https://chat.whatsapp.com/II9wfUc39nKJB0XHHEuw5e",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-e-ofertas-1-mun0j4s3",
    "permission": "unknown"
  },
  {
    "id": "BVbK7uT2FseG2engQCHkp8",
    "name": "🔹 Achadinhos do Ewerton\n➡️ As melhores ofertas da Shopee e Mercado Livre",
    "niche": "Achadinhos",
    "members": 155,
    "url": "https://chat.whatsapp.com/BVbK7uT2FseG2engQCHkp8",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-do-ewerton-as-melhores-ofertas-da-shopee-e-mercado-livre-mun9uh9u",
    "permission": "unknown"
  },
  {
    "id": "C2mEQW7WwJ4KSijihbPnRk",
    "name": "✨ OFERTAS EXCLUSIVAS TOP MAGAZINE 🛍️",
    "niche": "Achadinhos",
    "members": 121,
    "url": "https://chat.whatsapp.com/C2mEQW7WwJ4KSijihbPnRk",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertas-exclusivas-top-magazine-muohcuog",
    "permission": "unknown"
  },
  {
    "id": "F3r9XW6pMYX937Nm1mjjp9",
    "name": "🛍️ GARIMPO DE OFERTAS 📱🛒",
    "niche": "Achadinhos",
    "members": 38,
    "url": "https://chat.whatsapp.com/F3r9XW6pMYX937Nm1mjjp9",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/garimpo-de-ofertas-muq71ht8",
    "permission": "unknown"
  },
  {
    "id": "CPVAWdclEjj87C9GBGBeYN",
    "name": "ACHADOS DA LORI | SHOPEE 🛍️✨",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/CPVAWdclEjj87C9GBGBeYN",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-da-lori-shopee-muvb7p8s",
    "permission": "unknown"
  },
  {
    "id": "EC4arP5hupKA9ErI0PFdmY",
    "name": "Mercado Livre - Ofertas",
    "niche": "Achadinhos",
    "members": 2,
    "url": "https://chat.whatsapp.com/EC4arP5hupKA9ErI0PFdmY",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mercado-livre-ofertas-muvf2qpx",
    "permission": "unknown"
  },
  {
    "id": "I5fyl8y5SGh0BjkRbIXr8M",
    "name": "🛍️✨ ACHADINHOS DA LÊ ✨🛍️",
    "niche": "Achadinhos",
    "members": 17,
    "url": "https://chat.whatsapp.com/I5fyl8y5SGh0BjkRbIXr8M",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-da-le-muwxta4l",
    "permission": "unknown"
  },
  {
    "id": "GgLXTIC4kRiEloohCiN6kb",
    "name": "Achadinhos & Ofertas 🔥",
    "niche": "Achadinhos",
    "members": 7,
    "url": "https://chat.whatsapp.com/GgLXTIC4kRiEloohCiN6kb",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinhos-ofertas-muyvk07e",
    "permission": "unknown"
  },
  {
    "id": "Hui7igXkOei7JNaS55QlHH",
    "name": "🔨🪜Loja das Ferramentas 🛠️🤝",
    "niche": "Achadinhos",
    "members": 279,
    "url": "https://chat.whatsapp.com/Hui7igXkOei7JNaS55QlHH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/loja-das-ferramentas-muzuw1uj",
    "permission": "unknown"
  },
  {
    "id": "EQfW9L1ltRn0MPAqxFipcq",
    "name": "Paguei Barato 🤝Mercado Livre , Amazon📺, Shopee 👟",
    "niche": "Achadinhos",
    "members": 134,
    "url": "https://chat.whatsapp.com/EQfW9L1ltRn0MPAqxFipcq",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/paguei-barato-mercado-livre-amazon-shopee-muzv2vsm",
    "permission": "unknown"
  },
  {
    "id": "I6mN6LKgS8N5go3TzOt6Rk",
    "name": "🍐Supermercado On-line✅",
    "niche": "Achadinhos",
    "members": 170,
    "url": "https://chat.whatsapp.com/I6mN6LKgS8N5go3TzOt6Rk",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/supermercado-on-line-muzv500f",
    "permission": "unknown"
  },
  {
    "id": "KmjO2cv94mdKRMxMiGZyhO",
    "name": "💥CAÇA OFERTAS RELÂMPAGOS 💥",
    "niche": "Achadinhos",
    "members": 562,
    "url": "https://chat.whatsapp.com/KmjO2cv94mdKRMxMiGZyhO",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/caca-ofertas-relampagos-muzvdww4",
    "permission": "unknown"
  },
  {
    "id": "G8wpF2I4CvMJ2ubbEiUi1W",
    "name": "OFERTASLEL",
    "niche": "Achadinhos",
    "members": 124,
    "url": "https://chat.whatsapp.com/G8wpF2I4CvMJ2ubbEiUi1W",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ofertaslel-mv1nrd3j",
    "permission": "unknown"
  },
  {
    "id": "IfiEvmsb7BXGN5EoD8hEEg",
    "name": "Leitão Ofertas #1",
    "niche": "Promoções e Cupons",
    "members": 39,
    "url": "https://chat.whatsapp.com/IfiEvmsb7BXGN5EoD8hEEg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/leitao-ofertas-1-mv1uwcuu",
    "permission": "unknown"
  },
  {
    "id": "HH4WYHp9bERJHVHw4lIYnd",
    "name": "Achados Shopee & Mercado Livre",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/HH4WYHp9bERJHVHw4lIYnd",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-shopee-mercado-livre-mv1zjy87",
    "permission": "unknown"
  },
  {
    "id": "KeT5KwOORg45IMLN4Ouc4O",
    "name": "🛒🛍️ACHADOS & PROMOÇÕES 🛒🛍️",
    "niche": "Promoções e Cupons",
    "members": 14,
    "url": "https://chat.whatsapp.com/KeT5KwOORg45IMLN4Ouc4O",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-promocoes-mv38d5h5",
    "permission": "unknown"
  },
  {
    "id": "HFRLZdcHtQo5zXBmxDI024",
    "name": "eCUPOMizando 🤑",
    "niche": "Achadinhos",
    "members": 108,
    "url": "https://chat.whatsapp.com/HFRLZdcHtQo5zXBmxDI024",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ecupomizando-mp1qbdia",
    "permission": "unknown"
  },
  {
    "id": "C2XrSAeSfcGIDvmVY38LkS",
    "name": "GARIMPO #1🛍️",
    "niche": "Vendas",
    "members": 101,
    "url": "https://chat.whatsapp.com/C2XrSAeSfcGIDvmVY38LkS",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/-mp1qbi8l",
    "permission": "unknown"
  },
  {
    "id": "Gubw7PMUxdrDNc64Ou6wKa",
    "name": "Plataformas chinesas 🐰",
    "niche": "Compras e Vendas",
    "members": 36,
    "url": "https://chat.whatsapp.com/Gubw7PMUxdrDNc64Ou6wKa",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/plataformas-chinesas-mp2zt42r",
    "permission": "unknown"
  },
  {
    "id": "Bq95sE7xwCZCTmwhDhZKBU",
    "name": "New Visual promo",
    "niche": "Compras e Vendas",
    "members": 28,
    "url": "https://chat.whatsapp.com/Bq95sE7xwCZCTmwhDhZKBU",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/new-visual-promo-mp4q7msb",
    "permission": "unknown"
  },
  {
    "id": "HphIRsrhr4F5zCoiyAIOjj",
    "name": "PROMO GERAL",
    "niche": "Compras e Vendas",
    "members": 32,
    "url": "https://chat.whatsapp.com/HphIRsrhr4F5zCoiyAIOjj",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-geral-mp4q8aet",
    "permission": "unknown"
  },
  {
    "id": "F3fRSskFKbEE4Vku0lCO75",
    "name": "millydosachadinhos_##777",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/F3fRSskFKbEE4Vku0lCO75",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/geral-mp4sl4u3",
    "permission": "unknown"
  },
  {
    "id": "EzzlwZzn5qZ7vZdn9nHfxy",
    "name": "Achadinho da shope",
    "niche": "Compras e Vendas",
    "members": 3,
    "url": "https://chat.whatsapp.com/EzzlwZzn5qZ7vZdn9nHfxy",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadinho-da-shope-mp5kvmoq",
    "permission": "unknown"
  },
  {
    "id": "KCsrrNFYKoE6aH8vQhVZJE",
    "name": "Achou & Economizou",
    "niche": "Compras e Vendas",
    "members": 28,
    "url": "https://chat.whatsapp.com/KCsrrNFYKoE6aH8vQhVZJE",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achou-economizou-mp5l6d4v",
    "permission": "unknown"
  },
  {
    "id": "CnfUFZGBP9GF6USF4n28tq",
    "name": "Rosé VIP #10",
    "niche": "Compras e Vendas",
    "members": 3,
    "url": "https://chat.whatsapp.com/CnfUFZGBP9GF6USF4n28tq",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/rose-vip-10-mp601yvx",
    "permission": "unknown"
  },
  {
    "id": "Ldga5Nw1oAtHs4nD6zYuO9",
    "name": "vision shop",
    "niche": "Compras e Vendas",
    "members": 4,
    "url": "https://chat.whatsapp.com/Ldga5Nw1oAtHs4nD6zYuO9",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vision-shop-mpbg8yey",
    "permission": "unknown"
  },
  {
    "id": "FzY0QQI2BhRHpF2EYb1Mxe",
    "name": "achadinhos",
    "niche": "Compras e Vendas",
    "members": 36,
    "url": "https://chat.whatsapp.com/FzY0QQI2BhRHpF2EYb1Mxe",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achadosdn-mpbhbbmf",
    "permission": "unknown"
  },
  {
    "id": "GAruUWNsMQ8Ad2YkNCy9mD",
    "name": "ELITE DOS ACHADOS 🛍️",
    "niche": "Compras e Vendas",
    "members": 25,
    "url": "https://chat.whatsapp.com/GAruUWNsMQ8Ad2YkNCy9mD",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/elite-dos-achados-mpcp4ph1",
    "permission": "unknown"
  },
  {
    "id": "FNWLCBJPfLt94qrpCOREzR",
    "name": "Vantagem Oculta 💰🤑🔥",
    "niche": "Compras e Vendas",
    "members": 42,
    "url": "https://chat.whatsapp.com/FNWLCBJPfLt94qrpCOREzR",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vantagem-oculta-mpctrwct",
    "permission": "unknown"
  },
  {
    "id": "JkJcRzHnAef8x23qYTYZUJ",
    "name": "Promos da Yas 🧡#1",
    "niche": "Compras e Vendas",
    "members": 88,
    "url": "https://chat.whatsapp.com/JkJcRzHnAef8x23qYTYZUJ",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-da-yas-mpdgnmtt",
    "permission": "unknown"
  },
  {
    "id": "JzbqmuArOCJ42Hr8nS7qBB",
    "name": "promos",
    "niche": "Compras e Vendas",
    "members": 4,
    "url": "https://chat.whatsapp.com/JzbqmuArOCJ42Hr8nS7qBB",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-mpfpwzvx",
    "permission": "unknown"
  },
  {
    "id": "FHQTnRcVCjbALaDoJfHGN1",
    "name": "Ofertas Gerais / Descontão do Bruno VIP",
    "niche": "Compras e Vendas",
    "members": 140,
    "url": "https://chat.whatsapp.com/FHQTnRcVCjbALaDoJfHGN1",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/descontao-do-bruno-03-mpfv6lbj",
    "permission": "unknown"
  },
  {
    "id": "GZyoIso7VJw1QlXHzDbuME",
    "name": "🛒 PROMO XBR 🇧🇷",
    "niche": "Compras e Vendas",
    "members": 9,
    "url": "https://chat.whatsapp.com/GZyoIso7VJw1QlXHzDbuME",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-xbr-mpg742yd",
    "permission": "unknown"
  },
  {
    "id": "Bk5C0VxpCNCFgIh3GygLUO",
    "name": "Closet Promo | 03",
    "niche": "Compras e Vendas",
    "members": 3,
    "url": "https://chat.whatsapp.com/Bk5C0VxpCNCFgIh3GygLUO",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/closet-promo-03-mphxkxer",
    "permission": "unknown"
  },
  {
    "id": "HqHzSMpA8jkDhCYfGk1YI1",
    "name": "🚀CAMISAS TAILANDESAS🇹🇭🤝🇧🇷 (ATACADO E VAREJO)",
    "niche": "Compras e Vendas",
    "members": 206,
    "url": "https://chat.whatsapp.com/HqHzSMpA8jkDhCYfGk1YI1",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/camisas-tailandesas-atacado-e-varejo-mpie8iqh",
    "permission": "unknown"
  },
  {
    "id": "C3boniYiYWHLw5FB9kRzJg",
    "name": "MELHORES PREÇOS E QUALIDADE  🎁",
    "niche": "Compras e Vendas",
    "members": 32,
    "url": "https://chat.whatsapp.com/C3boniYiYWHLw5FB9kRzJg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/melhores-precos-e-qualidade-mplnfwms",
    "permission": "unknown"
  },
  {
    "id": "DDrxi0AN4iv04GArdQG6lP",
    "name": "🛍️ Clube Vip Tupperware",
    "niche": "Compras e Vendas",
    "members": 34,
    "url": "https://chat.whatsapp.com/DDrxi0AN4iv04GArdQG6lP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-vip-tupperware-mpna4p2u",
    "permission": "unknown"
  },
  {
    "id": "Cz2Qj1dDQIm2Yr7QVb5JZK",
    "name": "PROMOS E CUPONS",
    "niche": "Compras e Vendas",
    "members": 188,
    "url": "https://chat.whatsapp.com/Cz2Qj1dDQIm2Yr7QVb5JZK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-e-cupons-mpr3o4n1",
    "permission": "unknown"
  },
  {
    "id": "Dz6A1ErCYKD0KammUw0o1z",
    "name": "Vitrine Virtual",
    "niche": "Achadinhos",
    "members": 18,
    "url": "https://chat.whatsapp.com/Dz6A1ErCYKD0KammUw0o1z",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-virtual-mprgun22",
    "permission": "unknown"
  },
  {
    "id": "J7iz7AXomyk7vwbisrYteQ",
    "name": "Tudo sobre os PDFs Copa 26",
    "niche": "Vendas",
    "members": 10,
    "url": "https://chat.whatsapp.com/J7iz7AXomyk7vwbisrYteQ",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/tudo-sobre-os-pdfs-copa-26-mprlc709",
    "permission": "unknown"
  },
  {
    "id": "DYgBBvD4notAlGXdaHdhFe",
    "name": "Bom&Barato",
    "niche": "Vendas",
    "members": 8,
    "url": "https://chat.whatsapp.com/DYgBBvD4notAlGXdaHdhFe",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/bom-barato-mpu6mguw",
    "permission": "unknown"
  },
  {
    "id": "D6JXug0E0mW9rYaUw6YahD",
    "name": "Compra Certa - Com.praai - Grupo 3",
    "niche": "Vendas",
    "members": 26,
    "url": "https://chat.whatsapp.com/D6JXug0E0mW9rYaUw6YahD",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/compra-certa-com-praai-grupo-3-mpxcnapl",
    "permission": "unknown"
  },
  {
    "id": "KtzEi63H2GDKV6HcfR6ABS",
    "name": "DL CASA E DECORAÇÃO - Oficial 🏠🪴👩🏽‍🎨🎨🎟💎",
    "niche": "Achadinhos",
    "members": 34,
    "url": "https://chat.whatsapp.com/KtzEi63H2GDKV6HcfR6ABS",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/dl-casa-e-decoracao-oficial-mq7vtg5o",
    "permission": "unknown"
  },
  {
    "id": "GTqVImNRGLgFvWsn9s5f5D",
    "name": "⚡☪️ Eclipse #5 — 🖥️ Tech & 📲 Promos que Ninguém te Conta ☪️⚡",
    "niche": "Achadinhos",
    "members": 5,
    "url": "https://chat.whatsapp.com/GTqVImNRGLgFvWsn9s5f5D",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/eclipse-5-tech-promos-que-ninguem-te-conta-mq8tek7f",
    "permission": "unknown"
  },
  {
    "id": "HgtnVpxZYkRBYMTVybgIm6",
    "name": "PROMO-BIG #01",
    "niche": "Achadinhos",
    "members": 152,
    "url": "https://chat.whatsapp.com/HgtnVpxZYkRBYMTVybgIm6",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-big-mqaubu3h",
    "permission": "unknown"
  },
  {
    "id": "G8cq1ve50oiC1e3hU7Hqsj",
    "name": "Oferta do dia",
    "niche": "Achadinhos",
    "members": 33,
    "url": "https://chat.whatsapp.com/G8cq1ve50oiC1e3hU7Hqsj",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/oferta-do-dia-mqfbf3w0",
    "permission": "unknown"
  },
  {
    "id": "GlZ6uG3HedWLlrWF5p0jDy",
    "name": "PROMO DAS VIPS✨",
    "niche": "Achadinhos",
    "members": 7,
    "url": "https://chat.whatsapp.com/GlZ6uG3HedWLlrWF5p0jDy",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-da-debora-mqgvfl00",
    "permission": "unknown"
  },
  {
    "id": "CQvdFQapOHnCokxbFcp9yK",
    "name": "Dani Indica 🛒🛍️",
    "niche": "Achadinhos",
    "members": 18,
    "url": "https://chat.whatsapp.com/CQvdFQapOHnCokxbFcp9yK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/radar-de-promo-1-mqgvh7gu",
    "permission": "unknown"
  },
  {
    "id": "D2TaR4rxnUGFUcFQpbN6T3",
    "name": "Compra e venda💰",
    "niche": "Compras e Vendas",
    "members": 23,
    "url": "https://chat.whatsapp.com/D2TaR4rxnUGFUcFQpbN6T3",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/compra-e-venda-mqmoe7yg",
    "permission": "unknown"
  },
  {
    "id": "DxSEfuvcIx4A1WyyZI2erQ",
    "name": "#03 Promos p/ sua Casa",
    "niche": "Achadinhos",
    "members": 11,
    "url": "https://chat.whatsapp.com/DxSEfuvcIx4A1WyyZI2erQ",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/03-promos-p-sua-casa-mqpk0c55",
    "permission": "unknown"
  },
  {
    "id": "CTIktRYpJlC2rbKGPY4GOb",
    "name": "Lar & Decoração Promo VIP | 🎁",
    "niche": "Achadinhos",
    "members": 62,
    "url": "https://chat.whatsapp.com/CTIktRYpJlC2rbKGPY4GOb",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/lar-decoracao-promo-vip-mqqrhh4q",
    "permission": "unknown"
  },
  {
    "id": "DfGizZU2det1ZTI8ie2qjd",
    "name": "Mãe Econômica 💰",
    "niche": "Achadinhos",
    "members": 42,
    "url": "https://chat.whatsapp.com/DfGizZU2det1ZTI8ie2qjd",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mae-economica-mqr84bor",
    "permission": "unknown"
  },
  {
    "id": "I5GLcDe3Tmb6kW19ZP61P6",
    "name": "Garimpo Casa, Construção & Ferramentas",
    "niche": "Achadinhos",
    "members": 32,
    "url": "https://chat.whatsapp.com/I5GLcDe3Tmb6kW19ZP61P6",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/garimpo-casa-construcao-ferramentas-mqs3d4sg",
    "permission": "unknown"
  },
  {
    "id": "F3K70asgArgL758X0Z6471",
    "name": "Promosempre🛍️🔍",
    "niche": "Achadinhos",
    "members": 36,
    "url": "https://chat.whatsapp.com/F3K70asgArgL758X0Z6471",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promosempre-mqv0cihl",
    "permission": "unknown"
  },
  {
    "id": "FoKMPndUvki5nze5X8gvcr",
    "name": "𝗢𝗙𝗘𝗥𝗧𝗔𝗦 𝗩𝗜𝗣 | 𝗦𝗵𝗼𝗽𝗲𝗲 & 𝗠𝗲𝗿𝗰𝗮𝗱𝗼 𝗟𝗶𝘃𝗿𝗲",
    "niche": "Achadinhos",
    "members": 193,
    "url": "https://chat.whatsapp.com/FoKMPndUvki5nze5X8gvcr",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/-mqvajnz5",
    "permission": "unknown"
  },
  {
    "id": "Bb1Gtwpp7ELBaFGMMGv6b5",
    "name": "roachadinho _",
    "niche": "Achadinhos",
    "members": 87,
    "url": "https://chat.whatsapp.com/Bb1Gtwpp7ELBaFGMMGv6b5",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/roachadinho-mqwf2ybt",
    "permission": "unknown"
  },
  {
    "id": "IFxwmiUd1uGDVfnk24V7QN",
    "name": "Vitrine da Keti 🛍️✨",
    "niche": "Achadinhos",
    "members": 26,
    "url": "https://chat.whatsapp.com/IFxwmiUd1uGDVfnk24V7QN",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-da-keti-mqx4mrab",
    "permission": "unknown"
  },
  {
    "id": "D82NOJJfOT04IC9qo6fGig",
    "name": "Lojinha Du Brimu",
    "niche": "Promoções e Cupons",
    "members": 262,
    "url": "https://chat.whatsapp.com/D82NOJJfOT04IC9qo6fGig",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/lojinha-du-brimu-mr16jz11",
    "permission": "unknown"
  },
  {
    "id": "GnmLDpeTwiFBWoazXMoSyl",
    "name": "Jeiser presentes🍫",
    "niche": "Achadinhos",
    "members": 116,
    "url": "https://chat.whatsapp.com/GnmLDpeTwiFBWoazXMoSyl",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/jeiser-presentes-mr572z38",
    "permission": "unknown"
  },
  {
    "id": "Es33RAGugRb9KIPwTHgbCe",
    "name": "Comprinhas Online 👩🏻‍💻",
    "niche": "Achadinhos",
    "members": 64,
    "url": "https://chat.whatsapp.com/Es33RAGugRb9KIPwTHgbCe",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/comprinhas-online-mr8sgwev",
    "permission": "unknown"
  },
  {
    "id": "KMPoOZYiYLwKP2LtJX7Hdr",
    "name": "🛍️Hora das compras shoppe",
    "niche": "Achadinhos",
    "members": 21,
    "url": "https://chat.whatsapp.com/KMPoOZYiYLwKP2LtJX7Hdr",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/emagrecimento-30-dias-mra1swk1",
    "permission": "unknown"
  },
  {
    "id": "FnauGBrGIXE7TCFoSIbNy7",
    "name": "🛒Ale Achados Certos🛍️",
    "niche": "Achadinhos",
    "members": 136,
    "url": "https://chat.whatsapp.com/FnauGBrGIXE7TCFoSIbNy7",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ale-achados-certos-mrbdy0pk",
    "permission": "unknown"
  },
  {
    "id": "LraZRXBo1Ht6KHNUj1ykPE",
    "name": "Painel de Consulta para Corredores/Limpa nome/Despachante/ Com SCORE de crédito",
    "niche": "Vendas",
    "members": 33,
    "url": "https://chat.whatsapp.com/LraZRXBo1Ht6KHNUj1ykPE",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/painel-de-consulta-para-corredores-limpa-nome-despachante-com-score-de-credito-mrbsh715",
    "permission": "unknown"
  },
  {
    "id": "KYVI5561TGhIOAQZb1Owub",
    "name": "COMPRANDO ONLINE",
    "niche": "Achadinhos",
    "members": 37,
    "url": "https://chat.whatsapp.com/KYVI5561TGhIOAQZb1Owub",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/comprando-online-mrchyrmw",
    "permission": "unknown"
  },
  {
    "id": "DLDtaxmbWNvDA0JYYPzA2d",
    "name": "HT outlet utilidades",
    "niche": "Achadinhos",
    "members": 169,
    "url": "https://chat.whatsapp.com/DLDtaxmbWNvDA0JYYPzA2d",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/ht-outlet-utilidades-mrdq2kc4",
    "permission": "unknown"
  },
  {
    "id": "B5duuJvYXIaF7ROsM1JeeM",
    "name": "O CONSUMISTA",
    "niche": "Achadinhos",
    "members": 259,
    "url": "https://chat.whatsapp.com/B5duuJvYXIaF7ROsM1JeeM",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/o-consumista-mre7137p",
    "permission": "unknown"
  },
  {
    "id": "E5PXXzPqlc4Ecarrhz0bKX",
    "name": "Mundo dos Achadinhos(afiliados)",
    "niche": "Achadinhos",
    "members": 28,
    "url": "https://chat.whatsapp.com/E5PXXzPqlc4Ecarrhz0bKX",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/shoppe-mrflkegy",
    "permission": "unknown"
  },
  {
    "id": "HIEn4WlsA7TGGKgx3YifbP",
    "name": "Promoção todo dia",
    "niche": "Promoções e Cupons",
    "members": 14,
    "url": "https://chat.whatsapp.com/HIEn4WlsA7TGGKgx3YifbP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promocao-todo-dia-mrhsrje5",
    "permission": "unknown"
  },
  {
    "id": "E1CFGzTAVf41BwOhtVqZaj",
    "name": "PromoZap Prime",
    "niche": "Achadinhos",
    "members": 11,
    "url": "https://chat.whatsapp.com/E1CFGzTAVf41BwOhtVqZaj",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promozap-prime-mrkzm8lo",
    "permission": "unknown"
  },
  {
    "id": "Ktf1Dmz4m70DdyuLkzcP0z",
    "name": "Vendedor Jequiti",
    "niche": "Achadinhos",
    "members": 4,
    "url": "https://chat.whatsapp.com/Ktf1Dmz4m70DdyuLkzcP0z",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vendedor-jequiti-mrla7v1y",
    "permission": "unknown"
  },
  {
    "id": "JQ8tNZsTR9BGxJErWUTmEc",
    "name": "GRUPO #01 - REI DA COMPRINHA 🛒",
    "niche": "Achadinhos",
    "members": 17,
    "url": "https://chat.whatsapp.com/JQ8tNZsTR9BGxJErWUTmEc",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/grupo-01-rei-da-comprinha-mrn67zbq",
    "permission": "allowed"
  },
  {
    "id": "JcG6tdAJOVNEnhJVkvaanr",
    "name": "TALUPROMOS",
    "niche": "Achadinhos",
    "members": 10,
    "url": "https://chat.whatsapp.com/JcG6tdAJOVNEnhJVkvaanr",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/talupromos-mrnjk81u",
    "permission": "unknown"
  },
  {
    "id": "Lon5yIaXRy4FGsqZN9Q2Ld",
    "name": "ACHADOS IMPERDÍVEIS",
    "niche": "Achadinhos",
    "members": 55,
    "url": "https://chat.whatsapp.com/Lon5yIaXRy4FGsqZN9Q2Ld",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-imperdiveis-mrpkq2kl",
    "permission": "unknown"
  },
  {
    "id": "E0kWCesPLvRKNrqZb2ujLh",
    "name": "Promo todo Dia",
    "niche": "Achadinhos",
    "members": 43,
    "url": "https://chat.whatsapp.com/E0kWCesPLvRKNrqZb2ujLh",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-todo-dia-mrpnl2tp",
    "permission": "allowed"
  },
  {
    "id": "Du2hSE3IdxQAQGuEBviW6H",
    "name": "Promos Certa | 31",
    "niche": "Achadinhos",
    "members": 17,
    "url": "https://chat.whatsapp.com/Du2hSE3IdxQAQGuEBviW6H",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-certa-31-mrt7cun2",
    "permission": "unknown"
  },
  {
    "id": "HjZkzOX1Y0PKzWzyvWaK5g",
    "name": "Shoop_facil22",
    "niche": "Achadinhos",
    "members": 74,
    "url": "https://chat.whatsapp.com/HjZkzOX1Y0PKzWzyvWaK5g",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/shoop-facil22-mrw3zzy1",
    "permission": "unknown"
  },
  {
    "id": "Im5KE7U0RJAKA5Hc8epGQN",
    "name": "Garimpei Outlet 🔥",
    "niche": "Vendas",
    "members": 274,
    "url": "https://chat.whatsapp.com/Im5KE7U0RJAKA5Hc8epGQN",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/garimpei-outlet-mrwqscky",
    "permission": "unknown"
  },
  {
    "id": "HNaq2DgOVmVD2trSGpHEQu",
    "name": "Alexia_compreaqui ✨🛍️🛒✅",
    "niche": "Achadinhos",
    "members": 229,
    "url": "https://chat.whatsapp.com/HNaq2DgOVmVD2trSGpHEQu",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/alexia-doutora-compreaqui-mrxz97ho",
    "permission": "unknown"
  },
  {
    "id": "DWB7qqoFshz4FOg8kLehbH",
    "name": "Hermes Achando Ouro",
    "niche": "Achadinhos",
    "members": 90,
    "url": "https://chat.whatsapp.com/DWB7qqoFshz4FOg8kLehbH",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/hermes-achando-ouro-mrzck3qo",
    "permission": "unknown"
  },
  {
    "id": "LNWzcvaHLmSJ5FktPeLns8",
    "name": "DKORA Brasil",
    "niche": "Achadinhos",
    "members": 6,
    "url": "https://chat.whatsapp.com/LNWzcvaHLmSJ5FktPeLns8",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/dkora-brasil-mrzlopdv",
    "permission": "unknown"
  },
  {
    "id": "DyX6201FVQYCaYNnUG9RIK",
    "name": "𝐶𝑜𝑛𝑡𝑒𝑢́𝑑𝑜𝑠 𝑑𝑎 𝑙𝑎𝑟𝑖",
    "niche": "Vendas",
    "members": 5,
    "url": "https://chat.whatsapp.com/DyX6201FVQYCaYNnUG9RIK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/-mrzlveu9",
    "permission": "unknown"
  },
  {
    "id": "CgFRtzDDTOc6vf51d3hHno",
    "name": "Classificados Tatuí e região 🛍",
    "niche": "Compras e Vendas",
    "members": 121,
    "url": "https://chat.whatsapp.com/CgFRtzDDTOc6vf51d3hHno",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/classificados-tatui-e-regiao-mrzqqwuv",
    "permission": "unknown"
  },
  {
    "id": "HZN9KeP0XXM6FfufLk5ws4",
    "name": "Geralmente",
    "niche": "Achadinhos",
    "members": 8,
    "url": "https://chat.whatsapp.com/HZN9KeP0XXM6FfufLk5ws4",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/geral-ms0p76jd",
    "permission": "unknown"
  },
  {
    "id": "CYUwGpV2SFR2Us5oC03HP6",
    "name": "✨🛍️ 𝓐𝓬𝓱𝓪𝓭𝓲𝓷𝓱𝓸𝓼 𝓭𝓸 𝓓𝓲𝓪 ✨🛍️",
    "niche": "Achadinhos",
    "members": 58,
    "url": "https://chat.whatsapp.com/CYUwGpV2SFR2Us5oC03HP6",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/-ms52pxjs",
    "permission": "unknown"
  },
  {
    "id": "K5vj1kVpIYdHj92wZz0RM9",
    "name": "🛍️ MUNDO FEMININO 🛍️",
    "niche": "Achadinhos",
    "members": 45,
    "url": "https://chat.whatsapp.com/K5vj1kVpIYdHj92wZz0RM9",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/mundo-feminino-ms6ivvn7",
    "permission": "unknown"
  },
  {
    "id": "B6cVoS1f5ga9qlP7g7nnFY",
    "name": "J - POKÉMON TCG - PROMOS E CUPONS",
    "niche": "Achadinhos",
    "members": 95,
    "url": "https://chat.whatsapp.com/B6cVoS1f5ga9qlP7g7nnFY",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/j-pokemon-tcg-promos-e-cupons-ms7ys7vp",
    "permission": "unknown"
  },
  {
    "id": "EieYIyBD7RR3xYFxegUDqK",
    "name": "✨ Rotina e conforto ✨",
    "niche": "Achadinhos",
    "members": 11,
    "url": "https://chat.whatsapp.com/EieYIyBD7RR3xYFxegUDqK",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/rotina-e-conforto-msafatmh",
    "permission": "unknown"
  },
  {
    "id": "FVKgGHKoth4BEmv40WrXt8",
    "name": "Achados Baratos 💥",
    "niche": "Achadinhos",
    "members": 132,
    "url": "https://chat.whatsapp.com/FVKgGHKoth4BEmv40WrXt8",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-baratos-msf4zqm2",
    "permission": "unknown"
  },
  {
    "id": "Hc9tuDTtyqs0kBZ2KApNwy",
    "name": "✨Produtinhos da BELEZA VIP✨",
    "niche": "Achadinhos",
    "members": 56,
    "url": "https://chat.whatsapp.com/Hc9tuDTtyqs0kBZ2KApNwy",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/produtinhos-da-beleza-vip-msg07dyi",
    "permission": "unknown"
  },
  {
    "id": "HxzEIdzlstpAnmrYDa9AZo",
    "name": "ACHADOS ON🤩",
    "niche": "Achadinhos",
    "members": 1,
    "url": "https://chat.whatsapp.com/HxzEIdzlstpAnmrYDa9AZo",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-on-msghpeyw",
    "permission": "unknown"
  },
  {
    "id": "FzKM5B4rA4FATxAC3f153b",
    "name": "Clube do Julius 🤑",
    "niche": "Promoções e Cupons",
    "members": 5,
    "url": "https://chat.whatsapp.com/FzKM5B4rA4FATxAC3f153b",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/clube-do-julius-mshpfqew",
    "permission": "unknown"
  },
  {
    "id": "CluE8TTInUgJlOoSE75vZS",
    "name": "Promo Master 1",
    "niche": "Achadinhos",
    "members": 145,
    "url": "https://chat.whatsapp.com/CluE8TTInUgJlOoSE75vZS",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promo-master-1-msqi9an9",
    "permission": "unknown"
  },
  {
    "id": "BfnQ7Yd5LOC5XSG05RRz3o",
    "name": "CONECTA SUMARÉ 🏘️🤝",
    "niche": "Compras e Vendas",
    "members": 80,
    "url": "https://chat.whatsapp.com/BfnQ7Yd5LOC5XSG05RRz3o",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/conecta-sumare-msrlftb4",
    "permission": "unknown"
  },
  {
    "id": "B69WBhlMhso2xPjuWLGjZg",
    "name": "Shirlly | Mercado Livre, Shopee",
    "niche": "Achadinhos",
    "members": 6,
    "url": "https://chat.whatsapp.com/B69WBhlMhso2xPjuWLGjZg",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/shirlly-casa-organizacao-msrss27l",
    "permission": "unknown"
  },
  {
    "id": "ECcsqzvkPeaGcH6xE8Ierc",
    "name": "AcheiBarato",
    "niche": "Achadinhos",
    "members": 138,
    "url": "https://chat.whatsapp.com/ECcsqzvkPeaGcH6xE8Ierc",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/acheibarato-mss1lvov",
    "permission": "unknown"
  },
  {
    "id": "Kx5Y0VC3vvGEs1YwU2w1YP",
    "name": "Promos da Carol ✨",
    "niche": "Achadinhos",
    "members": 27,
    "url": "https://chat.whatsapp.com/Kx5Y0VC3vvGEs1YwU2w1YP",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/promos-da-carol-mssu1icv",
    "permission": "unknown"
  },
  {
    "id": "IgbJm8DEbsB4cyXE7m8XT8",
    "name": "Matrix dos Descontos 💳🏷️",
    "niche": "Achadinhos",
    "members": 43,
    "url": "https://chat.whatsapp.com/IgbJm8DEbsB4cyXE7m8XT8",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/matrix-dos-descontos-mssweq6e",
    "permission": "unknown"
  },
  {
    "id": "DI8tfj6zA2rCoqwN1w4I12",
    "name": "Casa da  Promo ✅#2",
    "niche": "Achadinhos",
    "members": 14,
    "url": "https://chat.whatsapp.com/DI8tfj6zA2rCoqwN1w4I12",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/casa-da-promo-msswq7xq",
    "permission": "unknown"
  },
  {
    "id": "Kg2haliCquKKDM3GGt7ifq",
    "name": "Vitrine de Achados [001]",
    "niche": "Achadinhos",
    "members": 8,
    "url": "https://chat.whatsapp.com/Kg2haliCquKKDM3GGt7ifq",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/vitrine-de-achados-001-msuhfovs",
    "permission": "unknown"
  },
  {
    "id": "J3KRNBDSJ8mKTwH3tk0uEM",
    "name": "Achados para você homem de estilo",
    "niche": "Achadinhos",
    "members": 2,
    "url": "https://chat.whatsapp.com/J3KRNBDSJ8mKTwH3tk0uEM",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/achados-para-voce-homem-de-estilo-msvtve9v",
    "permission": "unknown"
  },
  {
    "id": "JgICxgiukSZ0CKkbABLILU",
    "name": "👑 Fashion Deals BR",
    "niche": "Achadinhos",
    "members": 12,
    "url": "https://chat.whatsapp.com/JgICxgiukSZ0CKkbABLILU",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/fashion-deals-br-msw79b0u",
    "permission": "unknown"
  },
  {
    "id": "BRcBH503tmx1Gh1rNeYsDi",
    "name": "Oferta na Brasa 🔥",
    "niche": "Achadinhos",
    "members": 12,
    "url": "https://chat.whatsapp.com/BRcBH503tmx1Gh1rNeYsDi",
    "source": "https://gruposdowpp.com.br/grupo-whatsapp/oferta-na-brasa-mszy3cno",
    "permission": "unknown"
  }
];