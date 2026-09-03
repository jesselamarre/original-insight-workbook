/* ============ Original Insight — Digital Workbook logic ============ */
(function () {
  "use strict";

  const STORAGE_KEY = "oi-workbook-answers-v1";
  const COUNTS_KEY = "oi-workbook-counts-v1";
  const CANVAS_KEY = "oi-workbook-canvas-choice";

  let data = {};
  let counts = { assumptions: 6, risks: 3, priorities: 6 };

  function loadAll() {
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { data = {}; }
    try { counts = Object.assign(counts, JSON.parse(localStorage.getItem(COUNTS_KEY)) || {}); } catch (e) {}
  }
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function persistCounts() {
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  }

  function flashSaved(el) {
    const mark = el.parentElement && el.parentElement.querySelector(".savemark");
    if (mark) { mark.classList.add("show"); setTimeout(() => mark.classList.remove("show"), 700); }
  }

  // ---------------- Field binding (save/restore) ----------------
  function bindField(el) {
    const key = el.getAttribute("data-key");
    if (!key) return;
    if (data[key] !== undefined) {
      if (el.type === "checkbox") el.checked = !!data[key];
      else el.value = data[key];
    }
    const evt = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
    el.addEventListener(evt, () => {
      data[key] = el.type === "checkbox" ? el.checked : el.value;
      persist();
      flashSaved(el);
      updateProgress();
      if (el.classList.contains("calc-input")) recalcRow(el);
    });
  }

  function bindAllFields(root) {
    (root || document).querySelectorAll("[data-key]").forEach(bindField);
  }

  // ---------------- Week / panel navigation ----------------
  function showPanel(name) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
    document.querySelectorAll(".week-tab").forEach((t) => t.classList.toggle("active", t.dataset.week === name));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    buildTOC(name);
    history.replaceState(null, "", "#" + name);
  }

  function buildTOC(name) {
    const toc = document.getElementById("toc");
    toc.innerHTML = "";
    const panel = document.getElementById("panel-" + name);
    if (!panel) return;
    panel.querySelectorAll("h2.sec").forEach((h, i) => {
      if (!h.id) h.id = name + "-sec-" + i;
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: "smooth", block: "start" });
      });
      toc.appendChild(a);
    });
  }

  // ---------------- Progress tracking ----------------
  function updateProgress() {
    ["week1", "week2", "week3"].forEach((w) => {
      const panel = document.getElementById("panel-" + w);
      const fields = panel.querySelectorAll("[data-key]");
      let filled = 0;
      fields.forEach((f) => { if ((data[f.getAttribute("data-key")] || "").toString().trim() !== "") filled++; });
      const pct = fields.length ? Math.round((filled / fields.length) * 100) : 0;
      const bar = document.getElementById("prog-" + w);
      if (bar) bar.style.width = pct + "%";
    });
    const all = document.querySelectorAll("main [data-key]");
    let filledAll = 0;
    all.forEach((f) => { if ((data[f.getAttribute("data-key")] || "").toString().trim() !== "") filledAll++; });
    const pctAll = all.length ? Math.round((filledAll / all.length) * 100) : 0;
    document.getElementById("prog-overall").style.width = pctAll + "%";
  }

  // ---------------- Live problem statement composer ----------------
  function initProblemComposer() {
    const ids = ["w1.problem.actor", "w1.problem.situation", "w1.problem.difficulty", "w1.problem.consequence"];
    const out = document.getElementById("problemStatementOut");
    if (!out) return;
    function render() {
      const [actor, situation, difficulty, consequence] = ids.map((k) => {
        const el = document.querySelector('[data-key="' + k + '"]');
        return (el ? el.value : data[k] || "").trim();
      });
      if (!actor && !situation && !difficulty && !consequence) {
        out.textContent = "Fill in the four fields above to see your statement here.";
        return;
      }
      out.innerHTML = 'When <strong>' + (actor || "&hellip;") + '</strong> is in <strong>' + (situation || "&hellip;") +
        '</strong>, they struggle with <strong>' + (difficulty || "&hellip;") + '</strong>, which leads to <strong>' + (consequence || "&hellip;") + '</strong>.';
    }
    ids.forEach((id) => {
      const el = document.querySelector('[data-key="' + id + '"]');
      if (el) el.addEventListener("input", render);
    });
    render();
  }

  // ---------------- Canvas picker (Week 1) ----------------
  function initCanvasPicker() {
    const buttons = document.querySelectorAll(".canvas-picker button");
    const choices = document.querySelectorAll(".canvas-choice");
    let chosen = localStorage.getItem(CANVAS_KEY) || "lean";
    function apply() {
      buttons.forEach((b) => b.classList.toggle("active", b.dataset.canvas === chosen));
      choices.forEach((c) => c.classList.toggle("active", c.dataset.canvas === chosen));
    }
    buttons.forEach((b) => b.addEventListener("click", () => {
      chosen = b.dataset.canvas;
      localStorage.setItem(CANVAS_KEY, chosen);
      apply();
    }));
    apply();
  }

  // ---------------- Repeatable rows: Assumption Bank ----------------
  const CATS = ["Problem", "Solution", "Customer", "Behavior", "Market", "Economics"];

  function assumptionRow(i) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="rownum">${i + 1}</td>
      <td><input type="text" data-key="assump.${i}.text" placeholder="e.g. Urban dog owners are our early adopters"></td>
      <td><select data-key="assump.${i}.cat">${CATS.map(c => `<option value="${c}">${c}</option>`).join("")}</select></td>
      <td><input type="text" data-key="assump.${i}.evidence" placeholder="none yet, or what you have"></td>
      <td><button class="rmrow" title="Remove row"><svg><use href="#icon-trash"/></svg></button></td>`;
    tr.querySelector(".rmrow").addEventListener("click", () => { tr.remove(); updateProgress(); });
    return tr;
  }

  function riskCard(i) {
    const div = document.createElement("div");
    div.className = "card gold";
    div.innerHTML = `
      <button class="rmrow" style="position:absolute; top:12px; right:12px;" title="Remove"><svg><use href="#icon-trash"/></svg></button>
      <div class="kicker gold">Assumption ${i + 1}</div>
      <div class="field"><label>Assumption</label><span class="hint">A one-line description of the assumption you're profiling.</span>
        <textarea data-key="risk.${i}.assumption"></textarea></div>
      <div class="card-grid">
        <div class="field"><label>Risk Profile</label><span class="hint">Classification + what happens if this proves false.</span>
          <textarea data-key="risk.${i}.profile"></textarea></div>
        <div class="field"><label>Confidence</label><span class="hint">Evidence you already have, if any.</span>
          <textarea data-key="risk.${i}.confidence"></textarea></div>
      </div>
      <div class="field"><label>Validation Criteria</label><span class="hint">What would prove this valid or invalid? Be concrete.</span>
        <textarea data-key="risk.${i}.validation"></textarea></div>`;
    div.querySelector(".rmrow").addEventListener("click", () => { div.remove(); updateProgress(); });
    return div;
  }

  function recalcRow(el) {
    const tr = el.closest("tr");
    if (!tr) return;
    const idx = tr.dataset.idx;
    const imp = parseFloat(data["prio." + idx + ".importance"]) || 0;
    const unc = parseFloat(data["prio." + idx + ".uncertainty"]) || 0;
    const ttt = parseFloat(data["prio." + idx + ".ttt"]) || 0;
    const risk = imp * unc;
    const priority = risk * ttt;
    tr.querySelector(".out-risk").textContent = risk || "";
    tr.querySelector(".out-priority").textContent = priority || "";
    data["prio." + idx + ".risk"] = risk;
    data["prio." + idx + ".priority"] = priority;
    persist();
  }

  function priorityRow(i) {
    const tr = document.createElement("tr");
    tr.dataset.idx = i;
    tr.innerHTML = `
      <td class="rownum">${i + 1}</td>
      <td><input type="text" data-key="prio.${i}.text" placeholder="assumption"></td>
      <td><input type="number" min="1" max="5" class="calc-input" data-key="prio.${i}.importance" style="width:44px"></td>
      <td><input type="number" min="1" max="5" class="calc-input" data-key="prio.${i}.uncertainty" style="width:44px"></td>
      <td class="readonly out-risk"></td>
      <td><input type="number" min="1" max="5" class="calc-input" data-key="prio.${i}.ttt" style="width:44px"></td>
      <td class="readonly out-priority"></td>
      <td><button class="rmrow" title="Remove row"><svg><use href="#icon-trash"/></svg></button></td>`;
    tr.querySelector(".rmrow").addEventListener("click", () => { tr.remove(); updateProgress(); });
    return tr;
  }

  function initRepeatables() {
    const assumpBody = document.getElementById("assumptionBody");
    for (let i = 0; i < counts.assumptions; i++) assumpBody.appendChild(assumptionRow(i));
    document.getElementById("addAssumption").addEventListener("click", () => {
      const i = assumpBody.children.length;
      assumpBody.appendChild(assumptionRow(i));
      bindAllFields(assumpBody);
    });

    const riskWrap = document.getElementById("riskCardsWrap");
    for (let i = 0; i < counts.risks; i++) riskWrap.appendChild(riskCard(i));
    document.getElementById("addRisk").addEventListener("click", () => {
      const i = riskWrap.children.length;
      riskWrap.appendChild(riskCard(i));
      bindAllFields(riskWrap);
    });

    const prioBody = document.getElementById("priorityBody");
    for (let i = 0; i < counts.priorities; i++) prioBody.appendChild(priorityRow(i));
    document.getElementById("addPriority").addEventListener("click", () => {
      const i = prioBody.children.length;
      prioBody.appendChild(priorityRow(i));
      bindAllFields(prioBody);
    });

    bindAllFields(assumpBody);
    bindAllFields(riskWrap);
    bindAllFields(prioBody);
    // restore computed outputs for priority rows
    for (let i = 0; i < counts.priorities; i++) {
      const risk = data["prio." + i + ".risk"];
      const priority = data["prio." + i + ".priority"];
      const tr = prioBody.children[i];
      if (tr && risk) tr.querySelector(".out-risk").textContent = risk;
      if (tr && priority) tr.querySelector(".out-priority").textContent = priority;
    }
  }

  // ---------------- Experiment tabs (Week 3) ----------------
  function initExperimentTabs() {
    const tabs = document.querySelectorAll(".exp-tab");
    const panels = document.querySelectorAll(".exp-panel");
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("active", x === t));
      panels.forEach((p) => p.classList.toggle("active", p.dataset.exp === t.dataset.exp));
    }));
  }

  // ---------------- Glossary search ----------------
  function initGlossarySearch() {
    const input = document.getElementById("glossarySearch");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      document.querySelectorAll("#glossaryList dt").forEach((dt) => {
        const dd = dt.nextElementSibling;
        const match = dt.textContent.toLowerCase().includes(q) || dd.textContent.toLowerCase().includes(q);
        dt.style.display = match ? "" : "none";
        dd.style.display = match ? "" : "none";
      });
    });
  }

  // ---------------- Experiment menu filter ----------------
  function initMenuFilter() {
    const btns = document.querySelectorAll(".filterbtn");
    if (!btns.length) return;
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("active", x === b));
      const filter = b.dataset.filter;
      document.querySelectorAll("#menuTable tbody tr").forEach((tr) => {
        tr.style.display = (filter === "all" || tr.dataset.targets.includes(filter)) ? "" : "none";
      });
    }));
  }

  // ---------------- Canvas-picker diagnostic quiz ----------------
  function initDiagnostic() {
    const wrap = document.getElementById("diagnostic");
    if (!wrap) return;
    const answers = {};
    wrap.querySelectorAll(".q").forEach((q) => {
      q.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          q.querySelectorAll("button").forEach((b) => b.classList.remove("chosen"));
          btn.classList.add("chosen");
          answers[q.dataset.q] = btn.dataset.val;
          evaluateDiagnostic(answers);
        });
      });
    });
  }
  function evaluateDiagnostic(answers) {
    const vals = Object.values(answers);
    if (vals.length < 4) return;
    const counts = { product: 0, service: 0, social: 0 };
    vals.forEach((v) => counts[v] = (counts[v] || 0) + 1);
    let best = "product";
    if (counts.social >= counts.product && counts.social >= counts.service) best = "social";
    else if (counts.service > counts.product) best = "service";
    const names = { product: "the Lean Canvas (product)", service: "the Service Mapping Canvas (service)", social: "the Social Business Model Canvas (social venture)" };
    const result = document.getElementById("diagnosticResult");
    result.innerHTML = "Based on your answers, start with <strong>" + names[best] + "</strong>. You can always switch later, this is a starting point, not a life sentence.";
    result.classList.add("show");
  }

  // ---------------- Export answers ----------------
  function exportAnswers() {
    let out = "ORIGINAL INSIGHT — MY WORKBOOK ANSWERS\n";
    out += "Exported " + new Date().toLocaleString() + "\n";
    out += "========================================\n\n";
    document.querySelectorAll("main [data-key]").forEach((el) => {
      const key = el.getAttribute("data-key");
      const val = (data[key] || "").toString().trim();
      if (!val) return;
      let label = "";
      const field = el.closest(".field");
      const labelEl = field && field.querySelector("label");
      if (labelEl) {
        label = labelEl.textContent;
      } else if (el.previousElementSibling && el.previousElementSibling.classList.contains("prompt")) {
        label = el.previousElementSibling.textContent;
      } else {
        label = key;
      }
      out += "• " + (label || key) + ": " + val + "\n";
    });
    const blob = new Blob([out], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "original-insight-answers.txt";
    a.click();
  }

  // ---------------- Reset ----------------
  function resetWorkbook() {
    if (!confirm("This clears every answer you've saved in this browser. This can't be undone. Continue?")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNTS_KEY);
    localStorage.removeItem(CANVAS_KEY);
    location.reload();
  }

  // ---------------- Init ----------------
  document.addEventListener("DOMContentLoaded", () => {
    loadAll();

    document.querySelectorAll(".week-tab").forEach((t) =>
      t.addEventListener("click", () => showPanel(t.dataset.week))
    );
    const startHash = location.hash.replace("#", "");
    showPanel(["intro", "week1", "week2", "week3", "reference"].includes(startHash) ? startHash : "intro");

    initCanvasPicker();
    initRepeatables();
    initExperimentTabs();
    initGlossarySearch();
    initMenuFilter();
    initDiagnostic();
    bindAllFields(document);
    initProblemComposer();
    updateProgress();

    document.getElementById("btnExport").addEventListener("click", exportAnswers);
    document.getElementById("btnPrint").addEventListener("click", () => window.print());
    document.getElementById("btnReset").addEventListener("click", resetWorkbook);
  });
})();
