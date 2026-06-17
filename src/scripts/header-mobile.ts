const btn = document.getElementById('mobile-menu-btn');
const drawer = document.getElementById('mobile-drawer');
if (btn && drawer) {
  btn.addEventListener('click', () => {
    const open = drawer.hidden === false;
    drawer.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }));
}
export {};
