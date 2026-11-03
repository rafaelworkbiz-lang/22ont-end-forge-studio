// Categorias e termos de busca do catálogo. Comissões exigem confirmação oficial.
export const meliCategories = [
  { id: "", keywords: [] as string[], name: "Todas" },
  { id: "MLB1051", keywords: ["iphone", "samsung galaxy", "motorola moto g", "xiaomi redmi", "smartphone", "capa celular", "carregador celular", "fone bluetooth celular"], name: "Celulares" },
  { id: "MLB1648", keywords: ["notebook", "monitor", "teclado", "mouse", "ssd", "impressora", "roteador wifi", "webcam"], name: "Informática" },
  { id: "MLB1000", keywords: ["fone de ouvido", "caixa de som bluetooth", "smart tv", "soundbar", "microfone", "câmera de segurança", "smartwatch", "power bank"], name: "Eletrônicos e Áudio" },
  { id: "MLB5726", keywords: ["air fryer", "geladeira", "máquina de lavar", "micro-ondas", "aspirador de pó", "liquidificador", "cafeteira", "ventilador"], name: "Eletrodomésticos" },
  { id: "MLB1574", keywords: ["colchão", "jogo de cama", "organizador", "luminária", "tapete", "cortina", "panela", "cadeira"], name: "Casa e Decoração" },
  { id: "MLB1430", keywords: ["tênis", "camiseta", "vestido", "jaqueta", "mochila", "relógio", "óculos de sol", "bermuda"], name: "Moda" },
  { id: "MLB1246", keywords: ["perfume", "shampoo", "protetor solar", "maquiagem", "creme hidratante", "secador de cabelo", "barbeador", "skincare"], name: "Beleza" },
  { id: "MLB263532", keywords: ["furadeira", "parafusadeira", "chave de fenda", "serra", "trena", "caixa de ferramentas", "lixadeira", "solda"], name: "Ferramentas" },
  { id: "MLB1144", keywords: ["playstation 5", "controle xbox", "nintendo switch", "headset gamer", "cadeira gamer", "jogo ps5", "mousepad gamer", "teclado gamer"], name: "Games" },
  { id: "MLB1276", keywords: ["bicicleta", "esteira", "halteres", "camisa de futebol", "bola", "suplemento whey", "corda de pular", "barraca camping"], name: "Esportes" },
  { id: "MLB1384", keywords: ["fralda", "carrinho de bebê", "mamadeira", "berço", "brinquedo educativo", "lenço umedecido", "cadeirinha carro", "body bebê"], name: "Bebês" },
  { id: "MLB1747", keywords: ["pneu", "óleo de motor", "bateria carro", "som automotivo", "capa de banco", "tapete automotivo", "limpador de para-brisa", "capacete moto"], name: "Automotivo" },
  { id: "MLB1071", keywords: ["ração cachorro", "areia para gato", "coleira", "cama pet", "brinquedo cachorro", "aquário", "arranhador gato", "comedouro"], name: "Pet Shop" },
];
export const MAX_PAGES = 40;
export function affiliateLink(permalink: string, tag: string) {
  if (!tag) return permalink;
  const u = new URL(permalink);
  if (tag) u.searchParams.set("matt_word", tag);
  u.searchParams.set("matt_tool", "afiliasplace");
  return u.toString();
}
