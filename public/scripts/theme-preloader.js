(function() {
  var theme = localStorage.getItem('course-theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  var level = localStorage.getItem('course-level-mode');
  if (level) document.documentElement.setAttribute('data-level', level);
  var focus = localStorage.getItem('course-focus-mode');
  if (focus) document.documentElement.setAttribute('data-focus', focus);
})();
