const API_BASE_URL = "";

document.addEventListener("DOMContentLoaded", async function () {
  const weightValue = document.getElementById("weightValue");
  const lastMeasurement = document.getElementById("lastMeasurement");
  const input = document.getElementById("weightInput");
  const button = document.getElementById("saveBtn");

  // Dropdown-Element (pass auf, dass die ID im HTML stimmt)
  const filterSelect = document.getElementById("chartFilter");

  await loadLatestWeight();
  await loadWeightChart(filterSelect ? filterSelect.value : "jährlich");

  // Bei Änderung des Dropdowns Chart neu laden
  if (filterSelect) {
    filterSelect.addEventListener("change", async () => {
      await loadWeightChart(filterSelect.value);
    });
  }

  // GET latest weight
  async function loadLatestWeight() {
    const response = await fetch(`${API_BASE_URL}/weights`);
    const data = await response.json();

    if (data.length > 0) {
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const latest = data[data.length - 1];
      weightValue.textContent = latest.weight;
      lastMeasurement.textContent = new Date(latest.date).toLocaleDateString("de-DE");
    }
  }

  // POST new weight
  async function saveWeight() {
    const value = parseFloat(input.value.replace(",", "."));

    if (isNaN(value)) {
      alert("Bitte ein gültiges Gewicht eingeben.");
      return;
    }

    if (value < 0 || value > 200) {
      alert("Das Gewicht muss zwischen 0 und 200 kg liegen.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/weights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Dieter",
        weight: value,
        date: new Date().toISOString().split("T")[0]
      })
    });

    if (!response.ok) {
      alert("Speichern fehlgeschlagen");
      return;
    }

    const previousWeight = parseFloat(weightValue.textContent);
    if (!isNaN(previousWeight) && value < previousWeight) {
      const diff = (previousWeight - value).toFixed(1);
      showMotivation(diff);
    }

    weightValue.textContent = value;
    lastMeasurement.textContent = new Date().toLocaleDateString("de-DE");
    input.value = "";

    await loadWeightChart(filterSelect ? filterSelect.value : "jährlich");
  }

  // Motivationsnachricht anzeigen
  function showMotivation(diff) {
    const messages = [
      `Super Erfolg! ${diff} KG weniger. Weiter so! 💪`,
      `Wahnsinn! Du hast ${diff} KG abgenommen!✨`,
      `${diff} KG runter. Du rockst das!🏋️‍♂️`,
      `Fantastisch! Minus ${diff} KG!  Jetzt nur nicht nachlassen!☝️`,
      `Dieter, du bist unaufhaltbar! ${diff} KG weniger!🏆`
    ];
    const text = messages[Math.floor(Math.random() * messages.length)];

    const existing = document.getElementById("motivationToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "motivationToast";
    toast.textContent = text;
    toast.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: linear-gradient(135deg, rgba(124,108,246,0.92), rgba(46,211,211,0.85));
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 18px 32px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.25);
      box-shadow: 0 16px 48px rgba(0,0,0,0.35);
      backdrop-filter: blur(16px);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.4s ease, transform 0.4s ease;
      white-space: nowrap;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
      setTimeout(() => toast.remove(), 400);
    }, 8000);
  }

  // Filtert Daten je nach ausgewähltem Zeitraum
  function filterData(data, mode) {
    const now = new Date();
    let cutoff;

    if (mode === "wöchentlich") {
      // Letzte 7 Tage
      cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 7);
    } else if (mode === "monatlich") {
      // Letzte 30 Tage
      cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 30);
    } else {
      // Jährlich: letztes Jahr (365 Tage)
      cutoff = new Date(now);
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    return data.filter(d => new Date(d.date) >= cutoff);
  }

  async function loadWeightChart(mode = "jährlich") {
    const response = await fetch(`${API_BASE_URL}/weights`);
    const allData = await response.json();

    allData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Daten nach gewähltem Zeitraum filtern
    const data = filterData(allData, mode);

    const svg = document.querySelector(".chart-svg");
    svg.querySelectorAll(".chart-line, .point, .axis-label, .grid-line, .no-data-msg").forEach(el => el.remove());

    // Keine Daten im Zeitraum: Hinweis anzeigen
    if (!data || data.length === 0) {
      const msg = document.createElementNS("http://www.w3.org/2000/svg", "text");
      msg.setAttribute("x", "50%");
      msg.setAttribute("y", "50%");
      msg.setAttribute("text-anchor", "middle");
      msg.setAttribute("dominant-baseline", "middle");
      msg.setAttribute("class", "no-data-msg");
      msg.setAttribute("fill", "rgba(255,255,255,0.4)");
      msg.setAttribute("font-size", "16");
      msg.textContent = "Keine Daten für diesen Zeitraum";
      svg.appendChild(msg);
      return;
    }

    const W = 760, H = 270;
    const padL = 40, padR = 40, padT = 35, padB = 70;

    const weights = data.map(d => d.weight);
    const minW = Math.min(...weights) - 5;
    const maxW = Math.max(...weights) + 5;
    const n = data.length;

    const points = data.map((d, i) => {
      const x = padL + (i / (n - 1 || 1)) * (W - padL - padR);
      const y = padT + (1 - (d.weight - minW) / (maxW - minW)) * (H - padT - padB);
      return { x, y, weight: d.weight, date: new Date(d.date) };
    });

    // Vertikale Gitterlinien
    points.forEach(p => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", padT);
      line.setAttribute("x2", p.x);
      line.setAttribute("y2", H - padB);
      line.setAttribute("class", "grid-line");
      svg.appendChild(line);
    });

    // Kurve (Bézier)
    let dPath = `M${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      dPath += ` C${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", dPath);
    path.setAttribute("class", "chart-line");
    svg.appendChild(path);

    // Datumformat je nach Modus
    function formatDate(date, mode) {
      if (mode === "wöchentlich") {
        // Wochentag + Tag
        return date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit" });
      } else if (mode === "monatlich") {
        // Tag + Monat
        return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      } else {
        // Monat + Jahr (kurz)
        return date.toLocaleDateString("de-DE", { month: "2-digit", day: "2-digit" });
      }
    }

    // Punkte & Labels
    points.forEach((p, i) => {
      const isLast = i === points.length - 1;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", isLast ? 12 : 10);
      circle.setAttribute("class", isLast ? "point last" : "point");
      svg.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", p.x);
      label.setAttribute("y", H - padB + 30);
      label.setAttribute("class", "axis-label");
      label.setAttribute("text-anchor", "middle");
      label.textContent = formatDate(p.date, mode);
      svg.appendChild(label);

      const wLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      wLabel.setAttribute("x", p.x);
      wLabel.setAttribute("y", p.y - 16);
      wLabel.setAttribute("class", "axis-label");
      wLabel.setAttribute("text-anchor", "middle");
      wLabel.textContent = `${p.weight} kg`;
      svg.appendChild(wLabel);
    });
  }

  button.addEventListener("click", saveWeight);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveWeight();
  });
});