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

  /* ---------- Hero: the leaking pipeline ---------- */
  (function pipe() {
    var cv = $("#pipe"); if (!cv) return;
    var sw = $("#pipeSwitch"), stat = $("#pipeStat"), wrapStat = $("#riverStat"), ctx = cv.getContext("2d");
    var on = false, W = 0, H = 0, dpr = 1, y0 = 0, x0 = 0, x1 = 0, pw = 15, endW = 150, small = false, gates = [], parts = [], outcomes = [], last = 0, spawn = 0, glow = 0, running = false, seen = true, every = .05, heal = 0;
    var LEAK = .3, FIT = .24, NAMES = ["Follow-up", "Qualified", "Booked"];
    for (var i = 0; i < 100; i++) outcomes.push(i % 3 ? 1 : 0); /* 1 = lost */

    function size() {
      var r = cv.getBoundingClientRect(), wr = $(".wrap", cv.parentNode), st = getComputedStyle(wr);
      dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = W < 640; pw = small ? 11 : 16; endW = small ? 78 : 158; every = small ? .07 : .045;
      x0 = wr.getBoundingClientRect().left + parseFloat(st.paddingLeft);
      x1 = W - x0 - endW; y0 = Math.round(H * .4);
      gates = [.3, .56, .82].map(function (f) { return x0 + (x1 - x0) * f; });
      if (calm) paintStill();
    }
    function make() { return { x: x0, y: y0 + (Math.random() - .5) * pw * 1.5, vx: (small ? 120 : 190) + Math.random() * 70, vy: 0, g: 0, kind: 0, a: 1, r: 2 + Math.random() * 1.6 }; }
    function push(lost) { outcomes.push(lost ? 1 : 0); outcomes.shift(); }
    function lostNow() { var s = 0; for (var i = 0; i < 100; i++) s += outcomes[i]; return s; }
    function step(dt) {
      spawn += dt; while (spawn > every) { spawn -= every; parts.push(make()); }
      glow += ((on ? 1 : 0) - glow) * Math.min(1, dt * 3);
      if (on) { heal += dt * 45; while (heal >= 1) { heal -= 1; var at = outcomes.indexOf(1); if (at > -1) outcomes[at] = 0; } }
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        if (p.kind) { /* 1 leaking, 2 sorted out on purpose */
          if (p.kind === 1) p.vy += 340 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt * (p.kind === 1 ? .55 : 1.1);
          if (p.a <= 0 || p.y > H + 6) parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        if (p.g < gates.length && p.x >= gates[p.g]) {
          if (!on && Math.random() < LEAK) { p.kind = 1; p.vx *= .22; p.vy = 30 + Math.random() * 50; p.y = y0 + pw; push(true); continue; }
          if (on && p.g === 1 && Math.random() < FIT) { p.kind = 2; p.vx *= .16; p.vy = 34; p.y = y0 + pw; push(false); continue; }
          p.g++;
        }
        if (p.x >= x1) { parts.splice(i, 1); push(false); }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var a = glow;
      ctx.lineWidth = 1.5;
      /* pipe runs in from the edge of the screen */
      [[y0 - pw], [y0 + pw]].forEach(function (y) {
        ctx.strokeStyle = "rgba(244,241,232," + (.3 - .3 * a) + ")"; ctx.beginPath(); ctx.moveTo(0, y[0]); ctx.lineTo(x1, y[0]); ctx.stroke();
        if (a > .01) { ctx.strokeStyle = "rgba(0,212,255," + a * .85 + ")"; ctx.beginPath(); ctx.moveTo(0, y[0]); ctx.lineTo(x1, y[0]); ctx.stroke(); }
      });
      ctx.textBaseline = "middle"; ctx.font = "500 " + (small ? 11 : 12) + "px JetBrains, monospace";
      ctx.textAlign = "left"; ctx.fillStyle = "rgba(244,241,232,.72)"; if (!small) ctx.fillText("New leads", x0, y0 - pw - 16);
      ctx.textAlign = "center";
      gates.forEach(function (x, n) {
        ctx.fillStyle = "rgba(244,241,232,.72)"; ctx.fillText(NAMES[n], x, y0 - pw - 16);
        ctx.lineWidth = 2;
        if (a > .5) { ctx.strokeStyle = "rgba(0,212,255,.9)"; ctx.beginPath(); ctx.moveTo(x, y0 - pw - 5); ctx.lineTo(x, y0 + pw + 5); ctx.stroke(); }
        else { ctx.strokeStyle = "#ff6a3d"; ctx.fillStyle = "#070707"; ctx.fillRect(x - 7, y0 + pw - 2, 14, 4); ctx.beginPath(); ctx.moveTo(x - 9, y0 + pw); ctx.lineTo(x - 4, y0 + pw + 5); ctx.lineTo(x, y0 + pw - 1); ctx.lineTo(x + 4, y0 + pw + 5); ctx.lineTo(x + 9, y0 + pw); ctx.stroke(); }
      });
      if (a > .5) { ctx.fillStyle = "rgba(174,170,158," + (a - .5) * 2 + ")"; ctx.fillText(small ? "Not a fit" : "Not a fit: sorted, not lost", gates[1], Math.min(y0 + pw + 66, H - 12)); }
      /* the end of the pipe */
      var fill = 1 - lostNow() / 100;
      ctx.fillStyle = "rgba(255,193,5," + (.08 + .3 * fill) + ")"; rr(x1, y0 - 24, endW, 48, 8); ctx.fill();
      ctx.strokeStyle = "#ffc105"; ctx.lineWidth = 1.5; rr(x1, y0 - 24, endW, 48, 8); ctx.stroke();
      ctx.fillStyle = "#ffdc6b"; ctx.font = "600 " + (small ? 11 : 13) + "px JetBrains, monospace"; ctx.fillText(small ? "Revenue" : "Closed revenue", x1 + endW / 2, y0);
      parts.forEach(function (p) {
        ctx.globalAlpha = Math.max(p.a, 0);
        ctx.fillStyle = p.kind === 1 ? "#ff6a3d" : p.kind === 2 ? "#aeaa9e" : (a > .5 ? "#7fe9ff" : "#ffc105");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
    var shown = -1;
    function writeStat() { var n = lostNow(); if (n !== shown) { shown = n; stat.textContent = n + " of 100"; wrapStat.classList.toggle("ok", n === 0); } }
    function frame(t) {
      if (!seen || document.hidden) { running = false; return; }
      var dt = Math.min((t - last) / 1000, .05); last = t;
      step(dt); draw(); writeStat(); requestAnimationFrame(frame);
    }
    function start() { if (!running && !calm) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    function paintStill() {
      parts = []; outcomes = outcomes.map(function (_, i) { return on ? 0 : (i % 3 ? 1 : 0); });
      glow = on ? 1 : 0; draw(); writeStat();
    }
    function set(v, how) {
      on = v; sw.setAttribute("aria-checked", on); sw.classList.remove("hint");
      if (how === "click") track("hero_system_toggle", { source: on ? "on" : "off" });
      if (calm) paintStill();
    }
    var touched = false;
    sw.addEventListener("click", function () { touched = true; set(!on, "click"); });
    if (!calm) setTimeout(function () { if (!touched) set(true, "auto"); }, 8000);
    addEventListener("resize", size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (calm) paintStill(); });
    size();
    if (!calm) {
      new IntersectionObserver(function (e) { seen = e[0].isIntersecting; if (seen) start(); }).observe(cv);
      document.addEventListener("visibilitychange", start);
      start();
    }
  })();

  /* ---------- Revenue leak calculator ---------- */
  var lastLeak = null, leakTouched = false;
  (function calc() {
    var root = $("#calc"); if (!root) return;
    var fields = $$("input[type=range]", root), bumped = false, urlT = 0;
    var num = $("#rTotal"), yr = $("#rYear"), r1 = $("#rLost"), r2 = $("#rOps"), b1 = $("#bLost"), b2 = $("#bOps"), verdict = $("#rVerdict");
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
      var v = vals, lost = v.leads * (Math.min(v.slip, 100) / 100) * (Math.min(v.close, 100) / 100) * v.deal, ops = v.hours * 4.33 * v.rate, total = lost + ops, top = Math.max(lost, ops, 1);
      tween(total);
      yr.innerHTML = "That is <b>" + money(total * 12) + " a year</b>";
      r1.textContent = money(lost) + "/mo"; r2.textContent = money(ops) + "/mo";
      b1.style.transform = "scaleX(" + lost / top + ")"; b2.style.transform = "scaleX(" + ops / top + ")";
      verdict.innerHTML = lost >= ops
        ? "<b>Biggest leak: follow-up.</b> Start with Lead &amp; Pipeline Operatives, so no lead waits on someone remembering."
        : "<b>Biggest leak: manual work.</b> Start with Workflow Operatives, so your time stops going to work a system should do.";
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
      strategy: ["Get your free leak audit", "Two quick steps. We’ll show you exactly where you’re losing money."],
      forge: ["Book a free AI Operative Audit", "Let’s find out exactly how much time we can save you."]
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
      if (lastLeak && leakTouched) { pill.hidden = false; pill.innerHTML = "Your estimate: <b>" + money(lastLeak) + "/mo</b> leaking. We’ll check it against your real numbers."; } else pill.hidden = true;
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

  /* ---------- Scroll scenes ---------- */
  (function scenes() {
    var map = $("#sysMap"), states = $$(".sys-state");
    function setState(s) { states.forEach(function (el) { el.style.opacity = +el.dataset.s === s ? 1 : 0; el.setAttribute("aria-hidden", +el.dataset.s !== s); }); }
    if (!window.gsap || !window.ScrollTrigger || calm) { if (map) setState(1); return; }
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("has-gsap");
    var mm = gsap.matchMedia();

    function buildSys() {
      var nodes = $$(".node", map), wires = $$(".wire", map), core = $("#sysCore", map);
      var scatter = [[-60, -30, -14], [40, -46, 11], [66, 44, -9], [-26, 60, 15], [-78, 34, 8], [52, -8, -16]];
      var tl = gsap.timeline({ paused: true });
      gsap.set(wires, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(core, { opacity: 0, scale: .7, transformOrigin: "50% 50%" });
      nodes.forEach(function (n, i) { gsap.set(n, { x: scatter[i][0], y: scatter[i][1], rotation: scatter[i][2], transformOrigin: "50% 50%", opacity: .72 }); });
      tl.to(nodes, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: "power3.inOut", stagger: .05 })
        .to(core, { opacity: 1, scale: 1, duration: .5, ease: "back.out(1.7)" }, "-=.35")
        .to(wires, { strokeDashoffset: 0, duration: .6, ease: "none", stagger: .05 }, "-=.15");
      return tl;
    }
    if (map) {
      mm.add("(min-width:960px)", function () {
        var tl = buildSys();
        ScrollTrigger.create({
          trigger: ".sys-in", start: "top top", end: "+=130%", pin: true, scrub: .6, animation: tl,
          onUpdate: function (s) { setState(s.progress > .5 ? 1 : 0); }
        });
      });
      mm.add("(max-width:959.98px)", function () {
        var tl = buildSys(); tl.timeScale(.72);
        ScrollTrigger.create({ trigger: map, start: "top 72%", once: true, onEnter: function () { tl.play(); setTimeout(function () { setState(1); }, 900); } });
      });
    }
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  })();
})();
