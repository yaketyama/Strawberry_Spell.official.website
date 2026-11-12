(() => {
  const root = document.body.dataset.root || './';

  const loader = document.querySelector('.entryLoader');
  if (loader) {
    if (sessionStorage.getItem('strawberry-entry-seen')) {
      loader.remove();
    } else {
      sessionStorage.setItem('strawberry-entry-seen', '1');
      setTimeout(() => loader.classList.add('isOpening'), 300);
      setTimeout(() => loader.remove(), 2100);
    }
  }

  const menuButton = document.querySelector('.mobileMenuButton');
  const backdrop = document.querySelector('.mobileMenuBackdrop');
  const panel = document.querySelector('.mobileMenuPanel');
  const closeButton = panel?.querySelector('button');
  const setMenu = (open) => {
    document.body.classList.toggle('mobileMenuOpen', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    backdrop?.classList.toggle('isOpen', open);
    panel?.classList.toggle('isOpen', open);
  };
  menuButton?.addEventListener('click', () => setMenu(true));
  backdrop?.addEventListener('click', () => setMenu(false));
  closeButton?.addEventListener('click', () => setMenu(false));
  panel?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const bgmWrap = document.querySelector('.bgmControl');
  if (bgmWrap) {
    const oldVolume = bgmWrap.querySelector('.bgmVolume');
    if (oldVolume) oldVolume.innerHTML = '<span aria-hidden="true">🔊</span><input class="staticVolume" type="range" min="0" max="100" value="40" aria-label="BGM音量"><span class="staticVolumeLabel">40%</span>';
    const audio = new Audio(`${root}audio/ichigo-no-mahou.mp3`);
    audio.loop = true;
    audio.volume = 0.4;
    const play = bgmWrap.querySelector('.bgmButton');
    const range = bgmWrap.querySelector('.staticVolume');
    const label = bgmWrap.querySelector('.staticVolumeLabel');
    play?.addEventListener('click', async () => {
      if (audio.paused) { await audio.play(); play.classList.add('isPlaying'); play.setAttribute('aria-pressed', 'true'); }
      else { audio.pause(); play.classList.remove('isPlaying'); play.setAttribute('aria-pressed', 'false'); }
    });
    range?.addEventListener('input', () => { audio.volume = Number(range.value) / 100; label.textContent = `${range.value}%`; });
  }

  const castGrid = document.querySelector('.castGrid');
  if (castGrid) {
    fetch(`${root}js/profiles.json`).then((r) => r.json()).then((profiles) => {
      document.querySelectorAll('.castCard').forEach((button) => {
        button.addEventListener('click', () => {
          const name = button.querySelector('h3')?.textContent?.trim();
          const profile = profiles[name];
          if (!profile) return;
          const dialog = document.createElement('dialog');
          dialog.className = 'profileDialog staticDialog';
          const intro = profile.intro.split('\n').map((line) => line || '<br>').join('<br>');
          dialog.innerHTML = `<button class="staticDialogClose" type="button" aria-label="閉じる">×</button>
            <div class="profilePhoto"><img src="${root}${profile.image.replace(/^\//, '')}" alt="${profile.name}"></div>
            <div class="profileBody"><div class="profileHeader"><span class="profileRole">${profile.roleEn} / ${profile.role}</span><h2 class="profileName">${profile.name}</h2><p class="profileColor">IMAGE COLOR　${profile.color}</p></div><p class="profileIntro">${intro}</p><div class="profileMessage"><span>MESSAGE</span><p>${profile.message}</p></div></div>`;
          document.body.append(dialog);
          dialog.querySelector('.staticDialogClose').addEventListener('click', () => dialog.close());
          dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
          dialog.addEventListener('close', () => dialog.remove());
          dialog.showModal();
        });
      });
    });
  }
})();
