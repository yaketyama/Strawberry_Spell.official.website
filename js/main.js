(() => {
  const root = document.body.dataset.root || './';
  const siteBase = new URL(root, window.location.href);

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
    const audio = new Audio(new URL('audio/ichigo-no-mahou.mp3', siteBase).href);
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

  let profilesPromise;
  const setupCast = () => {
    if (!document.querySelector('.castGrid')) return;
    profilesPromise ||= fetch(new URL('js/profiles.json', siteBase)).then((r) => r.json());
    profilesPromise.then((profiles) => {
      document.querySelectorAll('.castCard:not([data-static-bound])').forEach((button) => {
        button.dataset.staticBound = 'true';
        button.addEventListener('click', () => {
          const name = button.querySelector('h3')?.textContent?.trim();
          const profile = profiles[name];
          if (!profile) return;
          const dialog = document.createElement('dialog');
          dialog.className = 'profileDialog staticDialog';
          const intro = profile.intro.split('\n').map((line) => line || '<br>').join('<br>');
          dialog.innerHTML = `<button class="staticDialogClose" type="button" aria-label="閉じる">×</button>
            <div class="profilePhoto"><img src="${new URL(profile.image.replace(/^\//, ''), siteBase).href}" alt="${profile.name}"></div>
            <div class="profileBody"><div class="profileHeader"><span class="profileRole">${profile.roleEn} / ${profile.role}</span><h2 class="profileName">${profile.name}</h2><p class="profileColor">IMAGE COLOR　${profile.color}</p></div><p class="profileIntro">${intro}</p><div class="profileMessage"><span>MESSAGE</span><p>${profile.message}</p></div></div>`;
          document.body.append(dialog);
          dialog.querySelector('.staticDialogClose').addEventListener('click', () => dialog.close());
          dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
          dialog.addEventListener('close', () => dialog.remove());
          dialog.showModal();
        });
      });
    });
  };
  setupCast();

  const prepareFragmentLinks = (container, targetUrl) => {
    container.querySelectorAll('[href]').forEach((element) => {
      const value = element.getAttribute('href');
      if (value && !value.startsWith('#') && !/^(mailto:|tel:|javascript:)/i.test(value)) {
        element.setAttribute('href', new URL(value, targetUrl).href);
      }
    });
    container.querySelectorAll('[src]').forEach((element) => {
      const value = element.getAttribute('src');
      if (value) element.setAttribute('src', new URL(value, targetUrl).href);
    });
  };

  const navigateWithoutStoppingBgm = async (targetUrl, push = true) => {
    try {
      const response = await fetch(targetUrl.href);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextMain = nextDocument.querySelector('main');
      const currentMain = document.querySelector('main');
      if (!nextMain || !currentMain) throw new Error('main element not found');
      prepareFragmentLinks(nextMain, targetUrl);
      currentMain.replaceWith(nextMain);
      document.title = nextDocument.title;
      if (push) history.pushState({}, '', targetUrl.href);
      setMenu(false);
      setupCast();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      window.location.href = targetUrl.href;
    }
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin) return;
    const relativePath = targetUrl.pathname.slice(siteBase.pathname.length).replace(/^\//, '');
    if (!['', 'about/', 'cast/', 'join/'].includes(relativePath)) return;
    event.preventDefault();
    navigateWithoutStoppingBgm(targetUrl);
  });

  window.addEventListener('popstate', () => navigateWithoutStoppingBgm(new URL(window.location.href), false));
})();
