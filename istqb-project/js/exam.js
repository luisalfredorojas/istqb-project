let questions = [];
let currentPage = 0;
const QUESTIONS_PER_PAGE = 2;
let responses = {};
let timer = 7200; // 120 minutos

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
    const timerEl = document.getElementById('timer');
    const interval = setInterval(() => {
      if (timer <= 0) {
        clearInterval(interval);
        alert('Tiempo finalizado');
        showResults();
        disableNavigation();
        return;
      }
      timer--;
      timerEl.textContent = formatTime(timer);
    }, 1000);
  }
  

function renderProgressPanel() {
  const progressList = document.getElementById('progress-list');
  progressList.innerHTML = '';
  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.textContent = q.id;
    btn.className = responses[q.id] !== undefined ? 'answered' : 'unanswered';
    btn.addEventListener('click', () => {
      currentPage = Math.floor(idx / QUESTIONS_PER_PAGE);
      renderQuestions();
    });
    progressList.appendChild(btn);
  });
}

function renderQuestions() {
  const container = document.getElementById('question-container');
  container.innerHTML = '';
  const start = currentPage * QUESTIONS_PER_PAGE;
  const end = start + QUESTIONS_PER_PAGE;
  const slice = questions.slice(start, end);

  slice.forEach((q, i) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `<p><strong>${q.id}. ${q.question}</strong></p>`;
    q.options.forEach((opt, idx) => {
      const checked = responses[q.id] === idx ? 'checked' : '';
      block.innerHTML += `
        <label>
          <input type="radio" name="q${q.id}" value="${idx}" ${checked}>
          ${opt}
        </label><br>`;
    });
    container.appendChild(block);
  });

  document.querySelectorAll('input[type=radio]').forEach(input => {
    input.addEventListener('change', (e) => {
      const questionId = parseInt(e.target.name.slice(1));
      responses[questionId] = parseInt(e.target.value);
      renderProgressPanel();
    });
  });

  renderProgressPanel();
}

function showResults() {
  const container = document.getElementById('question-container');
  container.innerHTML = '<h2>Resultados del Examen</h2>';

  let correctCount = 0;
  questions.forEach((q) => {
    const userAnswer = responses[q.id];
    const isCorrect = userAnswer === q.correctIndex;
    if (isCorrect) correctCount++;

    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
      <p><strong>${q.id}. ${q.question}</strong></p>
      <p>Tu respuesta: <span style="color:${isCorrect ? 'green' : 'red'}">${q.options[userAnswer] || 'No respondida'}</span></p>
      <p>Respuesta correcta: <strong>${q.options[q.correctIndex]}</strong></p>
      <hr>
    `;
    container.appendChild(block);
  });

  const score = document.createElement('div');
  score.innerHTML = `<h3>Resultado final: ${correctCount} de ${questions.length} correctas</h3>`;
  container.prepend(score);

  // Ocultar navegación y progreso
  document.querySelector('.navigation').style.display = 'none';
  document.getElementById('progress-panel').style.display = 'none';
}

function loadExamData() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'foundation';
  fetch(`data/${type}.json`)
    .then(res => res.json())
    .then(data => {
      questions = data;
      renderQuestions();
      startTimer();
    })
    .catch(err => {
      alert('Error cargando el examen');
      console.error(err);
    });
}

function disableNavigation() {
    document.getElementById('next-btn').disabled = true;
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('finish-btn').disabled = true;
  
    document.querySelectorAll('input[type=radio]').forEach(input => {
      input.disabled = true;
    });
  }
  

window.addEventListener('DOMContentLoaded', () => {
  loadExamData();

  document.getElementById('next-btn').addEventListener('click', () => {
    if ((currentPage + 1) * QUESTIONS_PER_PAGE < questions.length) {
      currentPage++;
      renderQuestions();
    }
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      renderQuestions();
    }
  });

  document.getElementById('finish-btn').addEventListener('click', () => {
    if (confirm("¿Estás seguro de que deseas finalizar el examen?")) {
      showResults();
    }
  });
});
