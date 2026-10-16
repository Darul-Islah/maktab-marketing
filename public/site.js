const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const preference = window.matchMedia('(prefers-color-scheme: dark)');
function savedTheme() { try { return localStorage.getItem('maktab-theme'); } catch { return null; } }
function applyTheme(theme) { root.dataset.theme = theme; themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`); }
applyTheme(savedTheme() || (preference.matches ? 'dark' : 'light'));
themeButton.addEventListener('click', () => { const theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(theme); try { localStorage.setItem('maktab-theme', theme); } catch {} });
preference.addEventListener('change', event => { if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light'); });
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); navigation.classList.toggle('is-open', open); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const tabs = [...document.querySelectorAll('[role=tab]')];
function selectTab(tab, focus = false) { for (const item of tabs) { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; } if (focus) tab.focus(); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectTab(tab)); tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight') target = (index + 1) % tabs.length; if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length; if (event.key === 'Home') target = 0; if (event.key === 'End') target = tabs.length - 1; if (target !== undefined) { event.preventDefault(); selectTab(tabs[target], true); } }); });
const imageDialog = document.getElementById('image-dialog');
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => { const image = document.getElementById('dialog-image'); image.src = button.dataset.image; image.alt = button.dataset.caption; document.getElementById('dialog-caption').textContent = button.dataset.caption; imageDialog.showModal(); }));
document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click', () => document.getElementById('privacy-dialog').showModal()));
document.querySelectorAll('dialog').forEach(dialog => { dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }); });
// Forms post JSON to the site's Worker (/api/contact, /api/waitlist), which emails the team.
const CONTACT = 'abdullah.siddiki@darulislah.org';
const pageStarted = Date.now();
document.querySelectorAll('form[data-endpoint]').forEach(form => {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type=submit]');
  const say = (message, isError) => { status.textContent = message; status.classList.toggle('is-error', !!isError); };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) field.setCustomValidity('');
    const email = form.elements.namedItem('email');
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) email.setCustomValidity('Please enter a valid email address.');
    for (const field of form.querySelectorAll('[required]')) if (!field.value.trim()) field.setCustomValidity('Please fill in this field.');
    if (!form.reportValidity()) return;
    const data = { started: pageStarted };
    const fd = new FormData(form);
    for (const key of new Set(fd.keys())) {
      const values = fd.getAll(key).map(v => String(v).trim());
      data[key] = form.querySelectorAll(`[name="${key}"][type=checkbox]`).length ? values : values[0];
    }
    button.disabled = true;
    say('Sending...');
    try {
      const response = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        const field = result.field && form.elements.namedItem(result.field);
        if (field) { field.setCustomValidity(result.error); field.reportValidity(); field.addEventListener('input', () => field.setCustomValidity(''), { once: true }); }
        throw new Error(result.error || 'Request failed');
      }
      const done = form.dataset.done && document.querySelector(form.dataset.done);
      form.hidden = true;
      if (done) { done.hidden = false; done.focus(); done.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    } catch (error) {
      button.disabled = false;
      say(`${error.message && error.message !== 'Request failed' && error.message !== 'Failed to fetch' ? error.message + ' ' : ''}If it keeps happening, email us at ${CONTACT}.`, true);
    }
  });
  form.querySelectorAll('input,textarea,select').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
});
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));
} else reveals.forEach(el => el.classList.add('is-visible'));

// Tour video: loads nothing until someone asks to play it (preload="none").
const tourVideo = document.getElementById('tour-video');
if (tourVideo) {
  const player = tourVideo.closest('.tour-player');
  const playTour = () => { tourVideo.play().catch(() => {}); };
  player.querySelector('.tour-play').addEventListener('click', playTour);
  // native controls only once it plays, so the poster stays clean
  tourVideo.addEventListener('play', () => { player.classList.add('is-playing'); tourVideo.controls = true; });
  tourVideo.addEventListener('ended', () => player.classList.remove('is-playing'));
  document.querySelectorAll('[data-play-tour]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('tour').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    playTour();
  }));
}
