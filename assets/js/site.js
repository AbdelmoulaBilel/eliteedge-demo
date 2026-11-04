/* Elite Edge Collective — demo rebuild. No framework; every block is guarded so both pages share this file. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };

  /* ---------- Measurement: every key action lands in dataLayer, ready for GTM. Add ?hud to watch it live. ---------- */
  window.dataLayer = window.dataLayer || [];
  var hud = null;
  if (/[?&]hud\b/.test(location.search)) {
    hud = document.createElement("div"); hud.className = "hud"; hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = "<b>Live funnel events</b>"; document.body.appendChild(hud);
  }
  function track(event, data) {
    var e = Object.assign({ event: event }, data || {});
    window.dataLayer.push(e);
    if (hud) {
      var l = document.createElement("div"); l.textContent = "→ " + event + (e.source ? " · " + e.source : "");
      hud.appendChild(l); if (hud.children.length > 9) hud.removeChild(hud.children[1]);
    }
  }
  track("page_view", { source: location.pathname.indexOf("forge") > -1 ? "forge" : "home" });

  /* ---------- Nav ---------- */
  var nav = $(".nav"), bar = $(".nav-bar"), toggle = $(".nav-toggle"), drawer = $(".nav-drawer"), mob = $(".mob-cta"), hero = $(".hero");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("stuck", y > 20);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (mob && hero) mob.classList.toggle("show", y > hero.offsetHeight * 0.75 && y < max - 500);
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (toggle) toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open); drawer.classList.toggle("open", open);
  });
  if (drawer) drawer.addEventListener("click", function (e) {
    if (e.target.closest("a,button")) { toggle.setAttribute("aria-expanded", false); drawer.classList.remove("open"); }
  });
  var navLinks = $$(".nav-links a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* ---------- Scroll reveal: content stays visible unless this observer exists ---------- */
  if ("IntersectionObserver" in window && !calm) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -15% 0px" });
    $$(".fx").forEach(function (el) { ro.observe(el); });
    document.documentElement.classList.add("motion-ready");
  }

  /* ---------- Process rail fills with scroll ---------- */
  var rails = $$(".rail");
  function railTick() {
    rails.forEach(function (r) {
      var box = r.getBoundingClientRect(), wide = innerWidth >= 960, stops = $$("li", r), p = 1;
      if (!calm) p = Math.max(0, Math.min(1, (innerHeight * .78 - box.top) / (wide ? innerHeight * .34 : box.height)));
      r.style.setProperty("--fill", p.toFixed(3));
      stops.forEach(function (li, i) {
        var at = wide ? i / stops.length : (li.offsetTop) / box.height;
        li.classList.toggle("on", p >= at);
      });
    });
  }
  if (rails.length) { addEventListener("scroll", function () { requestAnimationFrame(railTick); }, { passive: true }); addEventListener("resize", railTick); railTick(); }

  /* ---------- Hero: live pipeline board ---------- */
  (function board() {
    var root = $("#board"); if (!root) return;
    var sw = $("#pipeSwitch"), lostEl = $("#bLostNow"), wonEl = $("#bWonNow"), ORDER = ["new", "follow", "qual", "book", "won"], MAX = 3;
    var LEADS = [["Priya N.", "Dental group", 4800], ["Marcus T.", "HVAC", 2650], ["Elena R.", "Law firm", 7200], ["Jordan K.", "SaaS", 9400], ["Tasha B.", "Med spa", 3150], ["Owen L.", "Roofing", 5750], ["Dara M.", "Agency", 6300], ["Victor S.", "Logistics", 8900], ["Noor A.", "Clinic", 4150], ["Caleb W.", "Fintech", 11200]];
    var on = false, lost = 0, won = 0, next = 0, timer = 0, seen = true, touched = false;
    var cols = {}; ORDER.forEach(function (k) { cols[k] = $("[data-col=" + k + "] .col", root); });
    function card(col, note, cls) {
      var d = LEADS[next++ % LEADS.length], el = document.createElement("div");
      el.className = "lc"; el.value_ = d[2];
      el.innerHTML = "<b></b><s></s><span></span><u></u>";
      el.children[0].textContent = d[0]; el.children[1].textContent = money(d[2]); el.children[2].textContent = d[1];
      cols[col].appendChild(el); setNote(el, note, cls); return el;
    }
    function setNote(el, text, cls) { el.classList.remove("stall", "good"); if (cls) el.classList.add(cls); el.children[3].textContent = text || ""; }
    function counts() {
      ORDER.forEach(function (k) { $("[data-col=" + k + "] em", root).textContent = cols[k].children.length; });
      lostEl.textContent = money(lost); wonEl.textContent = money(won);
    }
    function move(el, to) { /* slide the card from where it was to where it lands */
      var a = el.getBoundingClientRect(); cols[to].appendChild(el); var b = el.getBoundingClientRect();
      if (!calm && a.width && b.width && el.animate) el.animate([{ transform: "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px)" }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
    function drop(el) { el.classList.add("out"); setTimeout(function () { el.remove(); counts(); }, calm ? 0 : 460); }
    function spawn() { if (cols.new.children.length < 2) card("new", on ? "" : "Waiting"); }
    function tickOff() {
      var stalled = $(".lc.stall", root);
      if (stalled) { lost += stalled.value_; drop(stalled); }
      else {
        var f = cols.follow.children[0];
        if (f) setNote(f, "No reply in 3 days", "stall");
        else if (cols.new.children[0]) move(cols.new.children[0], "follow");
      }
      if (Math.random() < .35 && cols.new.children[0] && cols.follow.children.length < MAX) move(cols.new.children[0], "follow");
    }
    function tickOn() {
      $$(".lc", root).forEach(function (el) { if (el.classList.contains("stall")) setNote(el, "Replied in 4 sec", "good"); else if (el.children[3].textContent === "Waiting") setNote(el, ""); });
      var path = [["book", "won", "Closed"], ["qual", "book", "Call booked"], ["follow", "qual", "Fit confirmed"], ["new", "follow", "Replied in 4 sec"]];
      for (var i = 0; i < path.length; i++) {
        var p = path[i], el = cols[p[0]].children[0];
        if (!el || cols[p[1]].children.length >= MAX + (p[1] === "won" ? 1 : 0)) continue;
        if (p[0] === "qual" && (el.value_ % 7) === 0) { setNote(el, "Not a fit", ""); drop(el); continue; }
        move(el, p[1]); setNote(el, p[2], "good");
        if (p[1] === "won") { won += el.value_; if (cols.won.children.length > MAX) cols.won.children[0].remove(); }
      }
    }
    function step() { spawn(); (on ? tickOn : tickOff)(); counts(); }
    function loop() { clearTimeout(timer); if (!seen || document.hidden || calm) return; step(); timer = setTimeout(loop, on ? 1000 : 1150); }
    /* starting board */
    card("new", ""); card("follow", "Waiting"); card("qual", ""); card("book", ""); var w = card("won", ""); won = w.value_; counts();
    function set(v, how) {
      on = v; sw.setAttribute("aria-checked", on); sw.classList.remove("hint");
      if (how === "click") track("hero_system_toggle", { source: on ? "on" : "off" });
      if (calm) { step(); }
    }
    sw.addEventListener("click", function () { touched = true; set(!on, "click"); });
    if (!calm) {
      setTimeout(function () { if (!touched) set(true, "auto"); }, 11000);
      new IntersectionObserver(function (e) { var was = seen; seen = e[0].isIntersecting; if (seen && !was) loop(); }).observe(root);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) loop(); });
      timer = setTimeout(loop, 700);
    }
  })();

  /* ---------- Revenue leak calculator ---------- */
  var lastLeak = null, leakTouched = false;
  (function calc() {
    var root = $("#calc"); if (!root) return;
    var fields = $$("input[type=range]", root), bumped = false, urlT = 0, CLOSE = .2, RATE = 100;
    var num = $("#rTotal"), yr = $("#rYear"), dotBox = $("#dots"), dots = [];
    for (var d = 0; d < 100; d++) { var e = document.createElement("i"); e.style.transitionDelay = d * 3 + "ms"; dotBox.appendChild(e); dots.push(e); }
    var cur = 0, raf = 0, vals = {};
    var q = new URLSearchParams(location.search);
    fields.forEach(function (f) { var v = parseFloat(q.get(f.name)); vals[f.name] = isFinite(v) && v >= 0 ? v : +f.value; f.value = vals[f.name]; if (q.has(f.name)) leakTouched = true; });
    function tween(to) {
      if (calm) { cur = to; num.textContent = money(to); return; }
      cancelAnimationFrame(raf); var from = cur, t0 = performance.now();
      (function go(t) {
        var p = Math.min((t - t0) / 420, 1), e = 1 - Math.pow(1 - p, 3); cur = from + (to - from) * e;
        num.textContent = money(cur); if (p < 1) raf = requestAnimationFrame(go);
      })(t0);
    }
    function paint(skip) {
      fields.forEach(function (f) {
        f.style.setProperty("--p", Math.min((f.value - f.min) / (f.max - f.min), 1) * 100 + "%");
        var box = $("#o-" + f.name); if (box !== skip) box.value = vals[f.name].toLocaleString("en-US");
      });
      var v = vals, slip = Math.min(v.slip, 100), lost = v.leads * (slip / 100) * CLOSE * v.deal, ops = v.hours * 4.33 * RATE, total = lost + ops;
      tween(total);
      yr.innerHTML = "a month. <b>" + money(total * 12) + " a year.</b>";
      dots.forEach(function (el, i) { el.classList.toggle("off", i < Math.round(slip)); });
      lastLeak = Math.round(total);
      if (leakTouched) $$("[data-personal]").forEach(function (b) { var s = $("span", b) || b; if (!b.dataset.base) { b.dataset.base = "1"; b.innerHTML = "<span></span>" + ($("svg", b) ? $("svg", b).outerHTML : ""); s = $("span", b); } s.textContent = "Audit My " + money(lastLeak) + "/mo Leak"; });
    }
    function touched(name) {
      leakTouched = true;
      if (!bumped) { bumped = true; track("calculator_used", { source: name }); }
      clearTimeout(urlT); urlT = setTimeout(function () {
        try { var u = new URLSearchParams(); fields.forEach(function (f) { u.set(f.name, vals[f.name]); }); history.replaceState(null, "", "?" + u + location.hash); } catch (e) { /* file:// */ }
      }, 300);
    }
    fields.forEach(function (f) {
      f.addEventListener("input", function () { vals[f.name] = +f.value; touched(f.name); paint(); });
      var box = $("#o-" + f.name);
      box.addEventListener("input", function () {
        var v = parseFloat(box.value.replace(/[^0-9.]/g, "")); if (!isFinite(v)) return;
        vals[f.name] = v; f.value = v; touched(f.name); paint(box);
      });
      box.addEventListener("focus", function () { box.select(); });
      box.addEventListener("blur", function () { paint(); });
    });
    paint();
  })();

  /* ---------- Forge: simulated lead run ---------- */
  (function sim() {
    var list = $("#run"); if (!list) return;
    var items = $$("li", list), timers = [], btn = $("#runAgain");
    function play() {
      timers.forEach(clearTimeout); timers = [];
      items.forEach(function (li) { li.classList.remove("done"); });
      if (calm) { items.forEach(function (li) { li.classList.add("done"); }); return; }
      items.forEach(function (li, i) { timers.push(setTimeout(function () { li.classList.add("done"); }, 300 + i * 950)); });
    }
    if (btn) btn.addEventListener("click", function () { track("forge_sim_replay"); play(); });
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); play(); } }, { rootMargin: "0px 0px -20% 0px" }).observe(list);
  })();

  /* ---------- Lead form ---------- */
  (function lead() {
    var dlg = $("#lead"); if (!dlg) return;
    var form = $("form", dlg), steps = $$("[data-step]", dlg), bars = $$(".lead-prog i", dlg), title = $("#leadTitle"), sub = $("#leadSub"), pill = $("#leakPill"), started = false, n = 0, kind = "strategy";
    var COPY = {
      strategy: ["Get your free leak audit", "Two quick steps."],
      forge: ["Book a free AI Operative Audit", "Two quick steps."]
    };
    function show(i) {
      n = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      bars.forEach(function (b, k) { b.classList.toggle("on", k <= i); });
      var f = $("input,button", steps[i]); if (f) setTimeout(function () { f.focus(); }, 40);
    }
    function open(src, type) {
      kind = type || (document.body.classList.contains("forge") ? "forge" : "strategy");
      title.textContent = COPY[kind][0]; sub.textContent = COPY[kind][1];
      if (lastLeak && leakTouched) { pill.hidden = false; pill.innerHTML = "Your estimate: <b>" + money(lastLeak) + "/mo</b> leaking."; } else pill.hidden = true;
      form.reset(); $$(".err", form).forEach(function (e) { e.textContent = ""; }); $$("[aria-invalid]", form).forEach(function (e) { e.removeAttribute("aria-invalid"); });
      started = false; show(0);
      var gap = innerWidth - document.documentElement.clientWidth; dlg.showModal();
      document.documentElement.style.overflow = "hidden"; document.body.style.paddingRight = gap ? gap + "px" : "";
      track("hero_cta_click", { source: src || "unknown" });
    }
    dlg.addEventListener("close", function () { document.documentElement.style.overflow = ""; document.body.style.paddingRight = ""; });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    $(".lead-x", dlg).addEventListener("click", function () { dlg.close(); });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lead]"); if (!b) return;
      e.preventDefault(); open(b.getAttribute("data-lead"), b.getAttribute("data-kind"));
      var neck = b.getAttribute("data-neck"), pick = neck && form.querySelector("[name=bottleneck][value='" + neck + "']");
      if (pick) pick.checked = true;
    });
    form.addEventListener("input", function () { if (!started) { started = true; track("form_start"); } });
    form.addEventListener("change", function (e) {
      if (e.target.name === "revenue") $("#e-rev").textContent = "";
      if (e.target.name === "bottleneck") $("#e-neck").textContent = "";
    });
    function fail(id, msg, el) { $("#" + id).textContent = msg; if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); } return false; }
    $("#toStep2").addEventListener("click", function () {
      var rev = form.querySelector("[name=revenue]:checked"), neck = form.querySelector("[name=bottleneck]:checked");
      $("#e-rev").textContent = ""; $("#e-neck").textContent = "";
      if (!rev) return fail("e-rev", "Pick the closest range.");
      if (!neck) return fail("e-neck", "Pick your biggest bottleneck.");
      track("form_step_1_complete", { source: rev.value }); show(1);
    });
    $("#back1").addEventListener("click", function () { show(0); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name, mail = form.elements.email, co = form.elements.company, ok = true;
      [["e-name", name], ["e-email", mail], ["e-co", co]].forEach(function (p) { $("#" + p[0]).textContent = ""; p[1].removeAttribute("aria-invalid"); });
      if (!co.value.trim()) ok = fail("e-co", "Add your company or website.", co);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.value.trim())) ok = fail("e-email", "Enter a valid work email.", mail);
      if (!name.value.trim()) ok = fail("e-name", "Add your name.", name);
      if (!ok) return;
      /* Preview: nothing is stored. Connect the CRM webhook / PocketBase here at launch. */
      track("form_submit", { source: kind, leak_estimate: lastLeak });
      var pickR = form.querySelector("[name=revenue]:checked"), pickN = form.querySelector("[name=bottleneck]:checked");
      var note = ["Name: " + name.value.trim(), "Email: " + mail.value.trim(), "Company: " + co.value.trim(),
        "Monthly revenue: " + pickR.parentNode.textContent.trim(), "Biggest bottleneck: " + pickN.parentNode.textContent.trim()];
      if (lastLeak && leakTouched) note.push("Estimated leak: " + money(lastLeak) + "/mo");
      $("#mailLink").href = "mailto:eliteedgellc@eliteedgeinfluence.com?subject=" + encodeURIComponent((kind === "forge" ? "AI Operative Audit: " : "Leak audit: ") + co.value.trim()) + "&body=" + encodeURIComponent(note.join("\n"));
      show(2);
    });
    var cal = $("#calLink"); if (cal) cal.addEventListener("click", function () { track("calendar_open", { source: kind }); });
  })();

  /* ---------- Test lead player: beats fire on a timeline, step by step ---------- */
  (function player() {
    var root = $("#player"); if (!root) return;
    var scenes = $$(".sc", root), steps = $$(".pl-steps button", root), run = $("#plRun"), input = $("#plName"), timers = [], name = "Priya", ran = false;
    root.classList.add("pl-ready");
    function later(fn, t) { timers.push(setTimeout(fn, t)); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function cal() { var s = $(".slot", root), box = $(".cal2", root); if (s) box.style.setProperty("--cx", s.offsetLeft + s.offsetWidth / 2 + "px"); }
    function setName() {
      var v = input.value.trim().replace(/\s+/g, " "); name = v || "Priya";
      $$(".nm", root).forEach(function (e) { e.textContent = name; }); $(".ini", root).textContent = name.charAt(0).toUpperCase();
    }
    function count(el) {
      var a = +el.dataset.from, b = +el.dataset.to, t0 = performance.now();
      (function go(t) { var p = Math.min((t - t0) / 900, 1); el.textContent = money(a + (b - a) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(go); })(t0);
    }
    function reset(sc) {
      $$("[data-t]", sc).forEach(function (e) { e.classList.remove("in", "gone"); });
      $$("[data-count]", sc).forEach(function (e) { e.textContent = money(+e.dataset.from); });
      var c = $("[data-clock]", sc); if (c) c.textContent = "0:00";
    }
    function show(i) {
      scenes.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      steps.forEach(function (b, k) {
        b.classList.toggle("on", k === i); b.classList.toggle("done", k < i);
        b.style.setProperty("--len", scenes[i].dataset.len + "ms");
      });
    }
    function play(i, chain) {
      clear(); var sc = scenes[i], len = +sc.dataset.len; show(i); reset(sc); cal();
      if (calm) { $$("[data-t]", sc).forEach(function (e) { e.classList.add("in"); if (e.dataset.off) e.classList.add("gone"); }); steps[i].classList.add("done"); return; }
      steps[i].classList.remove("on"); void steps[i].offsetWidth; steps[i].classList.add("on");
      $$("[data-t]", sc).forEach(function (e) {
        later(function () { e.classList.add("in"); }, +e.dataset.t);
        if (e.dataset.off) later(function () { e.classList.add("gone"); }, +e.dataset.off);
      });
      $$("[data-count]", sc).forEach(function (e) { later(function () { count(e); }, +e.dataset.at); });
      var c = $("[data-clock]", sc);
      if (c) [1, 2, 3, 4].forEach(function (s) { later(function () { c.textContent = "0:0" + s; }, 800 + s * 350); });
      if (chain && i < scenes.length - 1) later(function () { play(i + 1, true); }, len);
      else later(function () { steps[i].classList.remove("on"); steps[i].classList.add("done"); run.firstChild.textContent = "Run It Again "; }, len);
    }
    function go() { ran = true; setName(); steps.forEach(function (b) { b.classList.remove("done"); }); play(0, true); }
    run.addEventListener("click", function () { go(); track("demo_run", { source: input.value.trim() ? "named" : "default" }); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run.click(); } });
    steps.forEach(function (b, i) { b.addEventListener("click", function () { setName(); play(i, false); track("demo_step", { source: b.textContent }); }); });
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); if (!ran) go(); } }, { threshold: .6 }).observe(root);
    play(0, false); clear(); if (!calm) { reset(scenes[0]); steps[0].classList.remove("on"); }
  })();

  /* ---------- Example case studies: tabs play themselves until touched ---------- */
  (function tabs() {
    var ts = $$("[role=tab]"), box = $(".tabs"), auto = !calm, timer = 0, seen = false; if (!ts.length) return;
    function animate(panel) {
      panel.classList.remove("play"); void panel.offsetWidth; panel.classList.add("play");
      $$(".met", panel).forEach(function (m) {
        var b = $("b", m), n = +m.dataset.n, t0 = performance.now(), pre = m.dataset.pre, suf = m.dataset.suf; if (calm) return;
        (function go(t) { var p = Math.min((t - t0) / 1000, 1); b.textContent = pre + Math.round(n * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(go); })(t0);
      });
    }
    function show(i, focus) {
      ts.forEach(function (t, k) {
        var sel = k === i, panel = $("#" + t.getAttribute("aria-controls")); t.setAttribute("aria-selected", sel); t.tabIndex = sel ? 0 : -1; panel.hidden = !sel;
        if (sel && seen) animate(panel);
      });
      if (focus) ts[i].focus();
      clearTimeout(timer);
      if (auto && seen) timer = setTimeout(function () { var cur = ts.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }); show((cur + 1) % ts.length); }, 5500);
    }
    function stop() { auto = false; box.classList.remove("auto"); clearTimeout(timer); }
    ts.forEach(function (t, i) {
      t.addEventListener("click", function () { stop(); show(i); track("case_study_view", { source: t.textContent }); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { stop(); show((i + 1) % ts.length, true); }
        if (e.key === "ArrowLeft") { stop(); show((i + ts.length - 1) % ts.length, true); }
      });
    });
    new IntersectionObserver(function (e) {
      var was = seen; seen = e[0].isIntersecting;
      if (seen && !was) { if (auto) box.classList.add("auto"); show(ts.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; })); } else if (!seen) clearTimeout(timer);
    }, { rootMargin: "0px 0px -20% 0px" }).observe(box.parentNode);
  })();

  /* ---------- Services: animated scenes cycle until touched ---------- */
  (function services() {
    var root = $("#svc"); if (!root) return;
    var btns = $$(".svc-list button", root), svs = $$(".sv", root), cta = $("#svcCta"), i = 0, timer = 0, auto = !calm, seen = false;
    function show(n) {
      i = n;
      btns.forEach(function (b, k) { b.classList.remove("on"); if (k === n) { void b.offsetWidth; b.classList.add("on"); } });
      svs.forEach(function (s, k) { s.classList.toggle("on", k === n); s.classList.toggle("live", k === n && seen && !calm); });
      cta.setAttribute("data-neck", btns[n].dataset.neck);
      clearTimeout(timer); if (auto && seen) timer = setTimeout(function () { show((i + 1) % btns.length); }, 4400);
    }
    btns.forEach(function (b, n) { b.addEventListener("click", function () { auto = false; root.classList.remove("auto"); show(n); track("service_view", { source: b.textContent }); }); });
    new IntersectionObserver(function (e) { seen = e[0].isIntersecting; if (seen && auto) root.classList.add("auto"); show(i); if (!seen) clearTimeout(timer); }).observe(root);
    show(0);
  })();
})();
