// Minimal working "What-If" score editor for the sandbox grades pages.
// Clicking a score swaps it for a number input; committing the value edits
// the same DOM text the real Canvas page uses, which is exactly what the
// extension's MutationObserver on #grades_summary reacts to — so grades
// recalculate live, the same way they would against a real Canvas What-If
// score edit.
(function () {
  function getScoreTextNode(gradeSpan) {
    // The template always places the plain numeric (or "-") score text as
    // the last child node of span.grade, after the tooltip/screenreader spans.
    let node = gradeSpan.lastChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      node = document.createTextNode(' ');
      gradeSpan.appendChild(node);
    }
    return node;
  }

  function showRevertPanel() {
    const panel = document.getElementById('student-grades-revert');
    if (panel) panel.style.display = 'block';
  }

  function hideRevertPanel() {
    const panel = document.getElementById('student-grades-revert');
    if (panel) panel.style.display = 'none';
  }

  function startEdit(gradeSpan) {
    if (gradeSpan.querySelector('input.whatif-input')) return;

    const textNode = getScoreTextNode(gradeSpan);
    const current = (textNode.textContent || '').trim();

    if (gradeSpan.dataset.original === undefined) {
      gradeSpan.dataset.original = current;
    }

    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.className = 'whatif-input';
    input.value = current === '-' ? '' : current;
    input.placeholder = '–';

    textNode.textContent = ' ';
    gradeSpan.appendChild(input);
    input.focus();
    input.select();

    function commit(cancelled) {
      input.removeEventListener('blur', onBlur);
      if (!input.isConnected) return;
      input.remove();

      if (cancelled) {
        textNode.textContent = ' ' + gradeSpan.dataset.original + ' ';
        return;
      }

      const raw = input.value.trim();
      if (raw === '') {
        textNode.textContent = ' ' + gradeSpan.dataset.original + ' ';
        return;
      }

      const num = parseFloat(raw);
      if (isNaN(num)) {
        textNode.textContent = ' ' + gradeSpan.dataset.original + ' ';
        return;
      }

      textNode.textContent = ' ' + num + ' ';
      gradeSpan.classList.add('whatif-edited');
      showRevertPanel();
    }

    function onBlur() {
      commit(false);
    }

    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        commit(true);
      }
    });
  }

  function revertAll() {
    document.querySelectorAll('#grades_summary span.grade.whatif-edited').forEach(function (gradeSpan) {
      const textNode = getScoreTextNode(gradeSpan);
      textNode.textContent = ' ' + gradeSpan.dataset.original + ' ';
      gradeSpan.classList.remove('whatif-edited');
    });
    hideRevertPanel();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#grades_summary td.assignment_score').forEach(function (td) {
      const gradeSpan = td.querySelector('span.grade[tabindex="0"]');
      if (!gradeSpan) return;
      td.style.cursor = 'pointer';
      td.addEventListener('click', function () {
        startEdit(gradeSpan);
      });
    });

    // The "Show Saved What-If Scores" button has no meaning without a real
    // saved-guess-score backend behind it — hide it so it's not a dead control.
    const showSaved = document.getElementById('student-grades-whatif');
    if (showSaved) showSaved.style.display = 'none';

    hideRevertPanel();

    const revertBtn = document.getElementById('revert-all-to-actual-score');
    if (revertBtn) {
      revertBtn.addEventListener('click', function (e) {
        e.preventDefault();
        revertAll();
      });
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    span.grade.whatif-edited { color: #a94442; font-style: italic; }
    input.whatif-input {
      width: 56px;
      font: inherit;
      padding: 1px 4px;
      border: 1px solid #2b7abc;
      border-radius: 3px;
      text-align: right;
    }
    td.assignment_score:hover { background-color: rgba(43, 122, 188, 0.06); }
  `;
  document.head.appendChild(style);
})();
