import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://gngmaibtdfcnmqrelwgr.supabase.co'   // ← ersetzen
const SUPABASE_KEY = 'sb_publishable_5cclSCRIX5ewxeZ8rv3FVA_PBApLf3H'                    // ← ersetzen
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PERSONAL_ID = 1


document.addEventListener("DOMContentLoaded", async function () {
  const weightValue     = document.getElementById("weightValue")
  const lastMeasurement = document.getElementById("lastMeasurement")
  const input           = document.getElementById("weightInput")
  const button          = document.getElementById("saveBtn")

  // Letzten Eintrag beim Laden anzeigen
  await loadLatestWeight()
  await loadUserName()
  await loadWeightChart()

  // ── Letztes Gewicht laden ──────────────────────────────────────
  async function loadLatestWeight() {
    const { data, error } = await supabase
      .from('weight_data')
      .select('weight, created_at')
      .eq('personal_id', PERSONAL_ID)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Fehler beim Laden:', error.message)
      return
    }

    if (data && data.length > 0) {
      const latest = data[0]
      weightValue.textContent     = latest.weight
      lastMeasurement.textContent = new Date(latest.created_at)
        .toLocaleDateString("de-DE")
    }
  }
  //---- Client Name anzeigen ----------------------
  async function loadUserName() {
    const { data, error } = await supabase
      .from('personal_information')
      .select('first_name')
      .eq('id', PERSONAL_ID)
      .single()

    if (error) {
      console.error('Fehler beim Laden des Namens:', error.message)
      return
    }

    document.querySelector('.welcome h1').textContent =
      `Willkommen zurück, ${data.first_name}`
  }

  // ── Neues Gewicht speichern ────────────────────────────────────
  async function saveWeight() {
    const value = parseFloat(input.value.replace(",", "."))

    if (isNaN(value)) {
      alert("Bitte ein gültiges Gewicht eingeben.")
      return
    }
    if (value < 0 || value > 200) {
      alert("Das Gewicht muss zwischen 0 und 200 kg liegen.")
      return
    }

    const { error } = await supabase
      .from('weight_data')
      .insert({ weight: value, personal_id: 1 })

    if (error) {
      alert('Fehler beim Speichern: ' + error.message)
      return
    }

    // UI aktualisieren
    weightValue.textContent     = value
    lastMeasurement.textContent = new Date().toLocaleDateString("de-DE")
    input.value = ""

    await loadWeightChart()
  }

  // --------- Grafische Darstellung -----------

  async function loadWeightChart() {

   const days = parseInt(document.getElementById('chartFilter').value)
      const since = new Date()
      since.setDate(since.getDate() - days)

      let { data, error } = await supabase
      .from('weight_data')
      .select('weight, created_at')
      .eq('personal_id', PERSONAL_ID)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return

    const svg = document.querySelector('.chart-svg')

    // Alte statische Elemente entfernen
    svg.querySelectorAll('.chart-line, .point, .axis-label, .grid-line').forEach(el => el.remove())

    // Chart-Dimensionen
    const W = 760, H = 270
    const padL = 40, padR = 40, padT = 35, padB = 70

    const weights  = data.map(d => d.weight)
    const minW     = Math.min(...weights) - 5
    const maxW     = Math.max(...weights) + 5
    const n        = data.length

    // X/Y Koordinaten berechnen
    const points = data.map((d, i) => {
      const x = padL + (i / (n - 1 || 1)) * (W - padL - padR)
      const y = padT + (1 - (d.weight - minW) / (maxW - minW)) * (H - padT - padB)
      return { x, y, weight: d.weight, date: new Date(d.created_at) }
    })

    // Grid-Linien
    points.forEach(p => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', p.x); line.setAttribute('y1', padT)
      line.setAttribute('x2', p.x); line.setAttribute('y2', H - padB)
      line.setAttribute('class', 'grid-line')
      svg.appendChild(line)
    })

    // Smooth Kurve (Bezier)
    let d = `M${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], curr = points[i]
      const cx   = (prev.x + curr.x) / 2
      d += ` C${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('class', 'chart-line')
    svg.appendChild(path)

    // Punkte + Labels
    points.forEach((p, i) => {
      const isLast = i === points.length - 1

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', p.x)
      circle.setAttribute('cy', p.y)
      circle.setAttribute('r',  isLast ? 12 : 10)
      circle.setAttribute('class', isLast ? 'point last' : 'point')
      svg.appendChild(circle)

      // Datum unter dem Punkt
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', p.x)
      label.setAttribute('y', H - padB + 30)
      label.setAttribute('class', 'axis-label')
      label.setAttribute('text-anchor', 'middle')
      label.textContent = p.date.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit' })
      svg.appendChild(label)

      // Gewicht über dem Punkt
      const wLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      wLabel.setAttribute('x', p.x)
      wLabel.setAttribute('y', p.y - 16)
      wLabel.setAttribute('class', 'axis-label')
      wLabel.setAttribute('text-anchor', 'middle')
      wLabel.textContent = `${p.weight} kg`
      svg.appendChild(wLabel)
    })
  }

  button.addEventListener("click", saveWeight)
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveWeight()
  })

  document.getElementById('chartFilter').addEventListener('change', loadWeightChart)
})