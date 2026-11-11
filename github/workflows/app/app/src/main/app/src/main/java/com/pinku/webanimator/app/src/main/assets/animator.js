(function () {
  if (window.__paDefined) return;
  window.__paDefined = true;

  window.__paStart = function (cfg) {
    if (window.__paStarted) return;
    window.__paStarted = true;
    cfg = cfg || {};
    var C = { loader: cfg.loader !== false, sound: cfg.sound !== false, birds: cfg.birds !== false };
    var D = document, H = D.documentElement;
    var WORD = 'DECODING', DUR = 2400;
    var MSG = [[0, '> STARTING DECODER...'], [.25, '> READING LAYERS...'], [.5, '> DECODING CONTENT...'], [.75, '> BUILDING PAGE...'], [.92, '> DONE']];

    var CSS = `
#pa-ld{position:fixed;inset:0;z-index:2147483646;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-transform:uppercase;font-family:ui-monospace,Menlo,Consolas,monospace;color:#fff;transition:opacity .9s ease;padding:24px}
#pa-ld.hide{opacity:0;pointer-events:none}
#pa-w,#pa-s,#pa-bw,#pa-p{animation:paIn .9s ease both,paPulse 2s ease-in-out .9s infinite}
#pa-w{font-size:clamp(26px,8.5vw,54px);letter-spacing:.14em;font-weight:700;text-shadow:0 0 22px rgba(255,255,255,.3);text-align:center}
#pa-d{display:inline-block;width:1.6em;text-align:left}
#pa-s{font-size:13px;color:#9a9a9a;margin-top:14px;min-height:20px}
#pa-bw{width:min(320px,78vw);height:4px;background:#222;border-radius:4px;margin-top:22px;overflow:hidden}
#pa-bf{height:100%;width:0;background:#fff;box-shadow:0 0 10px rgba(255,255,255,.5)}
#pa-p{font-size:13px;color:#777;margin-top:10px}
#pa-snd{position:absolute;bottom:28px;font-size:12px;letter-spacing:.22em;color:#777;display:none;animation:paBl 1.2s ease-in-out infinite}
@keyframes paIn{from{opacity:0}to{opacity:1}}
@keyframes paPulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes paBl{50%{opacity:.25}}
.pa-pre{opacity:0!important}
.pa-pre.pa-in{opacity:1!important;transition:opacity .5s ease}
.pa-wd{opacity:0;transition:opacity .5s ease}
.pa-wd.on{opacity:1}
#pa-birds{position:fixed;inset:0;z-index:2147483647;pointer-events:none;overflow:hidden}
.pa-bird{position:absolute;left:0;top:0;will-change:transform;color:#fff;filter:drop-shadow(0 0 5px rgba(255,255,255,.5))}
.pa-bird svg{display:block;overflow:visible}
.pa-bird path{fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.pa-wl,.pa-wr{transform-origin:20px 10px;animation-duration:var(--f,.5s);animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate}
.pa-wl{animation-name:paFl}.pa-wr{animation-name:paFr}
@keyframes paFl{from{transform:rotate(-30deg)}to{transform:rotate(24deg)}}
@keyframes paFr{from{transform:rotate(30deg)}to{transform:rotate(-24deg)}}
@media (prefers-reduced-motion:reduce){.pa-pre{opacity:1!important}}
`;
    var st = D.createElement('style');
    st.textContent = CSS;
    H.appendChild(st);

    function onReady(fn) {
      if (D.body) fn(); else D.addEventListener('DOMContentLoaded', fn);
    }

    /* ---------- SOUND (WebAudio, no files) ---------- */
    var AC = null, lastTick = 0;
    if (C.sound) {
      try { var AX = window.AudioContext || window.webkitAudioContext; if (AX) AC = new AX(); } catch (e) {}
    }
    function on() { return AC && AC.state === 'running'; }
    function unlock() {
      if (AC && AC.state === 'suspended') {
        AC.resume().then(function () { var h = D.getElementById('pa-snd'); if (h) h.style.display = 'none'; });
      }
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true }); });
    function tick(p) {
      if (!on()) return;
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'square'; o.frequency.value = 500 + Math.random() * 900 + p * 600;
      g.gain.setValueAtTime(.03, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .06);
    }
    function drone(sec) {
      if (!on()) return;
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(220, t + sec);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .4);
      g.gain.setValueAtTime(.05, t + sec - .2); g.gain.exponentialRampToValueAtTime(.0001, t + sec);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + sec + .05);
    }
    function chime() {
      if (!on()) return;
      [880, 1320].forEach(function (f, i) {
        var t = AC.currentTime + i * .12, o = AC.createOscillator(), g = AC.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.08, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .7);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .75);
      });
    }

    /* ---------- DECODING LOADER ---------- */
    function runLoader(done) {
      var finished = false;
      function finish() { if (!finished) { finished = true; done(); } }
      var ld = D.createElement('div');
      ld.id = 'pa-ld';
      ld.innerHTML = '<div id="pa-w">' + WORD + '<span id="pa-d"></span></div><div id="pa-s">&gt; STARTING...</div><div id="pa-bw"><div id="pa-bf"></div></div><div id="pa-p">0%</div><div id="pa-snd">TAP FOR SOUND</div>';
      H.appendChild(ld);
      var dEl = ld.querySelector('#pa-d'), sEl = ld.querySelector('#pa-s'), bf = ld.querySelector('#pa-bf'), pc = ld.querySelector('#pa-p'), snd = ld.querySelector('#pa-snd');
      setTimeout(function () { if (AC && AC.state !== 'running') snd.style.display = 'block'; }, 400);
      drone(DUR / 1000);
      var t0 = performance.now();
      function frame(now) {
        var p = Math.min(1, (now - t0) / DUR);
        dEl.textContent = p < 1 ? '.'.repeat(Math.floor(now / 320) % 4) : '...';
        bf.style.width = (p * 100) + '%';
        pc.textContent = Math.floor(p * 100) + '%';
        for (var k = MSG.length - 1; k >= 0; k--) { if (p >= MSG[k][0]) { sEl.textContent = MSG[k][1]; break; } }
        if (p < 1 && now - lastTick > 75) { tick(p); lastTick = now; }
        if (p < 1) { requestAnimationFrame(frame); }
        else {
          chime();
          setTimeout(function () {
            ld.classList.add('hide');
            setTimeout(finish, 350);
            setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 1100);
          }, 300);
        }
      }
      requestAnimationFrame(frame);
      // safety: never leave the page covered
      setTimeout(function () {
        if (ld.parentNode) ld.parentNode.removeChild(ld);
        finish();
      }, DUR + 4000);
    }

    /* ---------- PAGE REVEAL: one by one, words fade in ---------- */
    var SEL = 'h1,h2,h3,h4,p,img,video,figure,li,article,blockquote,table,button';
    var SKIP = 'nav,header,footer,[role="dialog"],[role="navigation"],[aria-modal="true"],dialog,input,textarea,select,form';
    var io = null, timer = 0;

    function wrapWords(el) {
      var tag = el.tagName;
      if (!/^(H1|H2|H3|H4|P|LI)$/.test(tag)) return;
      if (!el.childNodes.length || el.textContent.length > 280) return;
      for (var i = 0; i < el.childNodes.length; i++) { if (el.childNodes[i].nodeType !== 3) return; }
      var frag = D.createDocumentFragment(), words = [];
      el.textContent.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(D.createTextNode(tok)); }
        else { var sp = D.createElement('span'); sp.className = 'pa-wd'; sp.textContent = tok; frag.appendChild(sp); words.push(sp); }
      });
      el.textContent = '';
      el.appendChild(frag);
      el.__paWords = words;
    }

    function reveal(batch) {
      batch.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      batch.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add('pa-in');
          var w = el.__paWords || [];
          w.forEach(function (s, j) { setTimeout(function () { s.classList.add('on'); }, j * 60); });
          setTimeout(function () { el.classList.remove('pa-pre', 'pa-in'); }, 700 + w.length * 60);
        }, i * 130);
      });
    }

    function scan() {
      if (!D.body || !io) return;
      var list = D.body.querySelectorAll(SEL), n = 0;
      for (var i = 0; i < list.length && n < 400; i++) {
        var el = list[i];
        if (el.__paDone) continue;
        if (el.closest(SKIP)) continue;
        if (el.parentElement && el.parentElement.closest('.pa-pre')) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 10) continue;
        var pos = getComputedStyle(el).position;
        if (pos === 'fixed' || pos === 'sticky') continue;
        el.__paDone = true;
        try { wrapWords(el); } catch (e) {}
        el.classList.add('pa-pre');
        io.observe(el);
        n++;
      }
    }

    function startReveal() {
      onReady(function () {
        io = new IntersectionObserver(function (entries) {
          var vis = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
          vis.forEach(function (el) { io.unobserve(el); });
          if (vis.length) reveal(vis);
        }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
        scan();
        new MutationObserver(function () {
          clearTimeout(timer);
          timer = setTimeout(scan, 300);
        }).observe(D.body, { childList: true, subtree: true });
      });
    }

    /* ---------- BIRDS ---------- */
    function startBirds() {
      var box = D.createElement('div');
      box.id = 'pa-birds';
      H.appendChild(box);
      var SVG = '<svg width="46" height="24" viewBox="0 0 40 20"><g class="pa-wl"><path d="M20 10 Q11 0 0 6"/></g><g class="pa-wr"><path d="M20 10 Q29 0 40 6"/></g></svg>';
      function fly(el) {
        var W = window.innerWidth, Hh = window.innerHeight;
        var s = .55 + Math.random() * 1.0, dir = Math.random() < .78 ? 1 : -1;
        var y = Math.random() * Hh * .6 + Hh * .04, dur = (13 + Math.random() * 18) * 1000 * (1.4 - s * .4);
        var x0 = dir > 0 ? -80 : W + 80, x1 = dir > 0 ? W + 80 : -80, wob = 20 + Math.random() * 50;
        function tf(x, yy) { return 'translate(' + x + 'px,' + yy + 'px) scale(' + (s * dir) + ',' + s + ')'; }
        el.style.opacity = (.45 + s * .35).toFixed(2);
        el.style.setProperty('--f', (.38 + Math.random() * .3).toFixed(2) + 's');
        var a = el.animate([
          { transform: tf(x0, y) },
          { transform: tf(x0 + (x1 - x0) * .35, y - wob), offset: .35 },
          { transform: tf(x0 + (x1 - x0) * .7, y + wob * .7), offset: .7 },
          { transform: tf(x1, y - wob * .4) }
        ], { duration: dur, easing: 'linear' });
        a.onfinish = function () { fly(el); };
      }
      for (var i = 0; i < 6; i++) {
        var b = D.createElement('div');
        b.className = 'pa-bird';
        b.innerHTML = SVG;
        box.appendChild(b);
        (function (el, d) { setTimeout(function () { fly(el); }, d); })(b, i * 700);
      }
    }

    /* ---------- GO ---------- */
    if (C.birds) startBirds();
    if (C.loader) runLoader(startReveal); else startReveal();
  };
})();
