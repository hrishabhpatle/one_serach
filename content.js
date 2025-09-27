(function() {
  let popup = null;
  let hideTimer = null;

  // Create popup element
  function createPopup() {
    popup = document.createElement('div');
    popup.className = 'mini-popup';
    popup.style.display = 'none';
    popup.innerHTML = `
      <div class="mini-popup-title"></div>
      <div class="mini-popup-extract"></div>
      <div class="mini-popup-footer">
        <button class="mini-popup-close">✕</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Close button
    popup.querySelector('.mini-popup-close').addEventListener('click', hidePopup);
  }

  // Show popup at given coordinates
  function showPopup(x, y, word) {
    const titleEl = popup.querySelector('.mini-popup-title');
    const extractEl = popup.querySelector('.mini-popup-extract');

    titleEl.textContent = word;
    extractEl.textContent = 'Loading...';
    popup.style.display = 'block';

    // Position above selection
    const padding = 8;
    popup.style.left = x + 'px';
    popup.style.top = y - popup.offsetHeight - padding + 'px';

    // Fetch Wikipedia summary
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`)
      .then(res => res.json())
      .then(data => {
        if (data.extract) {
          extractEl.textContent = data.extract;
        } else {
          extractEl.textContent = 'No information found.';
        }
      })
      .catch(err => {
        extractEl.textContent = 'No information found.';
      });

    // Auto-hide after 15s
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePopup, 15000);
  }

  function hidePopup() {
    if (popup) popup.style.display = 'none';
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  function onMouseUp(e) {
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (!text || text.length > 60 || /\n/.test(text)) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let x = rect.left + window.scrollX;
      let y = rect.top + window.scrollY;

      showPopup(x, y, text);
    }, 10);
  }

  function onClickAnywhere(e) {
    if (!popup) return;
    if (!popup.contains(e.target)) hidePopup();
  }

  if (!document.querySelector('.mini-popup')) {
    createPopup();
    document.addEventListener('mouseup', onMouseUp, true);
    document.addEventListener('mousedown', onClickAnywhere, true);
    document.addEventListener('scroll', hidePopup, true);
  }
})();
