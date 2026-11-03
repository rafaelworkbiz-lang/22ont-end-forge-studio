import headphones from '@/assets/catalog-headphones.jpg';
import fryer from '@/assets/catalog-air-fryer.jpg';
import watch from '@/assets/catalog-watch.jpg';
import charger from '@/assets/catalog-charger.jpg';
import bottle from '@/assets/catalog-bottle.jpg';
import notebook from '@/assets/catalog-notebook.jpg';

// Illustrative presentation assets, never read by the account's sales engine.
export const presentationProducts = [
  { name: 'Fone sem fio', category: 'Áudio', image: headphones, orders: 25, revenue: 7497.50, commission: 674.77 },
  { name: 'Air fryer', category: 'Casa', image: fryer, orders: 20, revenue: 9998, commission: 899.82 },
  { name: 'Relógio inteligente', category: 'Acessórios', image: watch, orders: 20, revenue: 4998, commission: 449.82 },
  { name: 'Carregador USB-C', category: 'Tecnologia', image: charger, orders: 30, revenue: 2697, commission: 242.73 },
  { name: 'Garrafa térmica', category: 'Casa', image: bottle, orders: 20, revenue: 1998, commission: 179.82 },
  { name: 'Notebook', category: 'Informática', image: notebook, orders: 5, revenue: 11552.30, commission: 1039.71 },
];
export const presentationTotals = presentationProducts.reduce((total, product) => ({
  orders: total.orders + product.orders,
  revenue: Math.round((total.revenue + product.revenue) * 100) / 100,
  commission: Math.round((total.commission + product.commission) * 100) / 100,
}), { orders: 0, revenue: 0, commission: 0 });
export const previewMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);