// Retrieves the high scores from local storage so that they can be displayed.

async function loadScores() {
  let scores = [];
  try {
    const response = await fetch("/api/scores");
    scores = await response.json();

    // Put scores in local storage in case we go offline.
    localStorage.setItem("scores", JSON.stringify(scores));
  } catch {
    const scoresText = localStorage.getItem("scores");
    if (scoresText) {
      scores = JSON.parse(scoresText);
    }
  }

  displayScores(scores);
}

function displayScores(scores) {
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
