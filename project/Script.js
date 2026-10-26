// ===== StockEasy: simple inventory and order management =====

const $ = id => document.getElementById(id);                              // short way to find an element
const day = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);   // date n days ago

// ---------- 1. Data: saved in the browser (localStorage), separately for each user ----------
let products, sales, bill = [], editId = null, page = 'dashboard';
let lang = localStorage.getItem('lang') || 'en';
let user = localStorage.getItem('session');      // the email of the logged-in person (null = nobody)

function load() {
  products = JSON.parse(localStorage.getItem('products_' + user)) || [
    { id: 1, name: 'Rice 1kg', price: 60, qty: 40, min: 10 },
    { id: 2, name: 'Sugar 1kg', price: 45, qty: 8, min: 10 },
    { id: 3, name: 'Milk 500ml', price: 28, qty: 30, min: 12 },
    { id: 4, name: 'Biscuits', price: 10, qty: 4, min: 15 },
    { id: 5, name: 'Tea Powder', price: 120, qty: 18, min: 5 },
    { id: 6, name: 'Soap', price: 35, qty: 3, min: 8 }
  ];
  sales = JSON.parse(localStorage.getItem('sales_' + user)) || [
    { date: day(3), items: [{ name: 'Rice 1kg', qty: 3, price: 60 }], total: 180 },
    { date: day(2), items: [{ name: 'Milk 500ml', qty: 5, price: 28 }, { name: 'Biscuits', qty: 4, price: 10 }], total: 180 },
    { date: day(1), items: [{ name: 'Tea Powder', qty: 2, price: 120 }], total: 240 },
    { date: day(0), items: [{ name: 'Rice 1kg', qty: 2, price: 60 }, { name: 'Soap', qty: 1, price: 35 }], total: 155 }
  ];
}
function save() {
  localStorage.setItem('products_' + user, JSON.stringify(products));
  localStorage.setItem('sales_' + user, JSON.stringify(sales));
}

// ---------- 2. Languages: every word on the screen comes from this list [English, Hindi, Kannada] ----------
const words = {
  dashboard: ['Dashboard', 'डैशबोर्ड', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'], products: ['Products', 'उत्पाद', 'ಉತ್ಪನ್ನಗಳು'], billing: ['Billing', 'बिलिंग', 'ಬಿಲ್ಲಿಂಗ್'],
  orders: ['Supplier Orders', 'सप्लायर ऑर्डर', 'ಪೂರೈಕೆದಾರ ಆರ್ಡರ್'], reports: ['Reports', 'रिपोर्ट', 'ವರದಿ'],
  totalProducts: ['Total products', 'कुल उत्पाद', 'ಒಟ್ಟು ಉತ್ಪನ್ನಗಳು'], todaySales: ["Today's sales", 'आज की बिक्री', 'ಇಂದಿನ ಮಾರಾಟ'],
  lowCount: ['Low stock items', 'कम स्टॉक वाले सामान', 'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಸಾಮಗ್ರಿಗಳು'], stockValue: ['Stock value', 'स्टॉक मूल्य', 'ಸ್ಟಾಕ್ ಮೌಲ್ಯ'],
  lowAlert: ['Low stock alert', 'कम स्टॉक चेतावनी', 'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ'], product: ['Product', 'उत्पाद', 'ಉತ್ಪನ್ನ'],
  price: ['Price', 'कीमत', 'ಬೆಲೆ'], quantity: ['Quantity', 'मात्रा', 'ಪ್ರಮಾಣ'], minStock: ['Minimum stock', 'न्यूनतम स्टॉक', 'ಕನಿಷ್ಠ ಸ್ಟಾಕ್'],
  name: ['Product name', 'उत्पाद का नाम', 'ಉತ್ಪನ್ನದ ಹೆಸರು'], status: ['Status', 'स्थिति', 'ಸ್ಥಿತಿ'], ok: ['OK', 'ठीक', 'ಸರಿ'], low: ['Low', 'कम', 'ಕಡಿಮೆ'],
  save: ['Save', 'सहेजें', 'ಉಳಿಸಿ'], edit: ['Edit', 'बदलें', 'ತಿದ್ದಿ'], delete: ['Delete', 'हटाएं', 'ಅಳಿಸಿ'],
  confirmDelete: ['Delete this product?', 'इस उत्पाद को हटाएं?', 'ಈ ಉತ್ಪನ್ನವನ್ನು ಅಳಿಸಬೇಕೆ?'],
  shareCatalog: ['Share catalog on WhatsApp', 'कैटलॉग WhatsApp पर भेजें', 'ಕ್ಯಾಟಲಾಗ್ WhatsApp ನಲ್ಲಿ ಹಂಚಿ'],
  addToBill: ['Add to bill', 'बिल में जोड़ें', 'ಬಿಲ್‌ಗೆ ಸೇರಿಸಿ'], currentBill: ['Current bill', 'वर्तमान बिल', 'ಪ್ರಸ್ತುತ ಬಿಲ್'],
  amount: ['Amount', 'राशि', 'ಮೊತ್ತ'], total: ['Total', 'कुल', 'ಒಟ್ಟು'], completeSale: ['Complete sale', 'बिक्री पूरी करें', 'ಮಾರಾಟ ಪೂರ್ಣಗೊಳಿಸಿ'],
  saleDone: ['Sale saved. Stock updated.', 'बिक्री सहेजी गई। स्टॉक अपडेट हुआ।', 'ಮಾರಾಟ ಉಳಿಸಲಾಗಿದೆ. ಸ್ಟಾಕ್ ನವೀಕರಿಸಲಾಗಿದೆ.'],
  noStock: ['Not enough stock', 'पर्याप्त स्टॉक नहीं', 'ಸಾಕಷ್ಟು ಸ್ಟಾಕ್ ಇಲ್ಲ'],
  phone: ['Supplier WhatsApp number (with country code)', 'सप्लायर का WhatsApp नंबर (देश कोड सहित)', 'ಪೂರೈಕೆದಾರರ WhatsApp ಸಂಖ್ಯೆ (ದೇಶದ ಕೋಡ್ ಸಹಿತ)'],
  sendOrder: ['Send order on WhatsApp', 'WhatsApp पर ऑर्डर भेजें', 'WhatsApp ನಲ್ಲಿ ಆರ್ಡರ್ ಕಳುಹಿಸಿ'], orderQty: ['Order quantity', 'ऑर्डर मात्रा', 'ಆರ್ಡರ್ ಪ್ರಮಾಣ'],
  nothing: ['Nothing to order', 'ऑर्डर करने के लिए कुछ नहीं', 'ಆರ್ಡರ್ ಮಾಡಲು ಏನೂ ಇಲ್ಲ'], date: ['Date', 'तारीख', 'ದಿನಾಂಕ'],
  totalSales: ['Total sales', 'कुल बिक्री', 'ಒಟ್ಟು ಮಾರಾಟ'], best: ['Best selling product', 'सबसे ज़्यादा बिकने वाला उत्पाद', 'ಅತಿ ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಉತ್ಪನ್ನ'],
  allGood: ['All products are well stocked', 'सभी उत्पाद पर्याप्त स्टॉक में हैं', 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು ಸಾಕಷ್ಟು ಸ್ಟಾಕ್‌ನಲ್ಲಿವೆ'],
  signIn: ['Sign in', 'साइन इन करें', 'ಸೈನ್ ಇನ್ ಮಾಡಿ'], createAccount: ['Create account', 'खाता बनाएं', 'ಖಾತೆ ರಚಿಸಿ'], logout: ['Log out', 'लॉग आउट', 'ಲಾಗ್ ಔಟ್'],
  email: ['Email', 'ईमेल', 'ಇಮೇಲ್'], password: ['Password', 'पासवर्ड', 'ಪಾಸ್‌ವರ್ಡ್'], shopName: ['Shop name', 'दुकान का नाम', 'ಅಂಗಡಿಯ ಹೆಸರು'],
  noAccount: ['New to StockEasy? Create an account', 'StockEasy में नए हैं? खाता बनाएं', 'StockEasy ಗೆ ಹೊಸಬರೇ? ಖಾತೆ ರಚಿಸಿ'],
  haveAccount: ['Already have an account? Sign in', 'पहले से खाता है? साइन इन करें', 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ'],
  wrongLogin: ['Wrong email or password', 'ईमेल या पासवर्ड गलत है', 'ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ'],
  emailUsed: ['This email is already registered', 'यह ईमेल पहले से पंजीकृत है', 'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ'],
  shortPass: ['Password must be at least 6 characters', 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए', 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು'],
  tagline: ['Know what is on your shelf. Reorder before it runs out.', 'जानिए आपके शेल्फ पर क्या है। खत्म होने से पहले दोबारा ऑर्डर करें।', 'ನಿಮ್ಮ ಶೆಲ್ಫ್‌ನಲ್ಲಿ ಏನಿದೆ ಎಂದು ತಿಳಿಯಿರಿ. ಖಾಲಿಯಾಗುವ ಮೊದಲು ಮರು ಆರ್ಡರ್ ಮಾಡಿ.'],
  point1: ['Stock updates itself with every bill', 'हर बिल के साथ स्टॉक अपने आप अपडेट होता है', 'ಪ್ರತಿ ಬಿಲ್‌ನೊಂದಿಗೆ ಸ್ಟಾಕ್ ತಾನಾಗಿ ನವೀಕರಿಸುತ್ತದೆ'],
  point2: ['Low-stock alerts before items run out', 'सामान खत्म होने से पहले कम स्टॉक चेतावनी', 'ಸಾಮಗ್ರಿ ಖಾಲಿಯಾಗುವ ಮೊದಲು ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ'],
  point3: ['Reorder from suppliers on WhatsApp', 'WhatsApp पर सप्लायर से दोबारा ऑर्डर करें', 'WhatsApp ನಲ್ಲಿ ಪೂರೈಕೆದಾರರಿಗೆ ಮರು ಆರ್ಡರ್ ಮಾಡಿ'],
  welcome: ['Welcome', 'स्वागत है', 'ಸ್ವಾಗತ'],
  online: ['Online', 'ऑनलाइन', 'ಆನ್‌ಲೈನ್'], offline: ['Offline: data is saved on this device', 'ऑफ़लाइन: डेटा इस डिवाइस पर सहेजा गया है', 'ಆಫ್‌ಲೈನ್: ಡೇಟಾವನ್ನು ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ'],
  footer: ['Real-Time Inventory & Order Management for Small Businesses', 'छोटे व्यवसायों के लिए रियल-टाइम स्टॉक और ऑर्डर प्रबंधन', 'ಸಣ್ಣ ವ್ಯಾಪಾರಗಳಿಗಾಗಿ ರಿಯಲ್-ಟೈಮ್ ಸ್ಟಾಕ್ ಮತ್ತು ಆರ್ಡರ್ ನಿರ್ವಹಣೆ']
};
const t = key => words[key][['en', 'hi', 'kn'].indexOf(lang)];

// Product names in [Hindi, Kannada]. A name that is not in this list is shown exactly as it was typed.
const names = {
  'Rice 1kg': ['चावल 1 किग्रा', 'ಅಕ್ಕಿ 1 ಕೆಜಿ'], 'Sugar 1kg': ['चीनी 1 किग्रा', 'ಸಕ್ಕರೆ 1 ಕೆಜಿ'], 'Milk 500ml': ['दूध 500 मिली', 'ಹಾಲು 500 ಮಿಲಿ'],
  'Biscuits': ['बिस्कुट', 'ಬಿಸ್ಕತ್'], 'Tea Powder': ['चाय पाउडर', 'ಚಹಾ ಪುಡಿ'], 'Soap': ['साबुन', 'ಸಾಬೂನು'],
  'Salt': ['नमक', 'ಉಪ್ಪು'], 'Cooking Oil': ['खाने का तेल', 'ಅಡುಗೆ ಎಣ್ಣೆ'], 'Wheat Flour': ['गेहूं का आटा', 'ಗೋಧಿ ಹಿಟ್ಟು']
};
const pname = name => (names[name] && names[name][['hi', 'kn'].indexOf(lang)]) || name;

function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));      // all labels
  document.querySelectorAll('[data-p]').forEach(e => e.placeholder = t(e.dataset.p));      // all input hints
  document.querySelectorAll('.lang').forEach(s => s.value = lang);
  showNet();
  if (products) refresh();
}

// ---------- 3. Pages ----------
function showPage(name) {
  page = name;
  document.querySelectorAll('main section').forEach(s => s.style.display = s.id === name ? 'block' : 'none');
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.page === name));
  refresh();
}
function showHero() {           // page title, today's date and the dashboard banner
  const date = new Date().toLocaleDateString({ en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' }[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('pageTitle').textContent = t(page);
  $('today').textContent = date;
  $('pageHead').hidden = page === 'dashboard';        // the dashboard has its own banner instead
  $('welcome').textContent = t('welcome') + ', ' + $('shopName').textContent;
  $('bannerDate').textContent = date;
}
function refresh() {            // draw the tables again from the latest data
  showHero(); showDashboard(); showProducts(); showBillingList(); showOrders(); showReports();
}
function say(text) { $('msg').textContent = text; setTimeout(() => $('msg').textContent = '', 2500); }

// ---------- 4. Dashboard ----------
function showDashboard() {
  const low = products.filter(p => p.qty <= p.min);                                 // low-stock alert rule
  const today = sales.filter(s => s.date === day(0)).reduce((sum, s) => sum + s.total, 0);
  $('cTotal').textContent = products.length;
  $('cSales').textContent = '₹' + today;
  $('cLow').textContent = low.length;
  $('cLow').className = low.length ? 'low' : '';
  $('cValue').textContent = '₹' + products.reduce((sum, p) => sum + p.qty * p.price, 0);
  $('lowTable').innerHTML = low.map(p => `<tr><td>${pname(p.name)}</td><td class="low">${p.qty}</td><td>${p.min}</td></tr>`).join('') || `<tr><td colspan="3">${t('allGood')}</td></tr>`;
}

// ---------- 5. Products: add, view, edit, delete ----------
function showProducts() {
  $('productTable').innerHTML = products.map(p => `<tr>
    <td>${pname(p.name)}</td><td>₹${p.price}</td><td>${p.qty}</td>
    <td><span class="badge ${p.qty <= p.min ? 'low' : ''}">${p.qty <= p.min ? t('low') : t('ok')}</span></td>
    <td><button onclick="editProduct(${p.id})">${t('edit')}</button> <button class="del" onclick="deleteProduct(${p.id})">${t('delete')}</button></td></tr>`).join('');
}
function saveProduct(e) {
  e.preventDefault();
  const data = { name: $('pName').value, price: +$('pPrice').value, qty: +$('pQty').value, min: +$('pMin').value };
  if (editId) Object.assign(products.find(p => p.id === editId), data);              // update
  else products.push({ id: Date.now(), ...data });                                   // create
  editId = null;
  e.target.reset();
  save(); refresh();
}
function editProduct(id) {
  const p = products.find(p => p.id === id);
  $('pName').value = p.name; $('pPrice').value = p.price; $('pQty').value = p.qty; $('pMin').value = p.min;
  editId = id;
}
function deleteProduct(id) {
  if (confirm(t('confirmDelete'))) { products = products.filter(p => p.id !== id); save(); refresh(); }
}
function shareCatalog() {
  const list = products.filter(p => p.qty > 0).map(p => p.name + ': ₹' + p.price).join('\n');
  window.open('https://wa.me/?text=' + encodeURIComponent(list), '_blank');
}

// ---------- 6. Billing: stock reduces automatically ----------
function showBillingList() {
  $('billProduct').innerHTML = products.filter(p => p.qty > 0).map(p => `<option value="${p.id}">${pname(p.name)} (₹${p.price})</option>`).join('');
  showBill();
}
function addToBill() {
  const p = products.find(p => p.id == $('billProduct').value);
  if (!p) return;
  const qty = +$('billQty').value;
  const already = bill.filter(b => b.id === p.id).reduce((sum, b) => sum + b.qty, 0);
  if (already + qty > p.qty) return say(t('noStock'));
  bill.push({ id: p.id, name: p.name, qty, price: p.price });
  showBill();
}
function showBill() {
  $('billTable').innerHTML = bill.map(b => `<tr><td>${pname(b.name)}</td><td>${b.qty}</td><td>₹${b.qty * b.price}</td></tr>`).join('');
  $('billTotal').textContent = '₹' + bill.reduce((sum, b) => sum + b.qty * b.price, 0);
}
function completeSale() {
  if (!bill.length) return;
  bill.forEach(b => products.find(p => p.id === b.id).qty -= b.qty);                 // reduce stock
  sales.push({ date: day(0), items: bill, total: bill.reduce((sum, b) => sum + b.qty * b.price, 0) });
  bill = [];
  save(); refresh();
  say(t('saleDone'));
}

// ---------- 7. Supplier orders ----------
function showOrders() {
  const low = products.filter(p => p.qty <= p.min);
  $('orderTable').innerHTML = low.map(p => `<tr><td>${pname(p.name)}</td><td>${p.qty}</td>
    <td><input type="number" min="0" id="order${p.id}" value="${p.min * 3 - p.qty}"></td></tr>`).join('')
    || `<tr><td colspan="3">${t('nothing')}</td></tr>`;
}
function sendOrder() {
  const text = products.filter(p => p.qty <= p.min)
    .map(p => p.name + ' x ' + $('order' + p.id).value).join('\n');
  window.open('https://wa.me/' + $('phone').value.replace(/\D/g, '') + '?text=' + encodeURIComponent('Order:\n' + text), '_blank');
}

// ---------- 8. Reports ----------
function showReports() {
  const perDay = {}, sold = {};
  sales.forEach(s => {
    perDay[s.date] = (perDay[s.date] || 0) + s.total;
    s.items.forEach(i => sold[i.name] = (sold[i.name] || 0) + i.qty);
  });
  const best = Object.keys(sold).sort((a, b) => sold[b] - sold[a])[0];
  $('rTotal').textContent = '₹' + sales.reduce((sum, s) => sum + s.total, 0);
  $('rBest').textContent = pname(best) || '-';
  $('reportTable').innerHTML = Object.keys(perDay).sort().reverse().map(d => `<tr><td>${d}</td><td>₹${perDay[d]}</td></tr>`).join('');
}

// ---------- 9. Real-time sync and online/offline ----------
window.addEventListener('storage', () => { if (user) { load(); refresh(); } });          // another tab saved data -> update this one
function showNet() { $('net').textContent = navigator.onLine ? t('online') : t('offline'); }
window.addEventListener('online', showNet);
window.addEventListener('offline', showNet);

// ---------- 10. Sign up, sign in, log out ----------
// Note: this keeps accounts in the browser to show how login works. A real system checks passwords on a server.
const users = () => JSON.parse(localStorage.getItem('users')) || [];

async function hash(text) {                       // passwords are never stored as plain text
  if (!window.crypto || !crypto.subtle) return btoa(unescape(encodeURIComponent(text)));    // fallback for old browsers
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function showForm(which) {
  $('loginForm').hidden = which !== 'login';
  $('signupForm').hidden = which !== 'signup';
  $('authMsg').textContent = '';
}
async function signup(e) {
  e.preventDefault();
  const email = $('sEmail').value.trim().toLowerCase(), shop = $('sShop').value.trim(), pass = $('sPass').value;
  if (pass.length < 6) return $('authMsg').textContent = t('shortPass');
  if (users().some(u => u.email === email)) return $('authMsg').textContent = t('emailUsed');
  localStorage.setItem('users', JSON.stringify([...users(), { email, shop, pass: await hash(pass) }]));
  enter(email);
}
async function login(e) {
  e.preventDefault();
  const email = $('lEmail').value.trim().toLowerCase(), u = users().find(u => u.email === email);
  if (!u || u.pass !== await hash($('lPass').value)) return $('authMsg').textContent = t('wrongLogin');
  enter(email);
}
function enter(email) {
  user = email;
  localStorage.setItem('session', email);          // remember who is logged in
  startApp();
}
function logout() {
  user = null;
  localStorage.removeItem('session');
  startApp();
}
function startApp() {                              // show either the login page or the shop software
  const me = users().find(u => u.email === user);
  if (!me) user = null;
  $('auth').hidden = !!user;
  $('app').hidden = !user;
  if (!user) { document.querySelectorAll('form').forEach(f => f.reset()); showForm('login'); return; }
  load();
  bill = [];
  $('shopName').textContent = me.shop;
  showPage('dashboard');
}

setLang(lang);
(async () => {
  if (!users().length) localStorage.setItem('users', JSON.stringify([{ email: 'demo@stockeasy.com', shop: 'Sri Lakshmi Stores', pass: await hash('demo123') }]));
  startApp();
})();