// Retrieves the high scores from local storage so that they can be displayed.

function loadScores() {
  let scores = [];
  const scoresText = localStorage.getItem("scores");
  if (scoresText) {
    scores = JSON.parse(scoresText);
  }

  const tableBodyEl = document.querySelector("#scores");

  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      // Create the elements.
      const positionTdEl = document.createElement("td");
      const nameTdEl = document.createElement("td");
      const scoreTdEl = document.createElement("td");
      const dateTdEl = document.createElement("td");

      // Set the elements.
      positionTdEl.textContent = i + 1;
      nameTdEl.textContent = score.name;
      scoreTdEl.textContent = score.score;
      dateTdEl.textContent = score.date;

      // Append the elements to the HTML.
      const rowEl = document.createElement("tr");
      rowEl.appendChild(positionTdEl);
      rowEl.appendChild(nameTdEl);
      rowEl.appendChild(scoreTdEl);
      rowEl.appendChild(dateTdEl);

      tableBodyEl.appendChild(rowEl);
    }
  } else {
    tableBodyEl.innerHTML =
      "<tr><td colSpan=4>Be the first to score!</td></tr>";
  }
}

loadScores();
