// MST UAE — shared behaviour for every page: the quote (cart), header, search, quick view and motion.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { MST } = window;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const byId = new Map(MST.items.map((i) => [i.id, i]));
  const byKey = new Map(MST.items.map((i) => [i.key, i]));
  const deptOf = (id) => MST.departments.find((d) => d.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const brandLine = (item) => (item.brands.length ? item.brands.join(' · ') : item.kind === 'service' ? 'Service by MST UAE' : 'Sourced to your spec');
  const kindLabel = { hardware: 'Hardware', software: 'Software', service: 'Service' };

  /* ---------- today and the quotation reference ---------- */
  const now = new Date();
  const part = (opts) => new Intl.DateTimeFormat('en-GB', opts).format(now);
  const today = part({ day: 'numeric', month: 'long', year: 'numeric' });
  const quoteRef = `MST/${part({ year: '2-digit' })}/${part({ month: '2-digit' })}${part({ day: '2-digit' })}`;
  $$('[data-quote-no]').forEach((el) => { el.textContent = `No. ${quoteRef}`; });
  $$('[data-today]').forEach((el) => { el.textContent = today; });
  $$('[data-year]').forEach((el) => { el.textContent = part({ year: 'numeric' }); });

  /* ---------- live announcements for screen readers ---------- */
  const status = $('[data-status]');
  const announce = (msg) => {
    if (!status) return;
    status.textContent = '';
    setTimeout(() => { status.textContent = msg; }, 60);
  };

  /* =======================================================================
     The quote (the store's cart). Same storage key as before, so a visitor's list carries over.
     ======================================================================= */
  const KEY = 'mst-uae-list';
  const quote = {
    list: [],
    listeners: new Set(),
    load() {
      try { this.list = JSON.parse(localStorage.getItem(KEY)) || []; } catch { this.list = []; }
      if (!Array.isArray(this.list)) this.list = [];
      this.list = this.list.filter((l) => l && typeof l.name === 'string' && l.qty > 0);
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.list)); } catch { /* private mode: kept for this visit */ } },
    find(key) { return this.list.find((l) => l.name === key); },
    has(key) { return Boolean(this.find(key)); },
    set(key, qty) {
      const line = this.find(key);
      if (qty < 1) this.list = this.list.filter((l) => l.name !== key);
      else if (line) line.qty = qty;
      else this.list.push({ name: key, qty });
      this.save();
      this.emit();
    },
    toggle(key) { this.set(key, this.has(key) ? 0 : 1); return this.has(key); },
    clear() { this.list = []; this.save(); this.emit(); },
    emit() { this.listeners.forEach((fn) => fn(this.list)); },
    on(fn) { this.listeners.add(fn); fn(this.list); },
  };
  quote.load();
  addEventListener('storage', (e) => { if (e.key === KEY) { quote.load(); quote.emit(); } });
  const lines = (n) => `${n} ${n === 1 ? 'line' : 'lines'}`;

  // every "Add" control on the page reflects the quote
  quote.on((list) => {
    const keys = new Set(list.map((l) => l.name));
    $$('[data-add]').forEach((btn) => {
      const item = byId.get(btn.dataset.add);
      if (!item) return;
      const on = keys.has(item.key);
      btn.setAttribute('aria-pressed', String(on));
      const label = btn.querySelector('[data-add-label]') || btn;
      const words = btn.dataset.addWords ? btn.dataset.addWords.split('|') : ['Add to quote', 'On your quote'];
      label.textContent = on ? words[1] : words[0];
    });
    const count = list.length;
    $$('[data-quote-count]').forEach((el) => { el.textContent = count; el.hidden = count === 0; });
    $$('[data-quote-lines]').forEach((el) => { el.textContent = count ? lines(count) : 'Nothing yet'; });
  });

  /* ---------- toast ---------- */
  const toast = $('[data-toast]');
  let toastTimer;
  const showToast = (text) => {
    if (!toast) return;
    $('[data-toast-text]', toast).textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3600);
  };

  const addItem = (item, qty = 1) => {
    const had = quote.has(item.key);
    quote.set(item.key, had && qty === 1 ? 0 : qty);
    const on = quote.has(item.key);
    announce(`${item.title} ${on ? 'added to' : 'removed from'} your quote. ${lines(quote.list.length)}.`);
    if (on && !had) showToast(`${item.title} added to your quote`);
    $$('[data-quote-count]').forEach((el) => {
      if (calm.matches || !on) return;
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
  };

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add && byId.has(add.dataset.add)) { e.preventDefault(); addItem(byId.get(add.dataset.add)); return; }
    const qv = e.target.closest('[data-quick]');
    if (qv && byId.has(qv.dataset.quick)) { e.preventDefault(); openQuick(byId.get(qv.dataset.quick)); return; }
    if (e.target.closest('[data-open-quote]')) { e.preventDefault(); openQuote(e.target.closest('[data-open-quote]').dataset.note); return; }
    if (e.target.closest('[data-open-search]')) { e.preventDefault(); openSearch(); return; }
    if (e.target.closest('[data-open-menu]')) { e.preventDefault(); openDialog($('#menu')); return; }
    const close = e.target.closest('[data-close]');
    if (close) { e.preventDefault(); closeDialog(close.closest('dialog')); }
  });

  /* =======================================================================
     Dialogs: native <dialog> gives focus trapping, Escape and focus return; we add the motion
     ======================================================================= */
  const openDialog = (dlg) => {
    if (!dlg || dlg.open) return;
    $$('dialog[open]').forEach((d) => { if (d !== dlg) d.close(); });
    dlg.classList.remove('is-closing');
    dlg.showModal();
  };
  const closeDialog = (dlg) => {
    if (!dlg || !dlg.open) return;
    if (calm.matches) { dlg.close(); return; }
    dlg.classList.add('is-closing');
    const done = () => { dlg.classList.remove('is-closing'); dlg.close(); };
    dlg.addEventListener('animationend', done, { once: true });
    setTimeout(() => { if (dlg.open && dlg.classList.contains('is-closing')) done(); }, 320);
  };
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dlg); });
    // a click on the backdrop (outside the panel) closes
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); });
  });
  $$('#menu a').forEach((a) => a.addEventListener('click', () => $('#menu').close()));

  /* =======================================================================
     Header: glass bar that firms up on scroll, and an indicator that follows the pointer
     ======================================================================= */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const nav = $('[data-nav]');
  if (nav) {
    const ink = $('.nav__indicator', nav);
    const links = $$('a', nav);
    let active = links.find((a) => a.getAttribute('aria-current') === 'page') || null;
    const moveTo = (a) => {
      if (!a) { ink.style.opacity = '0'; return; }
      ink.style.opacity = '1';
      ink.style.width = `${a.offsetWidth}px`;
      ink.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    links.forEach((a) => {
      a.addEventListener('pointerenter', () => moveTo(a));
      a.addEventListener('focus', () => moveTo(a));
    });
    nav.addEventListener('pointerleave', () => moveTo(links.find((a) => a.classList.contains('is-active')) || active));
    nav.addEventListener('focusout', () => moveTo(links.find((a) => a.classList.contains('is-active')) || active));
    requestAnimationFrame(() => moveTo(active));
    addEventListener('resize', () => moveTo(links.find((a) => a.classList.contains('is-active')) || active));
    if (document.fonts) document.fonts.ready.then(() => moveTo(active));
  }

  /* =======================================================================
     Search: a command palette over departments, lines and brands
     ======================================================================= */
  const searchDlg = $('#search');
  const searchInput = $('[data-search-input]');
  const searchBox = $('[data-search-results]');
  let searchOpts = [];
  let searchIdx = 0;

  // "Wi-Fi", "wifi" and "wi fi" should all find the same line
  const norm = (s) => s.toLowerCase().replace(/[-.’'&]/g, '');
  const scoreItem = (item, q) => {
    const hay = norm(`${item.title} ${item.key} ${item.line} ${item.brands.join(' ')} ${item.deptName} ${item.kind}`);
    return norm(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  };
  const renderSearch = () => {
    const q = searchInput.value.trim().toLowerCase();
    const depts = MST.departments.filter((d) => !q || norm(`${d.name} ${d.blurb}`).includes(norm(q)));
    const items = q ? MST.items.filter((i) => scoreItem(i, q)).slice(0, 8)
      : ['business-laptops', 'm365', 'switches', 'monitors', 'ip-cameras', 'amc'].map((id) => byId.get(id));
    searchOpts = [];
    let html = '';
    const opt = (o, inner) => { searchOpts.push(o); return `<div class="search__opt" role="option" id="so-${searchOpts.length - 1}" data-i="${searchOpts.length - 1}" aria-selected="false">${inner}</div>`; };
    if (items.length) {
      html += `<p class="search__group">${q ? 'Product lines' : 'Popular lines'}</p>`;
      html += items.map((i) => opt({ type: 'item', item: i }, `<span class="search__thumb" style="background-image:url('${deptOf(i.dept).image}')"></span><div><b>${esc(i.title)}</b><small>${esc(i.deptName)} · ${esc(i.line)}</small></div>`)).join('');
    }
    if (depts.length) {
      html += '<p class="search__group">Departments</p>';
      html += depts.slice(0, q ? 4 : 9).map((d) => opt({ type: 'dept', dept: d }, `<span class="search__thumb" style="background-image:url('${d.image}')"></span><div><b>${esc(d.name)}</b><small>${d.items.length} lines · ${esc(d.blurb)}</small></div>`)).join('');
    }
    if (q) html += opt({ type: 'all', q }, `<span class="search__thumb" style="display:grid;place-items:center;background:var(--glass-2)">${icon('search')}</span><div><b>See every result for “${esc(searchInput.value.trim())}”</b><small>Open the catalogue with this search</small></div>`);
    if (!searchOpts.length) html = `<p class="search__empty">No lines match “${esc(searchInput.value.trim())}”. We source more than we list: ask on WhatsApp.</p>`;
    searchBox.innerHTML = html;
    searchIdx = 0;
    highlight();
  };
  const highlight = () => {
    $$('.search__opt', searchBox).forEach((el, i) => el.setAttribute('aria-selected', String(i === searchIdx)));
    const cur = $(`#so-${searchIdx}`, searchBox);
    if (cur) { searchInput.setAttribute('aria-activedescendant', cur.id); cur.scrollIntoView({ block: 'nearest' }); }
    else searchInput.removeAttribute('aria-activedescendant');
  };
  const choose = (o) => {
    if (!o) return;
    if (o.type === 'item') { closeDialog(searchDlg); setTimeout(() => openQuick(o.item), calm.matches ? 0 : 220); }
    else if (o.type === 'dept') location.href = `catalogue.html?dept=${o.dept.id}`;
    else location.href = `catalogue.html?q=${encodeURIComponent(o.q)}`;
  };
  const openSearch = () => {
    if (!searchDlg) return;
    openDialog(searchDlg);
    searchInput.value = '';
    renderSearch();
    searchInput.focus();
  };
  if (searchDlg) {
    searchInput.addEventListener('input', renderSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); searchIdx = Math.min(searchOpts.length - 1, searchIdx + 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); searchIdx = Math.max(0, searchIdx - 1); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(searchOpts[searchIdx]); }
    });
    searchBox.addEventListener('click', (e) => { const el = e.target.closest('.search__opt'); if (el) choose(searchOpts[Number(el.dataset.i)]); });
    searchBox.addEventListener('pointermove', (e) => { const el = e.target.closest('.search__opt'); if (el && Number(el.dataset.i) !== searchIdx) { searchIdx = Number(el.dataset.i); highlight(); } });
  }
  addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); openSearch(); }
  });

  /* =======================================================================
     Quick view: the product sheet for one line
     ======================================================================= */
  const quickDlg = $('#quick');
  let quickItem = null;
  let quickQty = 1;
  const renderQuickQty = () => {
    $('[data-qv-qty]', quickDlg).textContent = quickQty;
    const on = quote.has(quickItem.key);
    $('[data-qv-add] [data-add-label]', quickDlg).textContent = on ? 'Update quote' : 'Add to quote';
  };
  function openQuick(item) {
    if (!quickDlg) { location.href = `catalogue.html?item=${item.id}`; return; }
    quickItem = item;
    const d = deptOf(item.dept);
    quickQty = quote.find(item.key)?.qty || 1;
    const media = $('[data-qv-media]', quickDlg);
    media.style.backgroundImage = `url('${d.image}')`;
    media.style.backgroundPosition = d.pos || 'center';
    media.classList.toggle('tone-cool', d.tone === 'cool');
    $('[data-qv-dept]', quickDlg).textContent = d.name;
    $('[data-qv-kind]', quickDlg).textContent = `${kindLabel[item.kind]} · ${brandLine(item)}`;
    $('[data-qv-title]', quickDlg).textContent = item.title;
    $('[data-qv-line]', quickDlg).textContent = item.line;
    $('[data-qv-brands]', quickDlg).innerHTML = item.brands.map((b) => `<span class="chip">${esc(b)}</span>`).join('');
    $('[data-qv-includes]', quickDlg).innerHTML = MST.includes[item.kind].map((t) => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('');
    $('[data-qv-ask]', quickDlg).href = `https://wa.me/${MST.whatsapp}?text=${encodeURIComponent(`Hello MST UAE, I have a question about: ${item.title} (${item.line}).`)}`;
    $('[data-qv-related-title]', quickDlg).textContent = `More in ${d.name}`;
    $('[data-qv-related]', quickDlg).innerHTML = d.items.filter((i) => i.id !== item.id).slice(0, 4)
      .map((i) => `<a href="catalogue.html?item=${i.id}" data-quick="${i.id}"><b>${esc(i.title)}</b><span>${esc(i.brands.slice(0, 2).join(', ') || 'Service')}</span></a>`).join('');
    renderQuickQty();
    openDialog(quickDlg);
    try { const url = new URL(location.href); url.searchParams.set('item', item.id); history.replaceState(null, '', url); } catch { /* file:// */ }
  }
  if (quickDlg) {
    quickDlg.addEventListener('close', () => { try { const url = new URL(location.href); url.searchParams.delete('item'); history.replaceState(null, '', url); } catch { /* file:// */ } });
    $('[data-qv-minus]', quickDlg).addEventListener('click', () => { quickQty = Math.max(1, quickQty - 1); renderQuickQty(); });
    $('[data-qv-plus]', quickDlg).addEventListener('click', () => { quickQty = Math.min(999, quickQty + 1); renderQuickQty(); });
    $('[data-qv-add]', quickDlg).addEventListener('click', () => {
      const had = quote.has(quickItem.key);
      quote.set(quickItem.key, quickQty);
      announce(`${quickItem.title}, ${quickQty}, ${had ? 'updated on' : 'added to'} your quote.`);
      showToast(`${quickItem.title} × ${quickQty} ${had ? 'updated' : 'added to your quote'}`);
      renderQuickQty();
    });
  }

  /* =======================================================================
     Quote drawer: lines, details, send on WhatsApp or email, confirmation
     ======================================================================= */
  const drawer = $('#quote');
  const form = $('#quote-form');
  const qList = $('[data-q-list]');
  const qEmpty = $('[data-q-empty]');
  const qDone = $('[data-q-done]');
  const qError = $('[data-q-error]');
  const steps = $$('[data-steps] li');
  const f = (n) => form.elements[n];
  let lastKeys = new Set();

  const renderQuote = (list) => {
    if (!drawer) return;
    const keys = new Set(list.map((l) => l.name));
    qList.innerHTML = list.map((l) => {
      const item = byKey.get(l.name);
      const d = item ? deptOf(item.dept) : null;
      return `<div class="q-row${lastKeys.has(l.name) ? '' : ' is-new'}" data-key="${esc(l.name)}">
        <span class="q-row__thumb${d && d.tone === 'cool' ? ' tone-cool' : ''}" style="${d ? `background-image:url('${d.image}')` : ''}"></span>
        <div><b>${esc(item ? item.title : l.name)}</b><small>${esc(item ? item.deptName : 'Custom line')}</small></div>
        <div class="q-row__side">
          <div class="stepper"><button type="button" data-q-step="-1" aria-label="One fewer: ${esc(l.name)}">${icon('minus')}</button><output class="nums">${l.qty}</output><button type="button" data-q-step="1" aria-label="One more: ${esc(l.name)}">${icon('plus')}</button></div>
          <button type="button" class="q-row__remove" data-q-remove>Remove</button>
        </div></div>`;
    }).join('');
    lastKeys = keys;
    qEmpty.hidden = list.length > 0;
    updateSteps();
  };
  const updateSteps = () => {
    if (!drawer) return;
    const hasLines = quote.list.length > 0 || f('notes').value.trim() !== '';
    const hasDetails = f('name').value.trim() !== '' && f('contact').value.trim() !== '';
    steps[0].classList.toggle('is-done', hasLines);
    steps[1].classList.toggle('is-done', hasDetails);
    steps[2].classList.toggle('is-done', drawer.classList.contains('is-sent'));
  };
  const showDone = (on) => {
    drawer.classList.toggle('is-sent', on);
    form.hidden = on;
    $('[data-q-foot]', drawer).hidden = on;
    qDone.hidden = !on;
    updateSteps();
  };
  function openQuote(note) {
    if (!drawer) return;
    showDone(false);
    if (note && !f('notes').value.includes(note)) f('notes').value = `${note}${f('notes').value ? `\n${f('notes').value}` : ''}`;
    openDialog(drawer);
    if (note) { f('notes').focus(); f('notes').setSelectionRange(f('notes').value.length, f('notes').value.length); }
  }
  if (drawer) {
    quote.on(renderQuote);
    form.addEventListener('input', () => { qError.hidden = true; f('notes').removeAttribute('aria-invalid'); updateSteps(); });
    qList.addEventListener('click', (e) => {
      const row = e.target.closest('.q-row');
      if (!row) return;
      const key = row.dataset.key;
      const line = quote.find(key);
      const at = quote.list.indexOf(line);
      const stepBtn = e.target.closest('[data-q-step]');
      if (stepBtn) {
        quote.set(key, line.qty + Number(stepBtn.dataset.qStep));
        announce(quote.has(key) ? `${key}: ${quote.find(key).qty}.` : `${key} removed. ${lines(quote.list.length)}.`);
        const again = $$('.q-row', qList).find((r) => r.dataset.key === key);
        if (again) $(`[data-q-step="${stepBtn.dataset.qStep}"]`, again).focus();
        else focusNear(at);
      } else if (e.target.closest('[data-q-remove]')) {
        quote.set(key, 0);
        announce(`${key} removed. ${lines(quote.list.length)}.`);
        focusNear(at);
      }
    });
    const focusNear = (at) => {
      const rows = $$('.q-row', qList);
      if (rows.length) $('[data-q-remove]', rows[Math.min(at, rows.length - 1)]).focus();
      else f('notes').focus();
    };

    const compose = () => {
      const rows = quote.list.map((l) => `- ${l.qty} × ${l.name}`);
      const notes = f('notes').value.trim();
      let msg = `Hello MST UAE, please send a quotation (ref ${quoteRef}) for:\n`;
      if (rows.length) msg += `${rows.join('\n')}\n`;
      if (notes) msg += `${rows.length ? '\nAlso: ' : ''}${notes}\n`;
      const who = ['name', 'company', 'contact'].map((n) => f(n).value.trim()).filter(Boolean);
      if (who.length) msg += `\n${who.join(', ')}`;
      return msg;
    };
    const ready = () => {
      const ok = quote.list.length > 0 || f('notes').value.trim() !== '';
      qError.hidden = ok;
      if (!ok) { f('notes').setAttribute('aria-invalid', 'true'); f('notes').focus(); announce(qError.textContent); }
      return ok;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ready()) return;
      // open straight from the click: a delayed window.open is blocked as a popup on iPhone
      const url = `https://wa.me/${MST.whatsapp}?text=${encodeURIComponent(compose())}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null; else location.href = url;
      showDone(true);
      $('[data-q-done-via]', drawer).textContent = 'WhatsApp';
      $('[data-q-done] h3', drawer).focus();
    });
    $('[data-send-mail]', drawer).addEventListener('click', (e) => {
      if (!ready()) { e.preventDefault(); return; }
      const company = f('company').value.trim();
      e.currentTarget.href = `mailto:${MST.email}?subject=${encodeURIComponent(`Quotation request ${quoteRef}${company ? `, ${company}` : ''}`)}&body=${encodeURIComponent(compose())}`;
      setTimeout(() => { showDone(true); $('[data-q-done-via]', drawer).textContent = 'your email app'; }, 50);
    });
    $('[data-q-new]', drawer).addEventListener('click', () => { quote.clear(); form.reset(); showDone(false); f('notes').focus(); });
    $('[data-q-edit]', drawer).addEventListener('click', () => { showDone(false); f('notes').focus(); });
  }

  /* =======================================================================
     Motion: reveals, tilt, hero depth
     ======================================================================= */
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !calm.matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    reveals.forEach((el) => io.observe(el));
    addEventListener('load', () => setTimeout(() => reveals.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    }), 2500));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  // cards lean toward the pointer, and a soft light follows it
  const tilt = (el) => {
    let frame = 0;
    el.addEventListener('pointermove', (e) => {
      if (!finePointer.matches || calm.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const max = Number(el.dataset.tilt) || 5;
        el.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * max).toFixed(2)}deg) rotateY(${((x - 0.5) * max).toFixed(2)}deg)`;
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); el.style.transform = ''; });
  };
  $$('[data-tilt]').forEach(tilt);

  // the hero's glass panels sit a little nearer than the photograph behind them
  const visual = $('.hero__visual');
  if (visual) {
    const floats = $('.hero__floats', visual);
    const frame = $('.hero__frame', visual);
    $('.hero').addEventListener('pointermove', (e) => {
      if (!finePointer.matches || calm.matches) return;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      floats.style.transform = `translate3d(${(x * 18).toFixed(1)}px, ${(y * 14).toFixed(1)}px, 0)`;
      frame.style.transform = `translate3d(${(x * -8).toFixed(1)}px, ${(y * -6).toFixed(1)}px, 0)`;
    });
  }

  /* =======================================================================
     Home: software tabs with a sliding ink, and the licence card that follows them
     ======================================================================= */
  const tabs = $$('[role="tab"]');
  if (tabs.length) {
    const list = $('[role="tablist"]');
    const ink = $('.tabs__ink', list);
    const card = $('.licence');
    const slug = (t) => t.id.replace('tab-', '');
    const placeInk = (t) => { ink.style.width = `${t.offsetWidth}px`; ink.style.transform = `translateX(${t.offsetLeft - 4}px)`; };
    const select = (tab, { focus = false, remember = true } = {}) => {
      const changed = tab.getAttribute('aria-selected') !== 'true';
      let panel;
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const p = document.getElementById(t.getAttribute('aria-controls'));
        p.hidden = !on;
        if (on) panel = p;
      });
      placeInk(tab);
      $('[data-licence-name]', card).textContent = panel.dataset.licence;
      if (changed && !calm.matches) { card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap'); }
      if (focus) tab.focus();
      if (remember) { try { const url = new URL(location.href); url.searchParams.set('software', slug(tab)); history.replaceState(null, '', url); } catch { /* file:// */ } }
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select(tabs[(to + tabs.length) % tabs.length], { focus: true });
      });
    });
    const asked = tabs.find((t) => slug(t) === new URLSearchParams(location.search).get('software'));
    select(asked || tabs[0], { remember: false });
    addEventListener('resize', () => placeInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    if (document.fonts) document.fonts.ready.then(() => placeInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    // the licence card catches the light as the pointer crosses it
    if (card) {
      card.addEventListener('pointermove', (e) => {
        if (!finePointer.matches || calm.matches) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `rotateX(${((0.5 - y) * 12).toFixed(2)}deg) rotateY(${((x - 0.5) * 16).toFixed(2)}deg)`;
        card.style.setProperty('--shine', `${(100 - x * 100).toFixed(1)}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    }
  }

  /* ---------- the creek film: plays in view, pauses on request, still under reduced motion ---------- */
  const film = $('[data-film]');
  if (film) {
    const btn = $('[data-film-toggle]');
    let held = calm.matches;
    let seen = false;
    const sync = () => {
      btn.textContent = held ? 'Play film' : 'Pause film';
      if (held || !seen) film.pause(); else film.play().catch(() => {});
    };
    if (calm.matches) film.removeAttribute('autoplay');
    btn.addEventListener('click', () => { held = !held; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { for (const e of es) seen = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(film);
    calm.addEventListener('change', () => { held = calm.matches; sync(); });
    sync();
  }

  /* ---------- nav indicator follows the home sections ---------- */
  if (nav) {
    const links = $$('a', nav);
    const pairs = links.map((a) => [a, a.hash && document.getElementById(a.hash.slice(1))]).filter(([a, s]) => s && a.pathname.endsWith(location.pathname.split('/').pop() || 'index.html'));
    if (pairs.length && 'IntersectionObserver' in window) {
      const ink = $('.nav__indicator', nav);
      const set = (a) => {
        links.forEach((l) => l.classList.toggle('is-active', l === a));
        nav.dataset.active = a ? links.indexOf(a) : '';
        if (!nav.matches(':hover')) {
          if (!a) { ink.style.opacity = '0'; return; }
          ink.style.opacity = '1'; ink.style.width = `${a.offsetWidth}px`; ink.style.transform = `translateX(${a.offsetLeft}px)`;
        }
      };
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          const pair = pairs.find(([, s]) => s === e.target);
          if (e.isIntersecting) set(pair[0]);
          else if (pair[0].classList.contains('is-active')) set(null);
        }
      }, { rootMargin: '-45% 0px -50% 0px' });
      pairs.forEach(([, s]) => io.observe(s));
      nav.addEventListener('pointerleave', () => { const a = links.find((l) => l.classList.contains('is-active')); set(a || null); });
    }
  }

  /* =======================================================================
     Catalogue page: filters, sort, view, search, all kept in the address
     ======================================================================= */
  const results = $('[data-cat-results]');
  if (results) {
    const params = new URLSearchParams(location.search);
    const listParam = (k) => new Set((params.get(k) || '').split(',').filter(Boolean));
    const state = {
      depts: listParam('dept'),
      kinds: listParam('kind'),
      brands: listParam('brand'),
      q: params.get('q') || '',
      sort: params.get('sort') || 'dept',
      view: params.get('view') || 'grid',
    };
    const allBrands = [...MST.items.reduce((m, i) => { i.brands.forEach((b) => m.set(b, (m.get(b) || 0) + 1)); return m; }, new Map())]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const qInput = $('[data-cat-q]');
    const sortSel = $('[data-cat-sort]');
    const count = $('[data-cat-count]');
    const chips = $('[data-active-filters]');
    const pills = $('[data-dept-pills]');
    const title = $('[data-page-title]');
    const crumb = $('[data-crumb-dept]');
    const sheet = $('#filters-sheet');
    qInput.value = state.q;
    sortSel.value = state.sort;

    const matches = (i, skip) => (skip === 'dept' || !state.depts.size || state.depts.has(i.dept))
      && (skip === 'kind' || !state.kinds.size || state.kinds.has(i.kind))
      && (skip === 'brand' || !state.brands.size || i.brands.some((b) => state.brands.has(b)))
      && (!state.q || scoreItem(i, state.q.toLowerCase()));

    const filterHTML = (scope) => {
      const group = (key, label, opts, open) => {
        const on = state[key].size;
        return `<details class="fgroup" ${open ? 'open' : ''}><summary>${label}${on ? `<span class="fgroup__count">${on}</span>` : '<span class="fgroup__count"></span>'}${icon('chevron')}</summary><div class="fgroup__body">${opts.join('')}</div></details>`;
      };
      const check = (key, value, label, n) => `<label class="check"><input type="checkbox" data-filter="${key}" value="${esc(value)}" ${state[key].has(value) ? 'checked' : ''} ${n === 0 && !state[key].has(value) ? 'disabled' : ''}><span>${esc(label)}</span><small class="nums">${n}</small></label>`;
      const n = (pred, skip) => MST.items.filter((i) => matches(i, skip) && pred(i)).length;
      const any = state.depts.size + state.kinds.size + state.brands.size + (state.q ? 1 : 0);
      return `<div class="filters__head"><h2 id="${scope}-filters-title">Filters</h2><button type="button" class="filters__clear" data-clear ${any ? '' : 'disabled'}>Clear all</button></div>
        ${group('depts', 'Department', MST.departments.map((d) => check('depts', d.id, d.name, n((i) => i.dept === d.id, 'dept'))), true)}
        ${group('kinds', 'Type', ['hardware', 'software', 'service'].map((k) => check('kinds', k, kindLabel[k], n((i) => i.kind === k, 'kind'))), true)}
        ${group('brands', 'Brand', allBrands.map(([b]) => check('brands', b, b, n((i) => i.brands.includes(b), 'brand'))), state.brands.size > 0)}`;
    };

    const card = (i, n) => {
      const d = deptOf(i.dept);
      return `<article class="line-card is-entering" style="--i:${Math.min(n, 12)}">
        <div><div class="line-card__top"><span class="line-card__kind line-card__kind--${i.kind}">${kindLabel[i.kind]}${state.sort !== 'dept' ? ` · ${esc(d.name)}` : ''}</span></div>
        <h3><button type="button" data-quick="${i.id}">${esc(i.title)}</button></h3></div>
        <div style="display:grid;gap:0.75rem;align-content:start"><p>${esc(i.line)}</p>${i.brands.length ? `<div class="line-card__brands">${i.brands.map((b) => `<span>${esc(b)}</span>`).join('')}</div>` : ''}</div>
        <div class="line-card__foot"><span class="line-card__price">Price on quotation</span><button type="button" class="btn btn--glass btn--sm" data-add="${i.id}" data-add-words="Add|Added ✓" aria-label="${esc(i.title)}: add to your quote">Add</button></div>
      </article>`;
    };

    const render = () => {
      const shown = MST.items.filter((i) => matches(i));
      const sorted = state.sort === 'dept' ? shown : [...shown].sort((a, b) => (state.sort === 'az' ? 1 : -1) * a.title.localeCompare(b.title));
      results.classList.toggle('is-list', state.view === 'list');
      if (!sorted.length) {
        results.innerHTML = `<div class="empty-state glass-quiet"><div class="q-empty__icon">${icon('search')}</div><h2 class="h3">No lines match</h2><p class="muted">We source far more than we list. Clear the filters, or ask us for it.</p><div class="hero__actions" style="justify-content:center"><button class="btn btn--glass" type="button" data-clear>Clear filters</button><a class="btn btn--primary" href="https://wa.me/${MST.whatsapp}" target="_blank" rel="noopener">Ask on WhatsApp</a></div></div>`;
      } else if (state.sort === 'dept') {
        let n = 0;
        results.innerHTML = MST.departments.map((d) => {
          const its = sorted.filter((i) => i.dept === d.id);
          if (!its.length) return '';
          return `<section class="group" aria-labelledby="g-${d.id}"><div class="group__head"><img src="${d.image}" alt="" loading="lazy" decoding="async" class="${d.tone === 'cool' ? 'tone-cool' : ''}" style="object-position:${d.pos}"><div><h2 id="g-${d.id}">${esc(d.name)}</h2><p>${esc(d.blurb)}</p></div><span class="chip">${lines(its.length)}</span></div><div class="lines">${its.map((i) => card(i, n++)).join('')}</div></section>`;
        }).join('');
      } else {
        results.innerHTML = `<div class="lines">${sorted.map(card).join('')}</div>`;
      }
      count.textContent = `Showing ${sorted.length} of ${MST.items.length} lines`;
      $$('[data-filters], #filters-sheet [data-sheet-filters]').forEach((box, k) => { box.innerHTML = filterHTML(k ? 'sheet' : 'side'); });
      const total = state.depts.size + state.kinds.size + state.brands.size;
      $$('[data-filter-count]').forEach((el) => { el.textContent = total; el.hidden = !total; });
      const sheetBtn = $('[data-sheet-apply]');
      if (sheetBtn) sheetBtn.textContent = `Show ${lines(sorted.length)}`;
      chips.innerHTML = [
        ...[...state.depts].map((v) => ['depts', v, deptOf(v)?.name || v]),
        ...[...state.kinds].map((v) => ['kinds', v, kindLabel[v]]),
        ...[...state.brands].map((v) => ['brands', v, v]),
        ...(state.q ? [['q', '', `“${state.q}”`]] : []),
      ].map(([k, v, label]) => `<button type="button" data-unset="${k}" data-value="${esc(v)}" aria-label="Remove filter: ${esc(label)}">${esc(label)}${icon('x')}</button>`).join('');
      pills.innerHTML = [`<button type="button" data-pill="" aria-pressed="${state.depts.size === 0}">All</button>`, ...MST.departments.map((d) => `<button type="button" data-pill="${d.id}" aria-pressed="${state.depts.size === 1 && state.depts.has(d.id)}">${esc(d.name)}</button>`)].join('');
      const one = state.depts.size === 1 ? deptOf([...state.depts][0]) : null;
      title.textContent = one ? one.name : 'Catalogue';
      crumb.hidden = !one;
      if (one) $('span', crumb).textContent = one.name;
      document.title = `${one ? one.name : 'Catalogue'} | MST UAE`;
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
      quote.emit();
      const url = new URL(location.href);
      [['dept', state.depts], ['kind', state.kinds], ['brand', state.brands]].forEach(([k, set]) => { if (set.size) url.searchParams.set(k, [...set].join(',')); else url.searchParams.delete(k); });
      [['q', state.q, ''], ['sort', state.sort, 'dept'], ['view', state.view, 'grid']].forEach(([k, v, def]) => { if (v && v !== def) url.searchParams.set(k, v); else url.searchParams.delete(k); });
      try { history.replaceState(null, '', url); } catch { /* file:// */ }
    };

    const clearAll = () => { state.depts.clear(); state.kinds.clear(); state.brands.clear(); state.q = ''; qInput.value = ''; render(); };
    document.addEventListener('change', (e) => {
      const box = e.target.closest('[data-filter]');
      if (!box) return;
      const set = state[box.dataset.filter];
      if (box.checked) set.add(box.value); else set.delete(box.value);
      const keep = `[data-filter="${box.dataset.filter}"][value="${CSS.escape(box.value)}"]`;
      const inSheet = Boolean(box.closest('#filters-sheet'));
      render();
      const again = $(`${inSheet ? '#filters-sheet ' : '[data-filters] '}${keep}`);
      if (again) again.focus();
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear]')) { clearAll(); return; }
      const un = e.target.closest('[data-unset]');
      if (un) { if (un.dataset.unset === 'q') { state.q = ''; qInput.value = ''; } else state[un.dataset.unset].delete(un.dataset.value); render(); return; }
      const pill = e.target.closest('[data-pill]');
      if (pill) { state.depts = new Set(pill.dataset.pill ? [pill.dataset.pill] : []); render(); const again = $(`[data-pill="${pill.dataset.pill}"]`); if (again) again.focus(); return; }
      const view = e.target.closest('[data-view]');
      if (view) { state.view = view.dataset.view; render(); return; }
      if (e.target.closest('[data-open-filters]')) { openDialog(sheet); return; }
      if (e.target.closest('[data-sheet-apply]')) closeDialog(sheet);
    });
    let qTimer;
    qInput.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => { state.q = qInput.value.trim(); render(); }, 160); });
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
    render();
  }

  /* ---------- a link straight to a line opens its sheet ---------- */
  const askedItem = byId.get(new URLSearchParams(location.search).get('item'));
  if (askedItem && quickDlg) openQuick(askedItem);
})();
