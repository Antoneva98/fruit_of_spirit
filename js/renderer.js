// Block renderer + infinite scroll + parallax. Vanilla JS, no framework.
(function(){
  const blocks = window.MAG_BLOCKS;
  const stage = document.getElementById('stage');
  let cycleCount = 0;

  // ---------------- block renderers ----------------
  const R = {
    cover(b){
      return `<section class="block cover" data-parallax="0.35">
        <div class="px-img" data-bg="${b.img}"></div>
        <div class="cover-grain"></div>
        <div class="cover-inner">
          <div class="top-bar">
            <span class="mono">${b.eyebrow}</span>
            <span class="mono">№ 01 / Плід Духа</span>
          </div>
          <div class="cover-mid">
            <div class="mono cover-over">${b.over}</div>
            <h1 class="mega">${b.title}<em>${b.titleAlt}</em>${b.title2}</h1>
          </div>
          <div class="cover-bot">
            <div class="cover-verse">${b.verse}</div>
            <div class="mono">${b.cite}</div>
          </div>
          <div class="scroll-hint mono">↓ скрол</div>
        </div>
      </section>`;
    },

    index(b){
      const groups = b.rows.map(row => {
        const lines = row.lines.map((line, idx) => `
          <a class="idx-line ${idx === 0 ? 'is-first' : 'is-sub'}" href="javascript:scrollToBlock(${line.to})">
            <div class="idx-n-col">
              ${idx === 0 ? `<span class="idx-n mono">${row.n}</span>` : ''}
            </div>
            <span class="idx-t">${line.t}</span>
            <span class="idx-s">${line.s}</span>
            <span class="idx-arr">↗</span>
          </a>
        `).join('');
        return `<div class="idx-group">${lines}</div>`;
      }).join('');

      return `<section class="block index-block">
        <div class="container">
          <div class="kicker mono">${b.eyebrow}</div>
          <div class="index-list">
            ${groups}
          </div>
        </div>
      </section>`;
    },

    chapter(b){
      return `<section class="block chapter" data-parallax="0.5">
        <div class="px-img" data-bg="${b.img}"></div>
        <div class="chapter-tint"></div>
        <div class="chapter-inner">
          <div class="mono kicker">${b.pre}</div>
          <div class="chapter-num">${b.num}</div>
          <h2 class="chapter-title">${b.title.replace(/\n/g,'<br>')}</h2>
          <div class="mono chapter-sub">${b.sub}</div>
        </div>
      </section>`;
    },

    lead(b){
      const body = b.body.map(p => `<p>${p}</p>`).join('');
      return `<section class="block lead lead-${b.side||'left'}">
        <div class="container lead-grid">
          <div class="lead-img" data-parallax="0.18">
            <div class="px-img-inner" data-bg="${b.img}"></div>
          </div>
          <div class="lead-text">
            <div class="kicker mono">${b.eyebrow}</div>
            <h2 class="display">${b.title.replace(/\n/g,'<br>')}</h2>
            ${body}
          </div>
        </div>
      </section>`;
    },

    scripture(b){
      return `<section class="block scripture ${b.dark?'dark':''}">
        <div class="container narrow">
          <div class="kicker mono">${b.eyebrow}</div>
          <blockquote class="serif-q">
            <span class="qmark">"</span>
            ${b.body}
          </blockquote>
          <div class="cite mono">— ${b.cite}</div>
        </div>
      </section>`;
    },

    'scripture-long'(b){
      const parts = b.parts.map(p => `<p>${p}</p>`).join('');
      return `<section class="block scripture-long">
        <div class="container narrow">
          <div class="kicker mono">${b.eyebrow}</div>
          <div class="long-body">${parts}</div>
          <div class="accent-line">${b.accent}</div>
          <div class="tail-line">${b.tail}</div>
        </div>
      </section>`;
    },

    split(b){
      const body = b.body.map(p => `<p>${p}</p>`).join('');
      return `<section class="block split split-${b.side}">
        <div class="container split-grid">
          <div class="split-img" data-parallax="0.22">
            <div class="px-img-inner" data-bg="${b.img}"></div>
            <div class="img-cap mono">${b.cite}</div>
          </div>
          <div class="split-text">
            <div class="kicker mono">${b.eyebrow}</div>
            <h2 class="display">${b.title.replace(/\n/g,'<br>')}</h2>
            ${body}
          </div>
        </div>
      </section>`;
    },

    pull(b){
      return `<section class="block pull">
        <div class="container narrow">
          <div class="kicker mono">${b.eyebrow}</div>
          <div class="pull-q">${b.quote.replace(/\n/g,'<br>')}</div>
          <div class="pull-a">${b.answer}</div>
          <div class="pull-after">${b.after.replace(/\n/g,'<br>')}</div>
        </div>
      </section>`;
    },

    'big-quote'(b){
      return `<section class="block big-quote" data-parallax="0.4">
        <div class="px-img" data-bg="${b.img}"></div>
        <div class="bq-tint"></div>
        <div class="container narrow bq-inner">
          <div class="bq-mark">"</div>
          <blockquote class="bq">${b.quote.replace(/\n/g,'<br>')}</blockquote>
          <div class="mono bq-by">— ${b.by}</div>
        </div>
      </section>`;
    },

    formula(b){
      const lines = b.lines.map(l => `<div class="f-line">${l.map((tok,i) => {
        if(tok==='') return '<span class="f-gap"></span>';
        if(tok==='IF'||tok==='ELSE') return `<span class="f-key mono">${tok}</span>`;
        if(tok==='>'||tok==='→') return `<span class="f-op">${tok}</span>`;
        return `<span class="f-tok">${tok}</span>`;
      }).join('')}</div>`).join('');
      return `<section class="block formula">
        <div class="container">
          <div class="kicker mono">${b.eyebrow}</div>
          <h2 class="display">${b.title}</h2>
          <div class="formula-card">${lines}</div>
        </div>
      </section>`;
    },

    steps(b){
      const items = b.items.map(it => `
        <div class="step">
          <div class="step-n mono">${it.n}</div>
          <div class="step-t">${it.t}</div>
        </div>`).join('');
      return `<section class="block steps">
        <div class="container">
          <div class="kicker mono">${b.eyebrow}</div>
          <h2 class="display">${b.title.replace(/\n/g,'<br>')}</h2>
          <div class="steps-list">${items}</div>
        </div>
      </section>`;
    },

    conclusions(b){
      const items = b.items.map((t,i) => `
        <div class="ccl-row">
          <span class="ccl-n mono">${String(i+1).padStart(2,'0')}</span>
          <span class="ccl-t">${t}</span>
        </div>`).join('');
      return `<section class="block conclusions" data-parallax="0.25">
        <div class="px-img" data-bg="${b.img}"></div>
        <div class="ccl-tint"></div>
        <div class="container ccl-inner">
          <div class="kicker mono">${b.eyebrow}</div>
          <h2 class="display light">${b.title.replace(/\n/g,'<br>')}</h2>
          <div class="ccl-list">${items}</div>
        </div>
      </section>`;
    },

    'fruit-index'(b){
      const items = b.items.map(it => `
        <a class="fidx-row" href="javascript:scrollToBlock(${it.targetIdx})">
          <span class="fidx-n mono">${it.n}</span>
          <span class="fidx-name">${it.name}</span>
          <span class="fidx-greek mono">${it.greek}</span>
        </a>`).join('');
      return `<section class="block fruit-index">
        <div class="container">
          <div class="kicker mono">${b.eyebrow}</div>
          <div class="fidx-list">${items}</div>
        </div>
      </section>`;
    },

    accordion(b){
      const body = b.body.map(p => `<p>${p}</p>`).join('');
      const qaHtml = (b.qa || []).map(item => `
        <div class="qa-item">
          <button class="qa-trigger" onclick="this.parentElement.classList.toggle('open')">
            <span class="qa-label mono">Запитання</span>
            <span class="qa-q">${item.q}</span>
            <span class="qa-icon">▾</span>
          </button>
          <div class="qa-answer">
            <div class="qa-answer-inner">
              <span class="qa-answer-label mono">Відповідь</span>
              <p>${item.a}</p>
            </div>
          </div>
        </div>`).join('');
      const openClass = b.openByDefault !== false ? ' open' : '';
      return `<section class="block accordion-block">
        <div class="container narrow">
          ${b.eyebrow ? `<div class="kicker mono">${b.eyebrow}</div>` : ''}
          <div class="acc-item${openClass}">
            <button class="acc-trigger" onclick="this.parentElement.classList.toggle('open')">
              <span class="acc-title">${b.title}</span>
              <span class="acc-icon">+</span>
            </button>
            <div class="acc-body">
              <div class="acc-body-inner">
                ${body}
                ${qaHtml}
              </div>
            </div>
          </div>
        </div>
      </section>`;
    },

    fruit(b){
      const body = b.body.map(p => `<p>${p}</p>`).join('');
      let expandHtml = '';
      if(b.expand){
        const items = b.expand.items
          ? `<ul>${b.expand.items.map(i => `<li>${i}</li>`).join('')}</ul>`
          : '';
        const extraBody = b.expand.body
          ? b.expand.body.map(p => `<p>${p}</p>`).join('')
          : '';
        const reflect = b.expand.reflect
          ? `<span class="reflect-kicker">Пороздумуйте</span>${b.expand.reflect.map(r => `<div class="reflect-item">${r}</div>`).join('')}`
          : '';
        expandHtml = `
          <div class="fruit-expand">
            <div class="fruit-expand-item">
              <button class="fruit-expand-trigger" onclick="this.parentElement.classList.toggle('open')">
                <span class="fruit-expand-label">${b.expand.label || 'Детальніше'}</span>
                <span class="fruit-expand-icon">+</span>
              </button>
              <div class="fruit-expand-body">
                <div class="fruit-expand-inner">
                  ${items}
                  ${extraBody}
                  ${reflect}
                </div>
              </div>
            </div>
          </div>`;
      }
      return `<section class="block fruit-block">
        <div class="container fruit-grid">
          <div class="fruit-img">
            <div class="px-img-inner" data-bg="${b.img}"></div>
            <div class="fruit-tag mono">№ ${b.n} / IX</div>
          </div>
          <div class="fruit-text">
            <div class="kicker mono">плід духа · ${b.n}</div>
            <h2 class="fruit-name">${b.name}</h2>
            <div class="mono fruit-greek">${b.greek}</div>
            <div class="rule"></div>
            <div class="fruit-body">${body}</div>
            ${expandHtml}
          </div>
        </div>
      </section>`;
    },

    colophon(b){
      return `<section class="block colophon" data-parallax="0.3">
        <div class="px-img" data-bg="${b.img}"></div>
        <div class="col-tint"></div>
        <div class="container narrow col-inner">
          <div class="mono col-over">${b.over}</div>
          <h2 class="col-title">${b.title}</h2>
          <div class="col-sub">${b.sub}</div>
          <div class="mono col-cite">${b.cite}</div>
          <div class="mono col-issue">${b.issue}</div>
        </div>
      </section>`;
    }
  };

  // ---------------- append cycle ----------------
  function appendCycle(){
    const wrap = document.createElement('div');
    wrap.className = 'cycle';
    wrap.dataset.cycle = cycleCount;
    let html = '';
    blocks.forEach((b,i) => {
      const fn = R[b.kind];
      if(fn) html += fn(b);
    });
    wrap.innerHTML = html;
    stage.appendChild(wrap);
    cycleCount++;
    initFonts(wrap);
    initParallax();
    initReveal(wrap);
    
    // Scale headers to fit container
    wrap.querySelectorAll('.mega, .fruit-name, .display, .pull-a').forEach(fitText);
  }

  // ---------------- smart scaling ----------------
  function fitText(el){
    // Ensure fonts are loaded for accurate measurement
    document.fonts.ready.then(() => {
      // Reset any previous fitText scaling
      el.style.fontSize = '';
      
      // On desktop, we MUST measure against the parent container (the grid column)
      // because window.innerWidth is shared by two columns.
      // On mobile, parent is full width anyway.
      const parent = el.parentElement;
      const style = window.getComputedStyle(parent);
      const parentPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const availableWidth = parent.clientWidth - parentPadding;

      let fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      const minSize = 14; 

      // Mathematical precision with a small 2% safety buffer for rendering variations
      const currentWidth = Math.max(el.scrollWidth, el.offsetWidth);
      if (currentWidth > availableWidth) {
        const ratio = availableWidth / currentWidth;
        const newSize = Math.max(minSize, Math.floor(fontSize * ratio * 0.98));
        el.style.fontSize = newSize + 'px';
      }
    });
  }

  window.scrollToBlock = function(idx) {
    const blocksEls = document.querySelectorAll('.block');
    if(blocksEls[idx]) {
      blocksEls[idx].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ---------------- font / weight setup ----------------
  function initFonts(){}

  // ---------------- parallax ----------------
  let parallaxItems = [];
  function initParallax(){
    parallaxItems = Array.from(document.querySelectorAll('[data-parallax]')).map(el => ({
      el, factor: parseFloat(el.dataset.parallax)
    }));
  }

  function tickParallax(){
    const vh = window.innerHeight;
    for(const it of parallaxItems){
      const r = it.el.getBoundingClientRect();
      if(r.bottom < -200 || r.top > vh + 200) continue;
      const center = r.top + r.height/2;
      const offset = (center - vh/2) * it.factor * -1;
      const img = it.el.querySelector('.px-img, .px-img-inner');
      if(img) img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.18)`;
    }
    requestAnimationFrame(tickParallax);
  }

  // ---------------- reveal on scroll ----------------
  let revealObserver;
  function initReveal(scope){
    if(!revealObserver){
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if(e.isIntersecting){ 
            e.target.classList.add('in'); 
            // Load lazy backgrounds in this block
            e.target.querySelectorAll('[data-bg]').forEach(el => {
              el.style.backgroundImage = `url('${el.dataset.bg}')`;
            });
            revealObserver.unobserve(e.target); 
          }
        });
      }, {threshold: 0.12, root: stage, rootMargin: '0px'}); 
    }
    scope.querySelectorAll('.block').forEach(b => revealObserver.observe(b));
  }

  // ---------------- infinite scroll (bounded — 4 cycles max, then loops via top jump) ----------------
  const MAX_CYCLES = 4;
  function checkInfinite(){
    if(cycleCount >= MAX_CYCLES) return;
    const docH = stage.scrollHeight;
    const sy = stage.scrollTop + stage.clientHeight;
    if(sy > docH - stage.clientHeight * 1.5){
      appendCycle();
    }
  }

  // ---------------- progress + chip ----------------
  const progress = document.getElementById('progress');
  const chip = document.getElementById('chip');
  function tickUI(){
    const docH = stage.scrollHeight - stage.clientHeight;
    const p = docH > 0 ? stage.scrollTop / docH : 0;
    progress.style.transform = `scaleX(${p})`;

    // current block label
    const blocksEls = document.querySelectorAll('.block');
    let active = null;
    const mid = window.innerHeight * 0.4;
    for(const el of blocksEls){
      const r = el.getBoundingClientRect();
      if(r.top <= mid && r.bottom >= mid){ active = el; break; }
    }
    if(active){
      const idx = Array.from(blocksEls).indexOf(active);
      const cycleIdx = idx % blocks.length;
      const cycle = Math.floor(idx / blocks.length) + 1;
      chip.querySelector('.chip-n').textContent = String(cycleIdx+1).padStart(2,'0');
      chip.querySelector('.chip-total').textContent = '/ ' + blocks.length;
      chip.querySelector('.chip-cycle').textContent = '× ' + cycle;
    }
    requestAnimationFrame(tickUI);
  }

  // ---------------- init ----------------
  window.scrollTo(0,0);
  appendCycle();
  appendCycle(); // pre-render two cycles for smooth infinite feel

  // Handle resize (with debounce for performance)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.mega, .fruit-name, .display, .pull-a').forEach(fitText);
    }, 150);
  });

  stage.addEventListener('scroll', checkInfinite, {passive:true});
  requestAnimationFrame(tickParallax);
  requestAnimationFrame(tickUI);
})();
