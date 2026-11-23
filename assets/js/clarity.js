(function () {
  'use strict';
  var form = document.getElementById('clarity-form');
  var button = form.querySelector('button[type="submit"]');
  var error = document.getElementById('form-error');
  var success = document.getElementById('form-success');
  var submissionId = crypto.randomUUID();
  var source = {};
  var params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
    if (params.has(key)) source[key] = params.get(key).slice(0, 200);
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    var data = Object.fromEntries(new FormData(form));
    data.version = 'clarity-v1';
    data.id = submissionId;
    data.source = source;
    error.hidden = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 25000);
    try {
      var response = await fetch('https://hello.brandonhuston.com/api/clarity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: controller.signal, credentials: 'omit'
      });
      var result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'We could not save your answers. Please try Submit again.');
      document.getElementById('lead-reference').textContent = result.reference;
      form.hidden = true;
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ block: 'center' });
    } catch (problem) {
      error.textContent = problem instanceof TypeError || problem.name === 'AbortError'
        ? 'We could not confirm your submission. Check your connection and try Submit again. Your answers are still here.'
        : problem.message;
      error.hidden = false;
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = 'Submit';
      form.removeAttribute('aria-busy');
    }
  });
}());
