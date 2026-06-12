/**
 * main.js — Entry point. Wires everything together on DOMContentLoaded.
 */

document.addEventListener("DOMContentLoaded", async () => {

  /* 1. Render country chips */
  renderCountryGrid();

  /* 2. Restore settings from localStorage */
  const settings = getSettings();
  setActiveCurrency(settings.currency);
  setActiveType(settings.type);
  setActivePeriod(settings.period);

  /* 3. Restore last salary input */
  const last = getLastInput();
  if (last?.salary) document.getElementById("salary-input").value = last.salary;

  /* 4. Fetch live exchange rates (Frankfurter API — European Central Bank data) */
  await fetchLiveRates();

  /* 5. Check for share URL params and auto-run if present */
  if (readShareURL()) {
    setTimeout(runCalculation, 300);
  }

  /* 6. Render any saved comparisons */
  renderSavedSection();

  /* 7. Sort column handlers */
  initSortHandlers();

  /* ── EVENT LISTENERS ── */

  // Calculate button
  document.getElementById("calculate-btn").addEventListener("click", runCalculation);

  // Salary input — Enter key
  document.getElementById("salary-input").addEventListener("keydown", e => {
    if (e.key === "Enter") runCalculation();
  });

  // Currency toggle
  document.querySelectorAll(".currency-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveCurrency(btn.dataset.currency);
      saveSettings({ currency: appState.currency, type: appState.type, period: appState.period });
      // Re-render with new currency if results exist
      if (appState.results.length) {
        renderResults(appState.results, appState.currency, appState.period);
      }
    });
  });

  // Employment type toggle
  document.querySelectorAll(".type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveType(btn.dataset.type);
      saveSettings({ currency: appState.currency, type: appState.type, period: appState.period });
    });
  });

  // Period toggle
  document.querySelectorAll(".period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setActivePeriod(btn.dataset.period);
      saveSettings({ currency: appState.currency, type: appState.type, period: appState.period });
      if (appState.results.length) {
        renderResults(appState.results, appState.currency, appState.period);
      }
    });
  });

  // Country quick-select buttons
  document.getElementById("select-all").addEventListener("click", () => {
    selectCountries(Object.keys(COUNTRIES));
  });
  document.getElementById("select-none").addEventListener("click", () => {
    selectCountries([]);
  });
  document.getElementById("select-popular").addEventListener("click", () => {
    selectCountries(POPULAR_COUNTRIES);
  });

  // Save button (show panel)
  document.getElementById("save-btn").addEventListener("click", () => {
    const panel = document.getElementById("save-panel");
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      document.getElementById("save-name").focus();
    }
  });

  // Save confirm
  document.getElementById("save-confirm-btn").addEventListener("click", () => {
    const name    = document.getElementById("save-name").value;
    const salary  = Number(document.getElementById("salary-input").value);
    const keys    = getSelectedKeys();
    const saved   = saveComparison(name, salary, appState.currency, appState.type, appState.period, keys, appState.results);
    if (saved) {
      showToast(`✓ Saved: ${saved.name}`);
      document.getElementById("save-name").value = "";
      document.getElementById("save-panel").classList.add("hidden");
      renderSavedSection();
    }
  });

  // Save cancel
  document.getElementById("save-cancel-btn").addEventListener("click", () => {
    document.getElementById("save-panel").classList.add("hidden");
  });

  // Save on Enter in name field
  document.getElementById("save-name").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("save-confirm-btn").click();
  });

  // Share button
  document.getElementById("share-btn").addEventListener("click", async () => {
    const url = buildShareURL();
    try {
      await navigator.clipboard.writeText(url);
      showToast("✓ Share link copied to clipboard!");
    } catch {
      prompt("Copy this link:", url);
    }
  });

  // Clear all saved
  document.getElementById("clear-all-btn").addEventListener("click", () => {
    if (confirm("Delete all saved comparisons?")) {
      clearAllComparisons();
      renderSavedSection();
      showToast("All saved comparisons cleared");
    }
  });

});

/* ── MAIN CALCULATION RUNNER ─────────────────────────────── */
function runCalculation() {
  const salaryInput = document.getElementById("salary-input");
  const raw = Number(salaryInput.value);

  // Validate
  if (!raw || raw < 100 || raw > 10000000) {
    salaryInput.focus();
    salaryInput.style.outline = "2px solid #DC2626";
    setTimeout(() => salaryInput.style.outline = "", 1500);
    showToast("⚠️  Please enter a valid salary (100 – 10,000,000)");
    return;
  }

  const selectedKeys = getSelectedKeys();
  if (selectedKeys.length === 0) {
    showToast("⚠️  Select at least one country");
    return;
  }

  // Convert input to EUR if user entered in another currency
  let grossEUR = raw;
  if (appState.currency !== "EUR" && appState.rates[appState.currency]) {
    grossEUR = raw / appState.rates[appState.currency];
  }
  // If period is monthly, treat input as monthly → convert to annual
  if (appState.period === "monthly") {
    grossEUR = grossEUR * 12;
  }

  // Animate button
  const btn = document.getElementById("calculate-btn");
  btn.disabled = true;
  btn.querySelector(".btn-text").textContent = "Calculating…";

  setTimeout(() => {
    const results = calculateAll(grossEUR, selectedKeys, appState.type);
    renderResults(results, appState.currency, appState.period);
    saveLastInput(raw, selectedKeys);
    saveSettings({ currency: appState.currency, type: appState.type, period: appState.period });

    btn.disabled = false;
    btn.querySelector(".btn-text").textContent = "Calculate Net Salary";
  }, 120); // tiny delay makes it feel snappy not instant
}
