/* Asim Jofa — site behaviour */

(function () {
  "use strict";

  const money = (n) => "PKR " + n.toLocaleString("en-PK");
  const BAG_KEY = "aj-bag-v1";

  /* ————— header ————— */

  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ————— mobile nav ————— */

  const mobileNav = document.querySelector(".mobile-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".mobile-close");

  const setMenu = (open) => {
    if (!mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuToggle && menuToggle.addEventListener("click", () => setMenu(true));
  menuClose && menuClose.addEventListener("click", () => setMenu(false));
  mobileNav && mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ————— reveal on scroll ————— */

  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ————— bag ————— */

  const readBag = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(BAG_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  };

  const writeBag = (items) => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(items));
    } catch (e) {
      /* storage unavailable — keep in-memory only */
    }
  };

  let bag = readBag();

  const drawBagPanel = () => {
    const panel = document.createElement("aside");
    panel.className = "bag-panel";
    panel.id = "bagPanel";
    panel.setAttribute("aria-label", "Shopping bag");
    panel.innerHTML = `
      <div class="bag-head">
        <h2>Your bag <span class="muted" data-bag-title-count></span></h2>
        <button class="icon-close" type="button" data-bag-close aria-label="Close bag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="bag-items" data-bag-items></div>
      <div class="bag-foot">
        <div class="bag-subtotal"><span>Subtotal</span><strong data-bag-subtotal>PKR 0</strong></div>
        <button class="btn btn--solid" type="button" data-bag-checkout>Proceed to checkout</button>
        <p class="bag-note">Complimentary delivery within Pakistan · Duties included</p>
      </div>`;
    document.body.appendChild(panel);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "bagOverlay";
    document.body.appendChild(overlay);

    return panel;
  };

  const panel = drawBagPanel();
  const overlay = document.getElementById("bagOverlay");

  const openBag = () => {
    renderBag();
    panel.classList.add("is-open");
    overlay.classList.add("is-on");
    document.body.style.overflow = "hidden";
  };

  const closeBag = () => {
    panel.classList.remove("is-open");
    overlay.classList.remove("is-on");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-bag-open]").forEach((btn) => btn.addEventListener("click", openBag));
  overlay.addEventListener("click", closeBag);
  panel.querySelector("[data-bag-close]").addEventListener("click", closeBag);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBag();
      setMenu(false);
    }
  });

  const countEls = document.querySelectorAll("[data-bag-count]");

  const updateCount = () => {
    const total = bag.reduce((sum, item) => sum + item.qty, 0);
    countEls.forEach((el) => {
      el.textContent = total;
      el.classList.toggle("is-on", total > 0);
    });
  };

  const subtotal = () => bag.reduce((sum, item) => sum + item.price * item.qty, 0);

  function renderBag() {
    const wrap = panel.querySelector("[data-bag-items]");
    const titleCount = panel.querySelector("[data-bag-title-count]");

    titleCount.textContent = bag.length ? "(" + bag.reduce((s, i) => s + i.qty, 0) + ")" : "";

    if (!bag.length) {
      wrap.innerHTML = `<p class="bag-empty">Your bag is empty.<br><a class="link-arrow" href="index.html#collections" style="margin-top:26px">Discover the collections</a></p>`;
    } else {
      wrap.innerHTML = bag
        .map(
          (item, i) => `
        <article class="bag-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <p class="price">${money(item.price)}</p>
            <div class="qty">
              <button type="button" data-qty="-1" data-index="${i}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button type="button" data-qty="1" data-index="${i}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button type="button" class="bag-remove" data-remove="${i}">Remove</button>
        </article>`
        )
        .join("");
    }

    panel.querySelector("[data-bag-subtotal]").textContent = money(subtotal());

    wrap.querySelectorAll("[data-qty]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        const delta = Number(btn.dataset.qty);
        bag[i].qty = Math.max(1, bag[i].qty + delta);
        save();
      })
    );

    wrap.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        bag.splice(Number(btn.dataset.remove), 1);
        save();
      })
    );
  }

  const save = () => {
    writeBag(bag);
    updateCount();
    renderBag();
  };

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let toastTimer;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
  };

  document.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const { add, name, price, image } = btn.dataset;
      const existing = bag.find((item) => item.id === add);
      if (existing) existing.qty += 1;
      else bag.push({ id: add, name, price: Number(price), image, qty: 1 });
      save();
      showToast(name + " — added to your bag");
    })
  );

  panel.querySelector("[data-bag-checkout]").addEventListener("click", () => {
    if (!bag.length) {
      showToast("Your bag is empty");
      return;
    }
    showToast("Checkout is handled at our boutiques — see Boutiques");
  });

  updateCount();

  /* ————— filters ————— */

  const filterBtns = document.querySelectorAll("[data-filter]");
  const products = [...document.querySelectorAll(".product[data-cat]")];
  const emptyState = document.querySelector(".empty-state");

  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });

      let visible = 0;
      products.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });

      if (emptyState) emptyState.classList.toggle("is-on", visible === 0);
    })
  );

  /* ————— newsletter ————— */

  document.querySelectorAll("[data-newsletter]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      const note = form.parentElement.querySelector(".form-note") || form.querySelector(".form-note");
      const value = (input.value || "").trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        note.textContent = "Please enter a valid email address.";
        note.className = "form-note is-error";
        input.focus();
        return;
      }

      note.textContent = "Thank you — welcome to the House. Check your inbox.";
      note.className = "form-note is-success";
      form.reset();
    })
  );

  /* ————— appointment form ————— */

  const appointment = document.querySelector("[data-appointment]");

  appointment &&
    appointment.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = appointment.querySelector(".form-note");
      const name = appointment.querySelector("[name=name]").value.trim();
      const email = appointment.querySelector("[name=email]").value.trim();
      const boutique = appointment.querySelector("[name=boutique]").value;

      if (!name) {
        note.textContent = "Please tell us your name.";
        note.className = "form-note is-error";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = "Please enter a valid email address.";
        note.className = "form-note is-error";
        return;
      }

      note.textContent = "Thank you, " + name + ". Our " + boutique + " boutique will confirm your appointment within 24 hours.";
      note.className = "form-note is-success";
      appointment.reset();
    });

  /* ————— year ————— */

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
