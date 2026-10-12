(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const fmtNum = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Scroll reveal with sibling stagger ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    let i = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty("--d", `${Math.min(i++ * 70, 350)}ms`);
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      countIO.unobserve(el);
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countIO.observe(el));

  /* ---------- Live agent feed ---------- */
  const icons = {
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
    chat: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
    money: '<path d="M12 3v18M16 7.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5S9.8 10 12 10.5s4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    box: '<path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/>',
    mail: '<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>',
  };
  const events = [
    ["doc", "Factura A-4821 capturada en ERP", "Proveedor validado · CFDI 4.0"],
    ["chat", "Cliente atendido en WhatsApp", "Cotización enviada · 42 s"],
    ["money", "Pago conciliado con banco", "$48,320.00 MXN"],
    ["mail", "Correo clasificado y respondido", "Soporte · prioridad media"],
    ["chart", "Reporte de ventas generado", "Enviado a dirección"],
    ["box", "Orden de compra creada", "Stock bajo en 3 SKUs"],
    ["chat", "Lead calificado y agendado", "Demo mañana 10:00"],
    ["doc", "Contrato revisado por IA", "2 cláusulas marcadas"],
    ["money", "Recordatorio de cobranza", "12 clientes notificados"],
    ["mail", "Pedido confirmado al cliente", "Guía de envío adjunta"],
  ];
  const feed = document.getElementById("feed");
  const tasksEl = document.getElementById("tasks-count");
  const hoursEl = document.getElementById("hours");
  let tasks = 1284;
  let hours = 312.4;
  let idx = 0;

  const makeItem = ([ico, title, sub], time) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="feed-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[ico]}</svg></span>
      <span class="feed-txt"><b></b><small></small></span>
      <span class="feed-time">${time}</span>`;
    li.querySelector("b").textContent = title;
    li.querySelector("small").textContent = sub;
    return li;
  };
  const randTime = () => `${(0.6 + Math.random() * 2.4).toFixed(1)} s`;

  for (let i = 0; i < 5; i++) feed.appendChild(makeItem(events[idx++ % events.length], randTime()));

  const pushEvent = () => {
    const li = makeItem(events[idx++ % events.length], randTime());
    li.classList.add("is-new");
    feed.prepend(li);
    setTimeout(() => li.classList.remove("is-new"), 1400);
    while (feed.children.length > 7) feed.lastElementChild.remove();
    tasks += 1 + Math.floor(Math.random() * 3);
    hours += 0.1 + Math.random() * 0.2;
    tasksEl.textContent = fmtNum.format(tasks);
    hoursEl.textContent = `${hours.toFixed(1)} h`;
  };

  let feedTimer = null;
  const startFeed = () => { if (!feedTimer && !reduceMotion) feedTimer = setInterval(pushEvent, 2200); };
  const stopFeed = () => { clearInterval(feedTimer); feedTimer = null; };
  // Pause when off-screen or tab hidden (invisible edge case handling)
  new IntersectionObserver(([e]) => (e.isIntersecting ? startFeed() : stopFeed())).observe(feed);
  document.addEventListener("visibilitychange", () => (document.hidden ? stopFeed() : startFeed()));

  /* ---------- Compare tabs (clip-path) ---------- */
  const tabs = document.querySelector(".compare-tabs");
  const panels = document.querySelectorAll(".compare-list");
  tabs.dataset.active = "1";
  tabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = btn.dataset.tab;
      tabs.dataset.active = n;
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === n));
    });
  });

  /* ---------- ROI calculator ---------- */
  const people = document.getElementById("people");
  const hoursIn = document.getElementById("hours-in");
  const cost = document.getElementById("cost");
  const out = {
    people: document.getElementById("o-people"),
    hours: document.getElementById("o-hours"),
    cost: document.getElementById("o-cost"),
    money: document.getElementById("r-money"),
    rh: document.getElementById("r-hours"),
    fte: document.getElementById("r-fte"),
  };
  const AUTOMATION_RATE = 0.7;
  const WEEKS = 48;
  const FTE_HOURS = 40 * WEEKS;
  let shown = 0;
  let raf = null;

  const paintRange = (r) => {
    const p = ((r.value - r.min) / (r.max - r.min)) * 100;
    r.style.setProperty("--p", `${p}%`);
  };

  const animateMoney = (to) => {
    cancelAnimationFrame(raf);
    if (reduceMotion || shown === 0) { shown = to; out.money.textContent = fmtMXN.format(to); return; }
    const from = shown;
    const start = performance.now();
    const dur = 450;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      shown = from + (to - from) * e;
      out.money.textContent = fmtMXN.format(shown);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const calc = () => {
    const p = Number(people.value);
    const h = Number(hoursIn.value);
    const c = Number(cost.value);
    out.people.textContent = p;
    out.hours.textContent = `${h} h`;
    out.cost.textContent = fmtMXN.format(c);
    const freed = p * h * WEEKS * AUTOMATION_RATE;
    out.rh.textContent = fmtNum.format(freed);
    const fte = freed / FTE_HOURS;
    out.fte.textContent = `${fte.toFixed(1)} ${fte >= 0.95 && fte < 1.05 ? "persona" : "personas"}`;
    animateMoney(freed * c);
    [people, hoursIn, cost].forEach(paintRange);
  };
  [people, hoursIn, cost].forEach((r) => r.addEventListener("input", calc));
  calc();

  /* ---------- Lead form ---------- */
  const form = document.getElementById("lead-form");
  const toast = document.getElementById("toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("input, select").forEach((f) => {
      const valid = f.checkValidity();
      f.closest(".input").classList.toggle("invalid", !valid);
      if (!valid && ok) { f.focus(); ok = false; }
    });
    if (!ok) { showToast("Revisa los campos marcados para continuar."); return; }

    const btn = form.querySelector("button[type=submit]");
    const label = btn.querySelector(".btn-label");
    btn.classList.add("is-loading");
    btn.disabled = true;
    // TODO: conectar a tu CRM / endpoint de formularios.
    setTimeout(() => {
      label.textContent = "¡Solicitud recibida!";
      btn.classList.remove("is-loading");
      showToast(`Gracias, ${form.nombre.value.split(" ")[0]}. Te contactaremos en menos de 24 h.`);
      form.reset();
      setTimeout(() => { label.textContent = "Agendar mi diagnóstico gratuito"; btn.disabled = false; }, 3500);
    }, 900);
  });
  form.addEventListener("input", (e) => e.target.closest(".input")?.classList.remove("invalid"));
})();
