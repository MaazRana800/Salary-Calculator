/**
 * ui.js — All DOM rendering and event handling
 * Reads from calculator.js, storage.js, countries.js
 */

/* ── STATE ──────────────────────────────────────────────── */
let appState = {
  currency:    "EUR",
  type:        "employee",
  period:      "annual",
  rates:       {},          // live from Frankfurter API
  results:     [],
  sortCol:     "net",
  sortDir:     "desc",
  ratesLoaded: false
};

/* ── LIVE EXCHANGE RATES (Frankfurter API) ───────────────── */
async function fetchLiveRates() {
  const tickerText = document.getElementById("ticker-text");
  const rateHint   = document.getElementById("rate-hint");
  try {
    const res  = await fetch("https://api.frankfurter.dev/latest?from=EUR&to=USD,GBP,CHF");
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    appState.rates = data.rates;   // { USD: 1.08, GBP: 0.86, CHF: 0.96 }
    appState.ratesLoaded = true;
    const usd = data.rates.USD.toFixed(4);
    const gbp = data.rates.GBP.toFixed(4);
    const chf = data.rates.CHF.toFixed(4);
    tickerText.textContent = `EUR/USD ${usd}  ·  EUR/GBP ${gbp}  ·  EUR/CHF ${chf}`;
    rateHint.textContent   = `Live rates · ECB via Frankfurter API · Updated ${new Date(data.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}`;
  } catch {
    tickerText.textContent = "Exchange rates unavailable";
    rateHint.textContent   = "Using EUR only — rates could not be fetched";
    appState.rates = { USD: 1.08, GBP: 0.86, CHF: 0.96 }; // fallback
    appState.ratesLoaded = true;
  }
}

/* ── COUNTRY GRID ───────────────────────────────────────── */
function renderCountryGrid() {
  const grid = document.getElementById("country-grid");
  const last = getLastInput();
  const defaultSelected = last ? last.selectedKeys : POPULAR_COUNTRIES;

  grid.innerHTML = Object.entries(COUNTRIES).map(([key, c]) => {
    const sel = defaultSelected.includes(key);
    return `
      <label class="country-chip ${sel ? "selected" : ""}" data-key="${key}">
        <span class="chip-flag">${c.flag}</span>
        <span class="chip-name">${c.name}</span>
        <span class="chip-check">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </label>`;
  }).join("");

  // click handlers
  grid.querySelectorAll(".country-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
      updateSelectedCount();
    });
  });

  updateSelectedCount();
}

function getSelectedKeys() {
  return [...document.querySelectorAll(".country-chip.selected")].map(c => c.dataset.key);
}

function updateSelectedCount() {
  const n   = getSelectedKeys().length;
  const btn = document.getElementById("calculate-btn");
  const txt = document.getElementById("selected-count");
  btn.disabled = n === 0;
  txt.textContent = n === 0 ? "Select at least 1 country" : `${n} countr${n===1?"y":"ies"} selected`;
}

function selectCountries(keys) {
  document.querySelectorAll(".country-chip").forEach(chip => {
    chip.classList.toggle("selected", keys.includes(chip.dataset.key));
  });
  updateSelectedCount();
}

/* ── RESULTS TABLE ──────────────────────────────────────── */
function renderResults(results, currency, period) {
  const body    = document.getElementById("results-body");
  const section = document.getElementById("results-section");
  const meta    = document.getElementById("results-meta");

  appState.results  = results;
  appState.currency = currency;
  appState.period   = period;

  section.classList.remove("hidden");

  const gross  = results[0]?.gross || 0;
  const maxNet = results[0]?.net   || 1;

  const periodLabel = period === "monthly" ? "/ month" : "/ year";
  const divider     = period === "monthly" ? 12 : 1;
  const rate        = appState.rates;

  meta.textContent = `Gross: ${formatCurrency(convertCurrency(gross, currency, rate), currency)} ${periodLabel}  ·  ${results.length} countries  ·  ${appState.type === "selfemployed" ? "Self-Employed" : "Employee"} mode`;

  renderSummaryBar(results, currency, period, divider, rate);

  body.innerHTML = results.map((r, i) => {
    const rank       = i + 1;
    const badgeClass = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "normal";
    const badgeText  = rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank;

    const net  = convertCurrency(r.net  / divider, currency, rate);
    const tax  = convertCurrency(r.incomeTax / divider, currency, rate);
    const ss   = convertCurrency(r.socialSecurity / divider, currency, rate);
    const grss = convertCurrency(r.gross / divider, currency, rate);

    const rateCls = r.effectiveRate < 25 ? "rate-low" : r.effectiveRate < 40 ? "rate-medium" : "rate-high";
    const barW    = Math.round((r.net / maxNet) * 100);

    return `
      <tr class="rank-${rank}">
        <td class="col-rank"><span class="rank-badge ${badgeClass}">${badgeText}</span></td>
        <td class="col-country">
          <div class="country-cell">
            <span class="country-flag-cell">${r.flag}</span>
            <span class="country-name-cell">${r.countryName}</span>
          </div>
        </td>
        <td class="col-gross">${formatCurrency(grss, currency)}</td>
        <td class="col-tax">−${formatCurrency(tax, currency)}</td>
        <td class="col-ss">−${formatCurrency(ss, currency)}</td>
        <td class="col-net">${formatCurrency(net, currency)}</td>
        <td><span class="rate-pill ${rateCls}">${r.effectiveRate.toFixed(1)}%</span></td>
        <td class="col-bar">
          <div class="bar-track"><div class="bar-fill" style="width:${barW}%"></div></div>
        </td>
      </tr>`;
  }).join("");

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSummaryBar(results, currency, period, divider, rate) {
  const bar  = document.getElementById("summary-bar");
  const best = results[0];
  const worst= results[results.length - 1];
  const avg  = results.reduce((s, r) => s + r.net, 0) / results.length;

  bar.innerHTML = `
    <div class="summary-card best">
      <div class="summary-label">🏆 Best Net Pay</div>
      <div class="summary-value">${formatCurrency(convertCurrency(best.net / divider, currency, rate), currency)}</div>
      <div class="summary-country">${best.flag} ${best.countryName} · keeps ${best.netKeptPct.toFixed(1)}%</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">📊 Average Net Pay</div>
      <div class="summary-value">${formatCurrency(convertCurrency(avg / divider, currency, rate), currency)}</div>
      <div class="summary-country">across ${results.length} countries</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">📉 Lowest Net Pay</div>
      <div class="summary-value">${formatCurrency(convertCurrency(worst.net / divider, currency, rate), currency)}</div>
      <div class="summary-country">${worst.flag} ${worst.countryName} · keeps ${worst.netKeptPct.toFixed(1)}%</div>
    </div>`;
}

/* ── SAVED SECTION ──────────────────────────────────────── */
function renderSavedSection() {
  const saved   = getSavedComparisons();
  const section = document.getElementById("saved-section");
  const list    = document.getElementById("saved-list");

  if (saved.length === 0) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");

  list.innerHTML = saved.map(s => `
    <div class="saved-item" data-id="${s.id}">
      <div class="saved-item-left">
        <div class="saved-item-name">${escHtml(s.name)}</div>
        <div class="saved-item-meta">
          ${formatCurrency(s.salary, s.currency)} · ${s.selectedKeys.length} countries · ${s.type} · ${s.date}
        </div>
      </div>
      <div class="saved-item-actions">
        <button class="saved-load-btn" data-id="${s.id}">Load</button>
        <button class="saved-del-btn"  data-id="${s.id}">✕</button>
      </div>
    </div>`).join("");

  list.querySelectorAll(".saved-load-btn").forEach(btn => {
    btn.addEventListener("click", () => loadSavedItem(Number(btn.dataset.id)));
  });
  list.querySelectorAll(".saved-del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteComparison(Number(btn.dataset.id));
      renderSavedSection();
      showToast("Comparison deleted");
    });
  });
}

function loadSavedItem(id) {
  const saved = getSavedComparisons().find(s => s.id === id);
  if (!saved) return;
  document.getElementById("salary-input").value = saved.salary;
  setActiveCurrency(saved.currency);
  setActiveType(saved.type);
  setActivePeriod(saved.period);
  selectCountries(saved.selectedKeys);
  renderResults(saved.results, saved.currency, saved.period);
  showToast(`Loaded: ${saved.name}`);
  document.getElementById("card-top")?.scrollIntoView({ behavior: "smooth" });
}

/* ── TOAST ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ── TOGGLE HELPERS ─────────────────────────────────────── */
function setActiveCurrency(cur) {
  appState.currency = cur;
  document.querySelectorAll(".currency-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.currency === cur);
  });
  const symbols = { EUR:"€", USD:"$", GBP:"£", CHF:"₣" };
  document.getElementById("currency-symbol").textContent = symbols[cur] || "€";
}

function setActiveType(type) {
  appState.type = type;
  document.querySelectorAll(".type-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.type === type);
  });
}

function setActivePeriod(period) {
  appState.period = period;
  document.querySelectorAll(".period-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.period === period);
  });
}

/* ── SORT ───────────────────────────────────────────────── */
function initSortHandlers() {
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (appState.sortCol === col) {
        appState.sortDir = appState.sortDir === "desc" ? "asc" : "desc";
      } else {
        appState.sortCol = col;
        appState.sortDir = "desc";
      }
      const sorted = [...appState.results].sort((a, b) =>
        appState.sortDir === "desc" ? b[col] - a[col] : a[col] - b[col]
      );
      document.querySelectorAll("th.sortable").forEach(t => {
        t.classList.remove("active-sort");
        t.querySelector(".sort-icon").textContent = "↕";
      });
      th.classList.add("active-sort");
      th.querySelector(".sort-icon").textContent = appState.sortDir === "desc" ? "↓" : "↑";
      renderResults(sorted, appState.currency, appState.period);
    });
  });
}

/* ── SHARE URL ──────────────────────────────────────────── */
function buildShareURL() {
  const salary = document.getElementById("salary-input").value;
  const keys   = getSelectedKeys().join(",");
  const url    = new URL(window.location.href);
  url.searchParams.set("salary",   salary);
  url.searchParams.set("countries",keys);
  url.searchParams.set("currency", appState.currency);
  url.searchParams.set("type",     appState.type);
  return url.toString();
}

function readShareURL() {
  const p = new URLSearchParams(window.location.search);
  if (p.get("salary")) {
    document.getElementById("salary-input").value = p.get("salary");
    if (p.get("currency")) setActiveCurrency(p.get("currency"));
    if (p.get("type"))     setActiveType(p.get("type"));
    if (p.get("countries")) selectCountries(p.get("countries").split(","));
    return true;
  }
  return false;
}

/* ── UTILS ──────────────────────────────────────────────── */
function escHtml(str) {
  return str.replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[m]);
}
