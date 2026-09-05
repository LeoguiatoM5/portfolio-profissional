'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = category === 'all' || card.dataset.category === category;
      card.hidden = !show;
      if (show) count++;
    });
    document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'projeto' : 'projetos'}`;
  });
});

let previousFocus;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(`project-${button.dataset.project}`);
    if (!dialog) return;
    previousFocus = button;
    closeMenu();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    dialog.querySelector('.dialog-close').focus({ preventScroll: true });
  });
});
document.querySelectorAll('.project-dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.querySelectorAll('video').forEach(video => video.pause());
    document.body.classList.remove('modal-open');
    if (previousFocus) previousFocus.focus({ preventScroll: true });
  });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const feedback = contactForm.querySelector('.form-feedback');
    button.disabled = true;
    button.textContent = 'Enviando…';
    feedback.hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST', body: new FormData(contactForm),
        headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok) throw new Error('Não foi possível enviar a mensagem.');
      feedback.textContent = 'Mensagem enviada com sucesso. Obrigado pelo contato!';
      feedback.className = 'form-feedback success';
      contactForm.reset();
    } catch (_) {
      feedback.textContent = 'Não foi possível enviar agora. Seus dados foram mantidos. Tente novamente ou escreva para leonardoguiato99@gmail.com.';
      feedback.className = 'form-feedback error';
    } finally {
      clearTimeout(timeout);
      feedback.hidden = false;
      button.disabled = false;
      button.textContent = 'Enviar mensagem ↗';
    }
  });
}
