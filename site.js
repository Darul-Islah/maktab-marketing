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
document.querySelector('[data-open-privacy]').addEventListener('click', () => document.getElementById('privacy-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => { dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }); });
document.getElementById('interest-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  if (!name) { const input = form.elements.namedItem('name'); input.setCustomValidity('Please enter your name.'); input.reportValidity(); input.addEventListener('input', () => input.setCustomValidity(''), { once: true }); return; }
  const school = String(data.get('school') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = `Interested in Maktab${school ? ` - ${school}` : ''}`;
  const body = `Assalamu alaikum,\n\nI'm interested in learning more about Maktab.\n\nName: ${name}\n${school ? `School: ${school}\n` : ''}${message ? `\nWhat we'd like to make easier:\n${message}\n` : ''}\nPlease reach out to me at this email address.\n\nThank you,\n${name}`;
  window.location.href = `mailto:abdullah.siddiki@darulislah.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-status').textContent = 'Your email draft is ready to open. If your email app did not open, email abdullah.siddiki@darulislah.org directly. Your message has not been sent yet.';
});
document.getElementById('year').textContent = new Date().getFullYear();
