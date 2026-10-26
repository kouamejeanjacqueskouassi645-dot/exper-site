/*
 * EXPER — configuration facile
 * 1. Remplace WHATSAPP_NUMBER par ton numéro au format international sans + ni espaces.
 * Exemple Côte d'Ivoire : 2250700000000
 * 2. Modifie les produits dans le tableau PRODUCTS ci-dessous.
 */
const WHATSAPP_NUMBER = "2250000000000"; // À REMPLACER par ton vrai numéro WhatsApp

const PRODUCTS = [
  { id: "tee", name: "T-shirt EXPER", subtitle: "L’essentiel du quotidien", price: 10000, badge: "À VENIR", art: "tee", available: false },
  { id: "cap", name: "Casquette EXPER", subtitle: "Une signature discrète", price: 7000, badge: "À VENIR", art: "cap", available: false },
  { id: "tote", name: "Tote bag EXPER", subtitle: "Pensé pour bouger", price: 5000, badge: "À VENIR", art: "tote", available: false }
];

const CART_KEY = "exper-cart-v1";
const grid = document.getElementById("product-grid");
const cartOverlay = document.getElementById("cart-overlay");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartCountTitle = document.getElementById("cart-count-title");
const cartTotal = document.getElementById("cart-total");
const toast = document.getElementById("toast");
let cart = loadCart();
let toastTimer;

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "{}"); }
  catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
}
function money(amount) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function renderProducts() {
  grid.innerHTML = PRODUCTS.map(product => `
    <article class="product-card">
      <div class="product-image">
        <span class="product-badge">${product.badge}</span>
        <div class="product-art art-${product.art}"><span class="mini-logo">EX<span>P</span>ER</span></div>
      </div>
      <div class="product-info"><div><h3>${product.name}</h3><p>${product.subtitle}</p></div><span class="product-price">${money(product.price)}</span></div>
      <button class="add-button" data-add="${product.id}" ${product.available ? "" : "disabled"} style="${product.available ? "" : "opacity:.6;cursor:not-allowed"}">
        ${product.available ? "Ajouter au panier" : "Bientôt disponible"} <span>↗</span>
      </button>
    </article>`).join("");
}
function countItems() { return Object.values(cart).reduce((sum, qty) => sum + qty, 0); }
function getTotal() {
  return PRODUCTS.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
}
function renderCart() {
  const count = countItems();
  cartCount.textContent = count;
  cartCountTitle.textContent = `(${count})`;
  cartTotal.textContent = money(getTotal());
  const selected = PRODUCTS.filter(p => (cart[p.id] || 0) > 0);
  if (!selected.length) {
    cartItems.innerHTML = '<p class="empty-cart">Ton panier est encore vide.<br>Découvre les essentiels EXPER.</p>';
    return;
  }
  cartItems.innerHTML = selected.map(p => `
    <div class="cart-item">
      <div class="cart-thumb">EXP</div>
      <div><h3>${p.name}</h3><p>${money(p.price)} / unité</p>
        <div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Diminuer">−</button><span>${cart[p.id]}</span><button data-qty="${p.id}" data-delta="1" aria-label="Augmenter">+</button></div>
      </div>
      <button class="remove-item" data-remove="${p.id}" aria-label="Retirer ${p.name}">×</button>
    </div>`).join("");
}
function openCart() { cartOverlay.hidden = false; document.body.style.overflow = "hidden"; }
function closeCart() { cartOverlay.hidden = true; document.body.style.overflow = ""; }
function whatsappUrl(message) {
  const number = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function hasPlaceholderNumber() {
  return !WHATSAPP_NUMBER || WHATSAPP_NUMBER === "2250000000000" || WHATSAPP_NUMBER.length < 10;
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = PRODUCTS.find(p => p.id === button.dataset.add);
  if (!product || !product.available) return;
  cart[product.id] = (cart[product.id] || 0) + 1;
  saveCart(); renderCart(); showToast(`${product.name} ajouté au panier`);
});
document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("close-cart-bg").addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
cartItems.addEventListener("click", event => {
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (qtyButton) {
    const id = qtyButton.dataset.qty;
    cart[id] = (cart[id] || 0) + Number(qtyButton.dataset.delta);
    if (cart[id] <= 0) delete cart[id];
    saveCart(); renderCart();
  }
  if (removeButton) {
    delete cart[removeButton.dataset.remove];
    saveCart(); renderCart();
  }
});
document.getElementById("checkout").addEventListener("click", () => {
  const selected = PRODUCTS.filter(p => (cart[p.id] || 0) > 0);
  if (!selected.length) { showToast("Ajoute un article avant de commander."); return; }
  if (hasPlaceholderNumber()) { showToast("Configure d’abord ton numéro WhatsApp dans script.js."); return; }
  const lines = selected.map(p => `• ${p.name} x${cart[p.id]} — ${money(p.price * cart[p.id])}`);
  const message = `Bonjour EXPER ! Je souhaite commander :\n\n${lines.join("\n")}\n\nTotal estimé : ${money(getTotal())}\n\nMerci de confirmer la disponibilité et les modalités de livraison.`;
  window.open(whatsappUrl(message), "_blank", "noopener");
});
document.getElementById("whatsapp-contact").addEventListener("click", event => {
  event.preventDefault();
  if (hasPlaceholderNumber()) { showToast("Configure ton numéro WhatsApp dans script.js."); return; }
  window.open(whatsappUrl("Bonjour EXPER, je souhaite en savoir plus sur votre marque."), "_blank", "noopener");
});
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
  menuToggle.textContent = opened ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.textContent = "☰";
}));
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
