const viewMoreBtns = document.querySelectorAll('.viewMoreBtn');

viewMoreBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);

    targetSection.classList.toggle('collapsed');

    btn.style.display = 'none';
  });
});
