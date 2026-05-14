const API_BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", async function () {
  const weightValue = document.getElementById("weightValue");
  const lastMeasurement = document.getElementById("lastMeasurement");
  const input = document.getElementById("weightInput");
  const button = document.getElementById("saveBtn");

  await loadLatestWeight();
  await loadWeightChart(parseInt(document.getElementById("chartFilter").value));

  // GET latest weight
  async function loadLatestWeight() {
    const response = await fetch(`${API_BASE_URL}/weights`);
    const data = await response.json();

    if (data.length > 0) {
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const latest = data[data.length - 1];
      weightValue.textContent = latest.weight;
      lastMeasurement.textContent = new Date(latest.date).toLocaleDateString("de-DE");

      const firstName = latest.first_name ?? latest.name ?? "Nutzer";
      document.querySelector(".welcome h1").textContent =
        `Willkommen zurück, ${firstName}!`;
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

    await loadWeightChart(parseInt(document.getElementById("chartFilter").value));
  }

  // Motivationsnachricht anzeigen
  function showMotivation(diff) {
    const messages = [
      `Super Erfolg! ${diff} KG weniger. Weiter so! 💪`,
      `Wahnsinn! Du hast ${diff} KG abgenommen!✨`,
      `${diff} KG runter. Du rockst das!🏋️‍♂️`,
      `Fantastisch! Minus ${diff} KG! Jetzt nur nicht nachlassen!☝️`,
      `Du bist unaufhaltbar! ${diff} KG weniger!🏆`
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

  async function loadWeightChart(days = 30) {
      const response = await fetch(`${API_BASE_URL}/weights`);
      let data = await response.json();

      data.sort((a, b) => new Date(a.date) - new Date(b.date));

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      data = data.filter(d => new Date(d.date) >= cutoff);

      const svg = document.querySelector(".chart-svg");
      svg.querySelectorAll(".chart-line, .point, .axis-label, .grid-line").forEach(el => el.remove());

      if (data.length === 0) return;

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

    points.forEach(p => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", padT);
      line.setAttribute("x2", p.x);
      line.setAttribute("y2", H - padB);
      line.setAttribute("class", "grid-line");
      svg.appendChild(line);
    });

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
      label.textContent = p.date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
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

  document.getElementById("chartFilter").addEventListener("change", e => {
    loadWeightChart(parseInt(e.target.value));
  });
});