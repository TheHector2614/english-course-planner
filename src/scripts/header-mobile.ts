const btn = document.getElementById('mobile-menu-btn');
const drawer = document.getElementById('mobile-drawer');
if (btn && drawer) {
  btn.addEventListener('click', () => {
    const wasOpen = !drawer.hidden;
    drawer.hidden = wasOpen;
    btn.setAttribute('aria-expanded', String(!wasOpen));
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }));
}
export {};
