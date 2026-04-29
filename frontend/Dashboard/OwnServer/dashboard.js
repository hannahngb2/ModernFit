document.addEventListener("DOMContentLoaded", function () {
  const weightValue = document.getElementById("weightValue");
  const lastMeasurement = document.getElementById("lastMeasurement");
  const input = document.getElementById("weightInput");
  const button = document.getElementById("saveBtn");

  function getTodayDate() {
    const today = new Date();
    return today.toLocaleDateString("de-DE");
  }

  function saveWeight() {
    const value = parseFloat(input.value.replace(",", "."));

    if (isNaN(value)) {
      alert("Bitte ein gültiges Gewicht eingeben.");
      return;
    }

    if (value < 0 || value > 200) {
      alert("Das Gewicht muss zwischen 0 und 200 kg liegen.");
      return;
    }

    weightValue.textContent = value;
    lastMeasurement.textContent = getTodayDate();
    input.value = "";
  }

  button.addEventListener("click", saveWeight);

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      saveWeight();
    }
  });
});