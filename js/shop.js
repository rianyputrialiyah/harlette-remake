(function () {
  // =========================
  // 1. DATA PRODUK
  // =========================
  var products = {
    "Facial Wash": {
      name: "Facial Wash",
      price: 117500
    },
    "Chill Oat Serum": {
      name: "Chill Oat Serum",
      price: 142000
    },
    "Day Cream": {
      name: "Oatmilk Day Cream",
      price: 81000
    },
    "Sunscreen": {
      name: "Sunscreen",
      price: 153000
    },
    "Sleeping Mask": {
      name: "Sleeping Mask",
      price: 151200
    }
  };

  var cart = {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function rupiah(number) {
    return "Rp " + number.toLocaleString("id-ID");
  }

  // =========================
  // 2. BUKA DAN TUTUP KERANJANG

  var cartPanel = $("#cart");
  var overlay = $("#overlay");
  var cartOpen = $("#cartOpen");
  var cartClose = $("#cartClose");

  function openCart() {
    cartPanel.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    cartPanel.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("cart-open");
  }

  if (cartOpen) {
    cartOpen.addEventListener("click", openCart);
  }

  if (cartClose) {
    cartClose.addEventListener("click", closeCart);
  }

  if (overlay) {
    overlay.addEventListener("click", closeCart);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeCart();
  });

  // =========================
  // 3. TAMPILKAN ISI KERANJANG
  // =========================
  var cartList = $("#cartList");
  var cartCount = $("#cartCount");
  var checkout = $("#checkout");

  function renderCart() {
    cartList.innerHTML = "";

    var totalItems = 0;
    var totalPrice = 0;

    Object.keys(cart).forEach(function (key) {
      var item = cart[key];

      totalItems += item.qty;
      totalPrice += item.price * item.qty;

      var row = document.createElement("div");
      row.className = "cart-item";

      var name = document.createElement("p");
      name.textContent = item.name;

      var price = document.createElement("p");
      price.textContent = rupiah(item.price * item.qty);

      var controls = document.createElement("div");
      controls.className = "cart-item-controls";

      var minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";

      minus.addEventListener("click", function () {
        item.qty--;

        if (item.qty <= 0) {
          delete cart[key];
        }

        renderCart();
      });

      var quantity = document.createElement("span");
      quantity.textContent = item.qty;

      var plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";

      plus.addEventListener("click", function () {
        item.qty++;
        renderCart();
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";

      remove.addEventListener("click", function () {
        delete cart[key];
        renderCart();
      });

      controls.append(minus, quantity, plus, remove);
      row.append(name, price, controls);
      cartList.appendChild(row);
    });

    if (totalItems === 0) {
      var empty = document.createElement("p");
      empty.textContent = "Your cart is still empty.";
      cartList.appendChild(empty);
    }

    cartCount.textContent = totalItems;

    var total = document.createElement("p");
    total.className = "cart-total";
    total.textContent = "Total: " + rupiah(totalPrice);
    cartList.appendChild(total);

    // Siapkan pesan pesanan
    var message = "Hello Harlette! I want to order:\n\n";

    Object.keys(cart).forEach(function (key) {
      var item = cart[key];

      message += item.name +
        " x " + item.qty +
        " = " + rupiah(item.price * item.qty) + "\n";
    });

    message += "\nTotal: " + rupiah(totalPrice);

    // GANTI NOMOR DI BAWAH DENGAN NOMOR WHATSAPP TOKO
    var phone = "628XXXXXXXXXX";

    checkout.href =
      "https://wa.me/" + phone +
      "?text=" + encodeURIComponent(message);
  }

  // =========================
  // 4. TAMBAH PRODUK KE KERANJANG
  // =========================
  document.querySelectorAll(".add").forEach(function (button) {
    button.addEventListener("click", function () {
      var key = button.dataset.name;
      var product = products[key];

      if (!product) {
        alert("Produk tidak ditemukan.");
        return;
      }

      if (cart[key]) {
        cart[key].qty++;
      } else {
        cart[key] = {
          name: product.name,
          price: product.price,
          qty: 1
        };
      }

      renderCart();
      openCart();
    });
  });

  // =========================
  // 5. PESAN VIA WHATSAPP
  // =========================
  if (checkout) {
    checkout.addEventListener("click", function (event) {
      if (Object.keys(cart).length === 0) {
        event.preventDefault();
        alert("Keranjang kamu masih kosong!");
        return;
      }

      if (checkout.href.includes("628XXXXXXXXXX")) {
        event.preventDefault();
        alert("Masukkan nomor WhatsApp toko terlebih dahulu.");
      }
    });
  }

  renderCart();

  // =========================
  // 6. FAQ BISA DIKLIK
  // =========================
  var tabs = document.querySelectorAll("#faqTabs .tab");
  var panels = document.querySelectorAll(".tab-box");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var targetId = tab.dataset.tab;
      var target = document.getElementById(targetId);

      if (!target) return;

      tabs.forEach(function (item) {
        item.classList.remove("on");
        item.setAttribute("aria-selected", "false");
      });

      panels.forEach(function (panel) {
        panel.classList.remove("on");
        panel.hidden = true;
      });

      tab.classList.add("on");
      tab.setAttribute("aria-selected", "true");

      target.classList.add("on");
      target.hidden = false;
    });
  });

  // Tampilkan jawaban FAQ pertama
  panels.forEach(function (panel) {
    panel.hidden = !panel.classList.contains("on");
  });

  tabs.forEach(function (tab) {
    tab.setAttribute(
      "aria-selected",
      tab.classList.contains("on") ? "true" : "false"
    );
  });

  // =========================
  // 7. FORM CONTACT VIA WHATSAPP
  // =========================
  var contactForm = $("#contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = $("#nama").value.trim();
      var message = $("#pesan").value.trim();

      if (!name || !message) {
        alert("Please fill in your name and message.");
        return;
      }

      // Gunakan nomor WhatsApp yang sama
      var phone = "628XXXXXXXXXX";

      if (phone.includes("X")) {
        alert("Masukkan nomor WhatsApp toko terlebih dahulu.");
        return;
      }

      var text =
        "Hello Harlette!\n" +
        "My name: " + name + "\n" +
        "Message: " + message;

       window.open(
        "https://wa.me/" + phone +
        "?text=" + encodeURIComponent(text),
        "_blank"
      );
    });
  }
})();