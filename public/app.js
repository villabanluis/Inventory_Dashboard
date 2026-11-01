const form = document.getElementById('productForm');
const tableBody = document.getElementById('tableBody');
const message = document.getElementById('message');
const cancelBtn = document.getElementById('cancelBtn');
const searchBox = document.getElementById('search');

let products = [];

function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
  setTimeout(() => (message.textContent = ''), 3000);
}

// ---------- READ ----------
async function loadProducts() {
  const res = await fetch('/api/products');
  products = await res.json();
  renderTable();
}

function renderTable() {
  const keyword = searchBox.value.toLowerCase();
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)
  );

  tableBody.innerHTML = '';
  if (filtered.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
    return;
  }

  filtered.forEach((p) => {
    const tr = document.createElement('tr');
    const cells = [p.id, p.name, p.category, '₱' + p.price.toFixed(2), p.quantity];
    cells.forEach((value, index) => {
      const td = document.createElement('td');
      td.textContent = value; // textContent keeps user input safe from HTML injection
      if (index === 4 && p.quantity <= 10) td.className = 'low';
      tr.appendChild(td);
    });

    const actions = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit';
    editBtn.onclick = () => startEdit(p);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'danger';
    delBtn.onclick = () => deleteProduct(p.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    tr.appendChild(actions);
    tableBody.appendChild(tr);
  });
}

async function loadStats() {
  const res = await fetch('/api/stats');
  const s = await res.json();

  document.getElementById('statTotal').textContent = s.totalProducts;
  document.getElementById('statValue').textContent =
    '₱' + s.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('statLow').textContent = s.lowStock;

  const chart = document.getElementById('chart');
  chart.innerHTML = '';
  const max = Math.max(1, ...s.byCategory.map((c) => c.count));
  s.byCategory.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = c.category;

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = (c.count / max) * 300 + 'px';

    const num = document.createElement('span');
    num.textContent = c.count;

    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(num);
    chart.appendChild(row);
  });
}

// ---------- CREATE and UPDATE ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('productId').value;
  const data = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    price: document.getElementById('price').value,
    quantity: document.getElementById('quantity').value,
  };

  const url = id ? '/api/products/' + id : '/api/products';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();

  if (!res.ok) {
    showMessage(result.error, 'error');
    return;
  }

  showMessage(id ? 'Product updated!' : 'Product added!', 'ok');
  resetForm();
  refresh();
});

function startEdit(p) {
  document.getElementById('productId').value = p.id;
  document.getElementById('name').value = p.name;
  document.getElementById('category').value = p.category;
  document.getElementById('price').value = p.price;
  document.getElementById('quantity').value = p.quantity;
  document.getElementById('formTitle').textContent = 'Edit Product #' + p.id;
  document.getElementById('saveBtn').textContent = 'Update';
  cancelBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  form.reset();
  document.getElementById('productId').value = '';
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('saveBtn').textContent = 'Add';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// ---------- DELETE ----------
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetch('/api/products/' + id, { method: 'DELETE' });
  showMessage('Product deleted.', 'ok');
  refresh();
}

searchBox.addEventListener('input', renderTable);

function refresh() {
  loadProducts();
  loadStats();
}

refresh();
