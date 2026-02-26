
let createBtn = document.getElementById("createBtn");
let overlay = document.getElementById("overlay");
let formClose = document.getElementById("formClose");
let productForm = document.getElementById("productForm");
let cancelBtn = document.getElementById("cancelBtn");

let cardsContainer = document.getElementById("cardsContainer");
let noProducts = document.getElementById("noProducts");
let totalCount = document.getElementById("totalCount");

let searchInput = document.getElementById("search");
let filterSelect = document.getElementById("filter");


let productId = document.getElementById("productId");
let nameInput = document.getElementById("name");
let categoryInput = document.getElementById("category");
let quantityInput = document.getElementById("quantity");


let nameHelp = document.getElementById("nameHelp");
let catHelp = document.getElementById("catHelp");
let qtyHelp = document.getElementById("qtyHelp");


let confirmOverlay = document.getElementById("confirmOverlay");
let confirmCancel = document.getElementById("confirmCancel");
let confirmOk = document.getElementById("confirmOk");


let toastContainer = document.getElementById("toastContainer");


let products = JSON.parse(localStorage.getItem("products")) || [];
let deletingId = null;


// Name validation – only alphabets
nameInput.addEventListener("input", function () {
  if (!/^[A-Za-z ]*$/.test(nameInput.value)) {
    nameHelp.textContent = "Only alphabets are allowed.";
  } else {
    nameHelp.textContent = "";
  }
});

// Category validation – must select
categoryInput.addEventListener("change", function () {
  if (categoryInput.value === "") {
    catHelp.textContent = "Please select a category.";
  } else {
    catHelp.textContent = "";
  }
});

// Quantity validation – only numbers
quantityInput.addEventListener("input", function () {
  if (!/^[0-9]*$/.test(quantityInput.value)) {
    qtyHelp.textContent = "Only Numbers allowed.";
  } else {
    qtyHelp.textContent = "";
  }
});

// Render all products

function renderProducts() {
  cardsContainer.innerHTML = "";
  totalCount.textContent = products.length;

  // Search + Filter
  let search = searchInput.value.toLowerCase();
  let filter = filterSelect.value;

  let filtered = products.filter((p) => {
    let match = p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    if (!match) return false;
    if (filter === "in") return p.quantity > 0;
    if (filter === "out") return p.quantity == 0;
    return true;
  });

  // Show message if none
  if (filtered.length === 0) {
    noProducts.style.display = "block";
    return;
  } else {
    noProducts.style.display = "none";
  }

  // Create product cards using DOM
  filtered.forEach((p) => {
    let card = document.createElement("div");
    card.className = "card";

    let title = document.createElement("div");
    title.className = "title";
    title.textContent = p.name;

    let category = document.createElement("div");
    category.className = "meta";
    category.textContent = p.category;

    let qtyDiv = document.createElement("div");
    qtyDiv.className = "qty";
    qtyDiv.innerHTML = `<strong>Quantity:</strong> ${p.quantity}`;

    let status = document.createElement("span");
    status.className = "badge";
    if (p.quantity > 0) {
      status.classList.add("in");
      status.textContent = "In Stock";
    } else {
      status.classList.add("out");
      status.textContent = "Out of Stock";
    }
    qtyDiv.appendChild(status);

    // Actions
    let actions = document.createElement("div");
    actions.className = "actions";

    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn";
    editBtn.onclick = () => openEditForm(p.id);

    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn danger";
    delBtn.onclick = () => openDeleteConfirm(p.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(qtyDiv);
    card.appendChild(actions);

    cardsContainer.appendChild(card);
  });
}

// Add or Update Product
productForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // clear inline messages
  nameHelp.textContent = "";
  catHelp.textContent = "";
  qtyHelp.textContent = "";

  let name = nameInput.value.trim();
  let category = categoryInput.value;
  let quantity = quantityInput.value.trim();
  let isValid = true;

  // Validation checks
  if (name === "") {
    nameHelp.textContent = "Product name is required.";
    isValid = false;
  } else if (!/^[A-Za-z ]+$/.test(name)) {
    nameHelp.textContent = "Only alphabets are allowed.";
    isValid = false;
  }

  if (category === "") {
    catHelp.textContent = "Please select a category.";
    isValid = false;
  }

  if (quantity === "") {
    qtyHelp.textContent = "Quantity is required.";
    isValid = false;
  } else if (!/^[0-9]+$/.test(quantity)) {
    qtyHelp.textContent = "Only numbers allowed.";
    isValid = false;
  }

  if (!isValid) return;

  quantity = Number(quantity);

  if (productId.value) {
    // Edit Mode
    let id = productId.value;
    let index = products.findIndex((p) => p.id === id);
    products[index] = { id, name, category, quantity };
    showToast("Product updated successfully!");
  } else {
    // Create Mode
    let newProduct = {
      id: Date.now().toString(),
      name,
      category,
      quantity,
    };
    products.push(newProduct);
    showToast("Product added successfully!");
  }

  // Save & Close
  localStorage.setItem("products", JSON.stringify(products));
  closeForm();
  renderProducts();
});

// Open Form (Add Product)
createBtn.addEventListener("click", function () {
  openCreateForm();
});

function openCreateForm() {
  productId.value = "";
  productForm.reset();
  nameHelp.textContent = "";
  catHelp.textContent = "";
  qtyHelp.textContent = "";
  document.getElementById("modalTitle").textContent = "Create Product";
  overlay.classList.remove("hidden");
  cardsContainer.style.display = "none";
}

// Edit Form
function openEditForm(id) {
  let product = products.find((p) => p.id === id);
  if (!product) return;

  productId.value = product.id;
  nameInput.value = product.name;
  categoryInput.value = product.category;
  quantityInput.value = product.quantity;
  document.getElementById("modalTitle").textContent = "Edit Product";
  overlay.classList.remove("hidden");
  cardsContainer.style.display = "none";
}

// Close Form
formClose.onclick = closeForm;
cancelBtn.onclick = closeForm;

function closeForm() {
  overlay.classList.add("hidden");
  cardsContainer.style.display = "grid";
  productForm.reset();
  nameHelp.textContent = "";
  catHelp.textContent = "";
  qtyHelp.textContent = "";
}

// Delete Product
function openDeleteConfirm(id) {
  deletingId = id;
  confirmOverlay.classList.remove("hidden");
}

confirmCancel.onclick = function () {
  confirmOverlay.classList.add("hidden");
  deletingId = null;
};

confirmOk.onclick = function () {
  products = products.filter((p) => p.id !== deletingId);
  localStorage.setItem("products", JSON.stringify(products));
  confirmOverlay.classList.add("hidden");
  showToast("Product deleted successfully!");
  renderProducts();
};

// Search + Filter
searchInput.addEventListener("input", renderProducts);
filterSelect.addEventListener("change", renderProducts);

// Toast Message
function showToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast show";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.remove();
  }, 3000);
}

renderProducts();
