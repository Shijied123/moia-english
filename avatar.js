/*
 * avatar.js — animated, illustrated AI teacher for Practice English.
 *
 * Plain script (no modules, no network). Defines one global:
 *
 *   var api = window.createAvatar(container);
 *   api.startTalking();      // mouth moves in varied shapes until stopTalking()
 *   api.stopTalking();       // mouth eases back to a closed, gentle smile
 *   api.pulse();             // extra mouth movement per spoken word (safe to call often)
 *   api.setListening(bool);  // subtle "I'm listening" look (brows up, small head tilt)
 *   api.destroy();           // removes timers and the SVG
 *
 * Extra (for tests): api.setMouth(name), name = closed|slight|open|o|ee.
 *
 * The SVG fills its container. Give the container a size (for example
 * width:100%; aspect-ratio:16/9). The view is re-framed on resize so her
 * face and shoulders always stay visible on wide and tall boxes.
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var instanceCount = 0;

  // Scene framing (scene units). REQUIRED must always be visible;
  // PREFERRED is shown whenever the container's shape allows it.
  var REQUIRED = { x: 290, y: 150, w: 420, h: 550 };
  var PREFERRED = { x: 130, y: 120, w: 740, h: 580 };
  var BOTTOM = 700; // bottom edge of the framed view

  // Mouth shapes. "closed" is drawn as a smiling lip line.
  var MOUTHS = {
    closed: null,
    slight: 'M484 349 Q500 354.5 516 349 Q500 362 484 349 Z',
    open: 'M484 348 Q500 352 516 348 Q514 368 500 369 Q486 368 484 348 Z',
    o: 'M500 346 C507 346 509 351 509 356 C509 362 506 366 500 366 C494 366 491 362 491 356 C491 351 493 346 500 346 Z',
    ee: 'M480 348 Q500 353 520 348 Q512 362 500 362 Q488 362 480 348 Z'
  };
  // Weights for picking the next shape while talking.
  var TALK_WEIGHTS = [['slight', 26], ['open', 30], ['ee', 18], ['o', 14], ['closed', 12]];

  function rand(min, max) { return min + Math.random() * (max - min); }

  function pickWeighted(list, avoid) {
    var total = 0, i;
    for (i = 0; i < list.length; i++) if (list[i][0] !== avoid) total += list[i][1];
    var r = Math.random() * total;
    for (i = 0; i < list.length; i++) {
      if (list[i][0] === avoid) continue;
      r -= list[i][1];
      if (r <= 0) return list[i][0];
    }
    return list[0][0] === avoid ? list[1][0] : list[0][0];
  }

  function buildMarkup(p) {
    // p = unique id prefix for this instance
    return '' +
      '<defs>' +
        '<radialGradient id="' + p + '-wall" cx="500" cy="330" r="620" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#f9f3e9"/>' +
          '<stop offset="1" stop-color="#ece1cf"/>' +
        '</radialGradient>' +
        '<linearGradient id="' + p + '-shirt" x1="0" y1="460" x2="0" y2="720" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#5585dc"/>' +
          '<stop offset="1" stop-color="#4874c9"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + p + '-vase" x1="745" y1="0" x2="805" y2="0" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#e3a27a"/>' +
          '<stop offset="1" stop-color="#c77d55"/>' +
        '</linearGradient>' +
        '<clipPath id="' + p + '-mclip"><path data-part="mouthClip" d="' + MOUTHS.open + '"/></clipPath>' +
        '<clipPath id="' + p + '-eyeL"><path d="M454 291 Q468 276 482 291 Q468 303 454 291 Z"/></clipPath>' +
        '<clipPath id="' + p + '-eyeR"><path d="M518 291 Q532 276 546 291 Q532 303 518 291 Z"/></clipPath>' +
      '</defs>' +

      // ---------- Room ----------
      '<rect x="-4000" y="-4000" width="9000" height="9000" fill="#ece1cf"/>' +
      '<rect x="-4000" y="-4000" width="9000" height="4614" fill="url(#' + p + '-wall)"/>' +
      // lower wall + chair rail
      '<rect x="-4000" y="614" width="9000" height="4000" fill="#e3d4bd"/>' +
      '<rect x="-4000" y="604" width="9000" height="12" fill="#d8c4a6"/>' +
      '<rect x="-4000" y="604" width="9000" height="3" fill="#e9dbc5"/>' +

      // framed picture (house + family)
      '<g>' +
        '<rect x="196" y="166" width="150" height="125" rx="4" fill="#8a6a4f" opacity="0.18"/>' +
        '<rect x="190" y="158" width="150" height="125" rx="4" fill="#9a6b45"/>' +
        '<rect x="196" y="164" width="138" height="113" rx="2" fill="#b8865c"/>' +
        '<rect x="202" y="170" width="126" height="101" fill="#fbf7ee"/>' +
        '<rect x="210" y="178" width="110" height="85" fill="#e6f0f6"/>' +
        '<circle cx="306" cy="192" r="7" fill="#f3c754"/>' +
        '<rect x="210" y="252" width="110" height="11" fill="#a9cc86"/>' +
        // house
        '<path d="M218 222 L246 198 L274 222 Z" fill="#d4664f"/>' +
        '<rect x="223" y="221" width="46" height="34" fill="#f2d27e"/>' +
        '<rect x="241" y="235" width="11" height="20" fill="#8d5b3b"/>' +
        '<rect x="228" y="228" width="9" height="9" fill="#9cc6e6"/>' +
        '<rect x="256" y="228" width="9" height="9" fill="#9cc6e6"/>' +
        // family: two adults and a child
        '<circle cx="284" cy="230" r="4.2" fill="#c98d68"/>' +
        '<path d="M279 255 L280.5 238 Q284 235 287.5 238 L289 255 Z" fill="#5b86d6"/>' +
        '<circle cx="298" cy="229" r="4.2" fill="#e5b590"/>' +
        '<path d="M292.5 255 L294.5 237 Q298 234 301.5 237 L303.5 255 Z" fill="#e17f8f"/>' +
        '<circle cx="310.5" cy="238" r="3.4" fill="#d9a27c"/>' +
        '<path d="M306.5 255 L307.5 244 Q310.5 241.5 313.5 244 L314.5 255 Z" fill="#f2b84b"/>' +
      '</g>' +

      // side table with vase of flowers
      '<g>' +
        '<ellipse cx="790" cy="560" rx="96" ry="7" fill="#8a6a4f" opacity="0.14"/>' +
        '<rect x="712" y="562" width="12" height="1200" fill="#9a6a44"/>' +
        '<rect x="856" y="562" width="12" height="1200" fill="#9a6a44"/>' +
        '<rect x="704" y="556" width="172" height="26" rx="2" fill="#a87650"/>' +
        '<rect x="696" y="544" width="188" height="14" rx="4" fill="#bd8b5f"/>' +
        '<rect x="696" y="544" width="188" height="4" rx="2" fill="#cfa176"/>' +
        // stems + leaves
        '<g stroke="#5f9a5a" stroke-width="3" stroke-linecap="round" fill="none">' +
          '<path d="M786 486 Q776 450 752 418"/>' +
          '<path d="M790 486 Q790 440 793 398"/>' +
          '<path d="M794 486 Q806 452 830 424"/>' +
          '<path d="M788 486 Q780 466 766 448"/>' +
          '<path d="M792 486 Q802 470 815 452"/>' +
        '</g>' +
        '<path d="M778 462 Q762 456 756 444 Q772 446 778 462 Z" fill="#6fae66"/>' +
        '<path d="M800 458 Q816 454 824 442 Q808 442 800 458 Z" fill="#6fae66"/>' +
        '<path d="M791 440 Q780 430 780 418 Q792 426 791 440 Z" fill="#7dbb72"/>' +
        // flower heads
        flower(752, 416, 11, '#e98a9b', '#f6d36b') +
        flower(793, 396, 12, '#f2c14e', '#d9822b') +
        flower(830, 422, 11, '#fff6ec', '#f2c14e') +
        flower(766, 446, 8.5, '#f2c14e', '#d9822b') +
        flower(815, 450, 8.5, '#e98a9b', '#f6d36b') +
        // vase
        '<path d="M766 544 C744 528 744 500 770 488 L770 478 L810 478 L810 488 C836 500 836 528 814 544 Z" fill="url(#' + p + '-vase)"/>' +
        '<rect x="766" y="474" width="48" height="8" rx="4" fill="#d8946b"/>' +
        '<path d="M764 520 Q772 506 784 500" stroke="#f3c6a6" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.7"/>' +
      '</g>' +

      // soft shadow of the figure on the wall
      '<ellipse cx="514" cy="520" rx="225" ry="255" fill="#7a5a36" opacity="0.06"/>' +

      // ---------- Figure ----------
      '<g data-part="figure">' +
        // back hair (behind neck and shirt)
        '<g data-part="headBack">' +
          '<path d="M404 282 C400 360 404 430 410 478 Q500 488 590 478 C596 430 600 360 596 282 Z" fill="#141218"/>' +
        '</g>' +

        // body: neck + shirt
        '<g data-part="body">' +
          '<path d="M474 360 L474 438 C472 452 462 458 448 462 L448 494 L552 494 L552 462 C538 458 528 452 526 438 L526 360 Z" fill="#efc19f"/>' +
          '<path d="M474 374 Q500 402 526 374 L526 396 Q500 416 474 396 Z" fill="#d9a07d" opacity="0.75"/>' +
          '<path d="M300 1700 L316 610 C320 534 345 494 396 477 C422 469 444 463 462 456 Q500 488 538 456 C556 463 578 469 604 477 C655 494 680 534 684 610 L700 1700 Z" fill="url(#' + p + '-shirt)"/>' +
          '<path d="M462 456 Q500 488 538 456" fill="none" stroke="#3f68b6" stroke-width="6" stroke-linecap="round"/>' +
          '<path d="M466 463 Q500 490 534 463" fill="none" stroke="#6a96e2" stroke-width="2" stroke-linecap="round" opacity="0.6"/>' +
          // arm creases and side shading
          '<path d="M356 532 Q346 580 344 700" fill="none" stroke="#3f68b6" stroke-width="3" stroke-linecap="round" opacity="0.55"/>' +
          '<path d="M644 532 Q654 580 656 700" fill="none" stroke="#3f68b6" stroke-width="3" stroke-linecap="round" opacity="0.55"/>' +
          '<path d="M316 610 C320 534 345 494 396 477 C372 500 356 540 350 610 L346 1700 L300 1700 Z" fill="#3f68b6" opacity="0.35"/>' +
          '<path d="M684 610 C680 534 655 494 604 477 C628 500 644 540 650 610 L654 1700 L700 1700 Z" fill="#3f68b6" opacity="0.35"/>' +
        '</g>' +

        // head front: face, features, front hair
        '<g data-part="headFront">' +
          // face
          '<path d="M426 270 C426 222 574 222 574 270 C576 318 560 360 530 380 Q500 396 470 380 C440 360 424 318 426 270 Z" fill="#efc19f"/>' +
          // soft jaw shading
          '<path d="M440 340 C450 362 462 374 470 380 Q500 396 530 380 C538 374 550 362 560 340 C548 368 528 386 500 388 C472 386 452 368 440 340 Z" fill="#dca482" opacity="0.55"/>' +
          // cheeks
          '<ellipse cx="449" cy="330" rx="15" ry="9" fill="#e8877e" opacity="0.28"/>' +
          '<ellipse cx="551" cy="330" rx="15" ry="9" fill="#e8877e" opacity="0.28"/>' +
          // eyebrows
          '<g data-part="brows" fill="none" stroke="#2a2329" stroke-width="4.5" stroke-linecap="round">' +
            '<path d="M451 268 Q466 259 484 264"/>' +
            '<path d="M549 268 Q534 259 516 264"/>' +
          '</g>' +
          // eyes
          eye(p + '-eyeL', 468, 'M454 291 Q468 276 482 291 Q468 303 454 291 Z',
              'M452.5 291.5 Q468 275 483 290', 'M454.5 289.5 L449 286.5',
              'M454 291 Q468 299 482 291', 470.6) +
          eye(p + '-eyeR', 532, 'M518 291 Q532 276 546 291 Q532 303 518 291 Z',
              'M517 290 Q532 275 547.5 291.5', 'M545.5 289.5 L551 286.5',
              'M518 291 Q532 299 546 291', 534.6) +
          // nose
          '<path d="M497 314 Q492 326 496 331 Q501 334 507 330" fill="none" stroke="#c98d6c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          // mouth
          '<g data-part="mouth">' +
            '<g data-part="mouthClosed">' +
              '<path d="M481 349 Q500 361.5 519 349" fill="none" stroke="#b8565f" stroke-width="3.6" stroke-linecap="round"/>' +
              '<path d="M493 362.5 Q500 365 507 362.5" fill="none" stroke="#d48a80" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>' +
            '</g>' +
            '<g data-part="mouthOpen" display="none">' +
              '<path data-part="mouthFill" d="' + MOUTHS.open + '" fill="#5e1f2a"/>' +
              '<g clip-path="url(#' + p + '-mclip)">' +
                '<rect x="476" y="338" width="48" height="14" rx="2" fill="#fffaf3"/>' +
                '<ellipse cx="500" cy="370" rx="11" ry="6.5" fill="#d8707a"/>' +
              '</g>' +
              '<path data-part="mouthEdge" d="' + MOUTHS.open + '" fill="none" stroke="#b8565f" stroke-width="2.4" stroke-linejoin="round"/>' +
            '</g>' +
          '</g>' +
          // front hair: side strands + bangs (one shape)
          '<path d="M412 484 C402 420 398 340 404 280 C410 212 450 180 500 180 C550 180 590 212 596 280 C602 340 598 420 588 484 Q575 488 562 480 C566 420 572 340 570 262 Q555 238 535 248 Q518 240 500 250 Q482 240 465 248 Q445 238 430 262 C428 340 434 420 438 480 Q425 488 412 484 Z" fill="#1d1b22"/>' +
          // hair sheen + strand lines
          '<path d="M436 214 Q466 190 506 191" fill="none" stroke="#45414f" stroke-width="6" stroke-linecap="round" opacity="0.8"/>' +
          '<g fill="none" stroke="#34313c" stroke-width="2" stroke-linecap="round">' +
            '<path d="M414 300 C412 360 416 420 422 470"/>' +
            '<path d="M586 300 C588 360 584 420 578 470"/>' +
            '<path d="M482 214 Q486 230 482 246"/>' +
            '<path d="M520 214 Q518 232 524 246"/>' +
          '</g>' +
        '</g>' +
      '</g>';
  }

  function flower(cx, cy, r, petal, center) {
    var s = '', i, a, px, py;
    for (i = 0; i < 5; i++) {
      a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      px = cx + Math.cos(a) * r * 0.62;
      py = cy + Math.sin(a) * r * 0.62;
      s += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + (r * 0.5).toFixed(1) + '" fill="' + petal + '"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.34).toFixed(1) + '" fill="' + center + '"/>';
  }

  function eye(clipId, cx, whitePath, lashPath, flickPath, closedPath, hx) {
    return '' +
      '<g data-part="eye" data-cx="' + cx + '">' +
        '<g data-part="eyeOpen">' +
          '<path d="' + whitePath + '" fill="#fffdf9"/>' +
          '<g clip-path="url(#' + clipId + ')">' +
            '<circle cx="' + cx + '" cy="290" r="7" fill="#4a3226"/>' +
            '<circle cx="' + cx + '" cy="290" r="3.4" fill="#1a1210"/>' +
            '<circle cx="' + hx + '" cy="287.4" r="1.9" fill="#ffffff"/>' +
          '</g>' +
          '<path d="' + lashPath + '" fill="none" stroke="#1d1b22" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="' + flickPath + '" fill="none" stroke="#1d1b22" stroke-width="2.4" stroke-linecap="round"/>' +
        '</g>' +
        '<path data-part="eyeClosed" d="' + closedPath + '" fill="none" stroke="#1d1b22" stroke-width="3" stroke-linecap="round" display="none"/>' +
      '</g>';
  }

  window.createAvatar = function (container) {
    var noop = function () {};
    var dead = { startTalking: noop, stopTalking: noop, pulse: noop, setListening: noop, setMouth: noop, destroy: noop };
    if (!container || typeof container.appendChild !== 'function') return dead;

    var prefix = 'tchr' + (++instanceCount) + Math.floor(Math.random() * 1e6).toString(36);
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('viewBox', PREFERRED.x + ' ' + PREFERRED.y + ' ' + PREFERRED.w + ' ' + PREFERRED.h);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Your English teacher');
    svg.setAttribute('focusable', 'false');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.innerHTML = buildMarkup(prefix);

    // If the container has no height of its own, keep the default framing
    // and let the SVG size itself from its viewBox.
    var collapsed = container.clientHeight < 2;
    if (collapsed) svg.style.height = 'auto';
    container.appendChild(svg);

    function q(name) { return svg.querySelector('[data-part="' + name + '"]'); }
    var body = q('body');
    var headBack = q('headBack');
    var headFront = q('headFront');
    var brows = q('brows');
    var mouthClosed = q('mouthClosed');
    var mouthOpen = q('mouthOpen');
    var mouthFill = q('mouthFill');
    var mouthEdge = q('mouthEdge');
    var mouthClip = q('mouthClip');
    var eyes = Array.prototype.slice.call(svg.querySelectorAll('[data-part="eye"]')).map(function (g) {
      return {
        cx: parseFloat(g.getAttribute('data-cx')),
        open: g.querySelector('[data-part="eyeOpen"]'),
        closed: g.querySelector('[data-part="eyeClosed"]')
      };
    });

    var destroyed = false;
    var talking = false;
    var listening = false;
    var mouth = 'closed';
    var talkTimer = null, settleTimer = null, blinkTimer = null, pulseTimer = null;
    var blinkSteps = [];
    var rafId = null;
    var lastPulse = 0;
    var ro = null;

    var motionQuery = null;
    try { motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { motionQuery = null; }
    function reducedMotion() { return !!(motionQuery && motionQuery.matches); }

    // ---------- Framing ----------
    function reframe() {
      if (destroyed || collapsed) return;
      var w = container.clientWidth, h = container.clientHeight;
      if (w < 2 || h < 2) return;
      var a = w / h, vw, vh, vx, vy;
      if (a >= PREFERRED.w / PREFERRED.h) {
        vh = PREFERRED.h; vw = vh * a; vy = PREFERRED.y;
      } else if (PREFERRED.h * a >= REQUIRED.w) {
        vh = PREFERRED.h; vw = vh * a; vy = PREFERRED.y;
      } else {
        vw = REQUIRED.w; vh = vw / a; vy = BOTTOM - vh;
      }
      vx = 500 - vw / 2;
      svg.setAttribute('viewBox', vx.toFixed(2) + ' ' + vy.toFixed(2) + ' ' + vw.toFixed(2) + ' ' + vh.toFixed(2));
    }
    reframe();
    if (typeof window.ResizeObserver === 'function') {
      ro = new ResizeObserver(function () { reframe(); });
      ro.observe(container);
    } else {
      window.addEventListener('resize', reframe);
    }

    // ---------- Mouth ----------
    function setMouth(name) {
      if (destroyed || !MOUTHS.hasOwnProperty(name)) return;
      mouth = name;
      if (name === 'closed') {
        mouthOpen.setAttribute('display', 'none');
        mouthClosed.removeAttribute('display');
      } else {
        var d = MOUTHS[name];
        mouthFill.setAttribute('d', d);
        mouthEdge.setAttribute('d', d);
        mouthClip.setAttribute('d', d);
        mouthClosed.setAttribute('display', 'none');
        mouthOpen.removeAttribute('display');
      }
    }

    function clearTalkTimers() {
      if (talkTimer) { clearTimeout(talkTimer); talkTimer = null; }
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
      if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
    }

    function talkStep() {
      talkTimer = null;
      if (destroyed || !talking) return;
      setMouth(pickWeighted(TALK_WEIGHTS, mouth));
      // irregular rhythm, roughly 80-160 ms, with an occasional short hold
      var delay = rand(80, 160);
      if (Math.random() < 0.08) delay += rand(60, 140);
      talkTimer = setTimeout(talkStep, delay);
    }

    function startTalking() {
      if (destroyed || talking) return;
      talking = true;
      clearTalkTimers();
      talkStep();
    }

    function stopTalking() {
      if (destroyed) return;
      talking = false;
      clearTalkTimers();
      if (mouth === 'closed') return;
      // ease back: a brief half-open frame, then the closed smile
      setMouth('slight');
      settleTimer = setTimeout(function () {
        settleTimer = null;
        if (!destroyed && !talking) setMouth('closed');
      }, 90);
    }

    function pulse() {
      if (destroyed) return;
      var now = Date.now();
      if (now - lastPulse < 70) return; // throttle: safe to call often
      lastPulse = now;
      var shape = pickWeighted([['open', 45], ['ee', 30], ['o', 25]], mouth);
      if (talking) {
        if (talkTimer) clearTimeout(talkTimer);
        setMouth(shape);
        talkTimer = setTimeout(talkStep, rand(90, 150));
      } else {
        if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
        if (pulseTimer) clearTimeout(pulseTimer);
        setMouth(shape);
        pulseTimer = setTimeout(function () {
          pulseTimer = null;
          if (!destroyed && !talking) setMouth('closed');
        }, rand(110, 150));
      }
    }

    // ---------- Blinking ----------
    function setEyes(state) { // 'open' | 'half' | 'closed'
      for (var i = 0; i < eyes.length; i++) {
        var e = eyes[i];
        if (state === 'closed') {
          e.open.setAttribute('display', 'none');
          e.closed.removeAttribute('display');
        } else {
          e.closed.setAttribute('display', 'none');
          e.open.removeAttribute('display');
          if (state === 'half') {
            e.open.setAttribute('transform', 'translate(0 291) scale(1 0.45) translate(0 -291)');
          } else {
            e.open.removeAttribute('transform');
          }
        }
      }
    }

    function clearBlinkSteps() {
      for (var i = 0; i < blinkSteps.length; i++) clearTimeout(blinkSteps[i]);
      blinkSteps = [];
    }

    function blinkOnce(startAt) {
      var seq = [['half', 0], ['closed', 40], ['half', 140], ['open', 185]];
      seq.forEach(function (s) {
        blinkSteps.push(setTimeout(function () { if (!destroyed) setEyes(s[0]); }, startAt + s[1]));
      });
      return startAt + 185;
    }

    function scheduleBlink() {
      if (destroyed) return;
      blinkTimer = setTimeout(function () {
        blinkTimer = null;
        if (destroyed) return;
        clearBlinkSteps();
        var end = blinkOnce(0);
        if (Math.random() < 0.2) end = blinkOnce(end + 120); // occasional double blink
        blinkSteps.push(setTimeout(function () { blinkSteps = []; scheduleBlink(); }, end + 20));
      }, rand(2500, 6000));
    }
    scheduleBlink();

    // ---------- Idle motion + listening ----------
    var tilt = 0, browLift = 0, lastT = 0;
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();

    function frame(now) {
      rafId = null;
      if (destroyed) return;
      var t = (now - t0) / 1000;
      var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0.016;
      lastT = now;
      var reduce = reducedMotion();

      var targetTilt = listening && !reduce ? -2.6 : 0;
      var targetBrow = listening ? -3.5 : 0;
      if (reduce) {
        tilt = targetTilt; browLift = targetBrow;
      } else {
        var k = 1 - Math.exp(-dt / 0.18);
        tilt += (targetTilt - tilt) * k;
        browLift += (targetBrow - browLift) * k;
      }

      var sway = 0, breathe = 0;
      if (!reduce) {
        sway = 0.7 * Math.sin(t * 2 * Math.PI / 7.3) + 0.35 * Math.sin(t * 2 * Math.PI / 3.1 + 1.2);
        if (talking) sway += 0.5 * Math.sin(t * 2 * Math.PI / 1.7);
        breathe = 1.3 * Math.sin(t * 2 * Math.PI / 4.4);
      }

      var bodyT = 'translate(0 ' + breathe.toFixed(2) + ')';
      var headT = bodyT + ' rotate(' + (sway + tilt).toFixed(3) + ' 500 440)';
      body.setAttribute('transform', bodyT);
      headBack.setAttribute('transform', headT);
      headFront.setAttribute('transform', headT);
      brows.setAttribute('transform', 'translate(0 ' + browLift.toFixed(2) + ')');

      rafId = window.requestAnimationFrame(frame);
    }
    if (typeof window.requestAnimationFrame === 'function') {
      rafId = window.requestAnimationFrame(frame);
    }

    function setListening(on) {
      if (destroyed) return;
      listening = !!on;
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      talking = false;
      clearTalkTimers();
      clearBlinkSteps();
      if (blinkTimer) { clearTimeout(blinkTimer); blinkTimer = null; }
      if (rafId && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(rafId);
      rafId = null;
      if (ro) { ro.disconnect(); ro = null; } else { window.removeEventListener('resize', reframe); }
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    }

    return {
      startTalking: startTalking,
      stopTalking: stopTalking,
      pulse: pulse,
      setListening: setListening,
      setMouth: function (name) { if (!talking) setMouth(name); },
      destroy: destroy
    };
  };
})();
