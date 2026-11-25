// Die Koje · Video-Scrollytelling v2
// Normales Softscrolling mit Lenis. Der Abschnitt in der Bildschirmmitte ist aktiv und
// bestimmt das Hintergrundvideo (harter Schnitt); Feature-Videos starten schon, wenn der
// Jubel-Titel oben bei 100 px ist. Feature-Texte erscheinen, sobald der
// Feature-Abschnitt ins Bild kommt (TEXT_START). Headlines werden Wort für Wort aus einer
// Maske nach oben eingeblendet. Beim Laden läuft ein Intro (Loader + Overlay).
(function () {
  var VEIL = 0.5;                  // Overlay #000 bei 50 %
  var TEXT_START = 0.65;           // Feature-Text erscheint, wenn die Oberkante des Feature-Abschnitts diese Höhe erreicht
                                   // (Anteil der Bildhöhe von oben: 1.0 = unterer Bildrand = sehr früh, 0.5 = Bildmitte)
  var INTRO_HEADLINE_DELAY = 1500; // ms ab Start der Overlay-Bewegung bis zum Headline-Reveal
  var PLAYER_IDLE = 5000;          // ms ohne Bewegung, bis die Player-Steuerung ausblendet

  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-video]"));
  var jubels = sections.filter(function (s) { return s.classList.contains("jubel"); });
  var ctaSection = document.querySelector(".cta");
  var veil = document.getElementById("veil");
  var thumb = document.getElementById("thumb");
  var player = document.getElementById("player");
  var layers = [document.getElementById("bgA"), document.getElementById("bgB")];
  var front = 0;
  function src(name) { return "assets/video/" + name + ".mp4"; }
  function poster(name) { return "assets/video/posters/" + name + ".jpg"; }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // ---------- Lenis Softscroll ----------
  // lerp = Trägheit (kleiner = weicher, 0.05–0.15), wheelMultiplier = Tempo pro Mausrad-Raste
  var lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1.2, smoothWheel: true, syncTouch: false });
    window.lenis = lenis;
    lenis.stop();                  // während des Intros nicht scrollen
  }

  // ---------- Headlines in Wörter zerlegen (für den Masken-Reveal) ----------
  Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
    var i = 0;
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = "";
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "w";
          var inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--wi", i++);
          w.appendChild(inner);
          el.appendChild(w);
        });
      } else {
        el.appendChild(n);        // <br> usw. bleiben erhalten
      }
    });
  });

  // ---------- Hintergrundvideos (harter Schnitt) ----------
  var currentName = "00_hero";
  var lastPush = 0;
  var introDone = false;
  function play(v) {
    if (reduced || !v) return;
    v.muted = true;
    v.setAttribute("muted", "");
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function currentLayer() { return layers[front]; }
  function retry() {
    var v = currentLayer();
    if (introDone && v.paused && !reduced && player.hidden && lastPush < window.innerHeight) play(v);
  }
  ["pointerdown", "touchstart", "keydown", "wheel"].forEach(function (ev) { window.addEventListener(ev, retry, { passive: true }); });

  // Reihenfolge der Videos von oben nach unten (für das Vorladen des nächsten Videos)
  var order = [];
  sections.forEach(function (s) { var n = s.dataset.video; if (n && order.indexOf(n) < 0) order.push(n); });
  function nextAfter(name) { return order[order.indexOf(name) + 1] || null; }
  function layerHas(v, name) { return v.dataset.name === name; }
  function loadInto(v, name) {
    v.dataset.name = name;
    v.poster = poster(name);
    v.src = src(name);
    v.preload = "auto";
    v.load();
  }

  var cutTimer = null, preloadTimer = null;
  function showVideo(name) {
    if (!name || name === currentName) return;
    currentName = name;
    var out = layers[front];
    var inc = layers[1 - front];
    clearTimeout(cutTimer);
    clearTimeout(preloadTimer);
    if (layerHas(inc, name)) {
      // schon vorgeladen → sofort schneiden
      try { inc.currentTime = 0; } catch (e) {}
    } else {
      loadInto(inc, name);
    }
    play(inc);
    var done = false;
    function cut() {
      if (done || currentName !== name) return;
      done = true;
      front = layers.indexOf(inc);
      inc.classList.add("is-active");
      out.classList.remove("is-active");
      out.pause();
      // den frei gewordenen Layer gleich mit dem nächsten Video vorladen
      var next = nextAfter(name);
      if (next) preloadTimer = setTimeout(function () { if (out !== currentLayer() && !layerHas(out, next)) loadInto(out, next); }, 400);
    }
    // Schnitt, sobald das neue Video ein Bild hat – spätestens nach 250 ms (dann mit Standbild)
    if (inc.readyState >= 2) cut();
    else {
      inc.addEventListener("loadeddata", cut, { once: true });
      cutTimer = setTimeout(cut, 250);
    }
  }

  // Cache vorwärmen: nach dem Intro alle weiteren Videos nacheinander laden (eins nach dem anderen)
  var warm = document.getElementById("bgWarm");
  var warmQueue = [];
  function warmNext() {
    var name = warmQueue.shift();
    if (!name) { warm.removeAttribute("src"); warm.load(); return; }
    var doneW = false;
    function next() { if (doneW) return; doneW = true; setTimeout(warmNext, 50); }
    warm.oncanplaythrough = next;
    warm.onerror = next;
    warm.onprogress = function () {
      var b = warm.buffered;
      if (b.length && warm.duration && b.end(b.length - 1) >= warm.duration - 0.2) next();
    };
    warm.src = src(name);
    warm.preload = "auto";
    warm.load();
    setTimeout(next, 10000);
  }
  function startWarmup() {
    warmQueue = order.filter(function (n) { return n !== "00_hero"; });
    warmNext();
  }

  // ---------- Thumbnail unten rechts ----------
  var thumbImg = thumb.querySelector("img");
  var currentThumb = thumbImg.getAttribute("src");
  function setThumb(section) {
    thumb.dataset.full = section.dataset.full || thumb.dataset.full;
    var t = section.dataset.thumb;
    if (!t || t === currentThumb) return;
    currentThumb = t;
    thumbImg.src = t;
  }

  // ---------- Kapitel oben links ----------
  var chapter = document.getElementById("chapter");
  var chNum = chapter.querySelector(".chapter-num");
  var chLabel = chapter.querySelector(".chapter-label");
  var currentIndex = null;
  function setChapter(section) {
    var idx = section.dataset.index || null;
    if (idx === currentIndex) return;
    var wasVisible = currentIndex !== null;
    currentIndex = idx;
    if (!idx) { chapter.classList.remove("is-visible"); return; }
    var apply = function () {
      chNum.textContent = idx;
      chLabel.textContent = section.dataset.label;
      chapter.classList.remove("is-swapping");
      chapter.classList.add("is-visible");
    };
    if (wasVisible) { chapter.classList.add("is-swapping"); setTimeout(apply, 250); }
    else apply();
  }

  // ---------- Scroll-Logik ----------
  var current = null;
  var ticking = false;
  var rootStyle = document.documentElement.style;
  var pxBoxes = Array.prototype.slice.call(document.querySelectorAll(".px"));
  var pxVideos = Array.prototype.slice.call(document.querySelectorAll(".px--video video"));
  var indicator = document.getElementById("dotsIndicator");
  var DOT_STEP = 30;               // 20 px Linie + 10 px Abstand
  var FEATURE_SWITCH = 100;        // Feature-Video startet, wenn der Jubel-Titel 100 px unter der Oberkante ist
  var jubelTexts = jubels.map(function (j) { return j.querySelector(".jubel-text"); });
  // Scroll-Position, bei der ein Jubel-Titel genau in der Bildmitte steht (Ziel für Pagination-Klicks)
  function jubelCenterY(j) { return j.offsetTop + j.offsetHeight / 2 - window.innerHeight / 2; }
  var ctaTitle = ctaSection.querySelector(".reveal");

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var mid = vh / 2;
    var y = window.scrollY;

    // Rote Fläche: wie weit ist sie schon im Bild? → fixe Ebenen mit nach oben schieben
    var ctaTop = ctaSection.getBoundingClientRect().top;
    var push = Math.max(0, Math.min(vh, vh - ctaTop));
    rootStyle.setProperty("--push", push + "px");
    lastPush = push;
    if (introDone) {
      if (push >= vh) { if (!currentLayer().paused) currentLayer().pause(); }
      else if (currentLayer().paused && !reduced && player.hidden) play(currentLayer());
    }

    // Scroll-Hinweis nur ganz oben
    body.classList.toggle("is-scrolled", y > 10);

    // Parallax: Box bewegt sich mit data-speed, das Bild darin zusätzlich leicht nach oben
    pxVideos.forEach(function (v) {
      // Feature-Video im linken Parallax-Bild nur abspielen, solange es im Bild ist
      var r = v.parentNode.getBoundingClientRect();
      var visible = r.bottom > -50 && r.top < vh + 50 && introDone && player.hidden;
      if (visible && v.paused && !reduced) { v.preload = "auto"; play(v); }
      else if (!visible && !v.paused) v.pause();
    });
    if (!reduced) pxBoxes.forEach(function (box) {
      var r = box.parentNode.parentNode.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      var progress = (r.top + r.height / 2 - mid) / vh;     // 0 = Abschnittsmitte in Bildmitte
      box.style.transform = "translate3d(0," + (progress * parseFloat(box.dataset.speed) * vh).toFixed(1) + "px,0)";
      box.firstElementChild.style.transform = "translate3d(0," + (progress * 0.12 * box.offsetHeight).toFixed(1) + "px,0)";
    });

    // Aktiver Abschnitt + Feature-Texte
    var active = sections[0];
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (s.classList.contains("feature")) {
        // Feature-Video schon, wenn der Titel der vorherigen Jubel-Szene oben bei 100 px ist
        var jt = s.previousElementSibling && s.previousElementSibling.querySelector(".jubel-text");
        if ((jt && jt.getBoundingClientRect().top <= FEATURE_SWITCH) || r.top <= mid) active = s;
      } else if (r.top <= mid) active = s;
      if (s.classList.contains("feature")) {
        // das letzte Feature bleibt stehen und wird von der roten Fläche nach oben geschoben
        var beforeCta = s.nextElementSibling === ctaSection;
        s.classList.toggle("is-text", r.top <= vh * TEXT_START && r.bottom > (beforeCta ? 0 : mid));
      }
    });

    if (ctaTop < vh * 0.6) ctaTitle.classList.add("is-revealed");
    else if (ctaTop > vh) ctaTitle.classList.remove("is-revealed");

    if (active !== current) {
      if (current) current.classList.remove("is-active");
      current = active;
      active.classList.add("is-active");
      if (introDone) showVideo(active.dataset.video);
      setThumb(active);
      setChapter(active);
      body.classList.toggle("on-hero", active.classList.contains("hero"));
      body.classList.toggle("on-red", active.classList.contains("cta"));
    }

    // Overlay 35 %
    var veilOn = active.classList.contains("feature") ? active.classList.contains("is-text") : true;
    veil.style.opacity = veilOn ? VEIL : 0;

    // Pagination: rote Linie wandert stufenlos mit; deckungsgleich mit der weißen Linie,
    // wenn der jeweilige Jubel-Titel genau in der Bildmitte steht
    var pos = 0;
    for (var i = 0; i < jubels.length; i++) {
      var a = jubelCenterY(jubels[i]);
      var b = i + 1 < jubels.length ? jubelCenterY(jubels[i + 1]) : a;
      if (y >= a) pos = i + (b > a ? Math.min(1, (y - a) / (b - a)) : 0);
    }
    indicator.style.transform = "translate3d(0," + (pos * DOT_STEP).toFixed(1) + "px,0)";
  }
  function onScroll() {
    retry();
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // ---------- Interne Links (#…): Pagination, Logo, „Alle Features nochmals erleben!“ ----------
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var target = id === "top" ? sections[0] : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    // Jubel-Szenen so anfahren, dass der Titel genau in der Bildmitte steht
    var ty = target.classList.contains("jubel") ? jubelCenterY(target) : target.offsetTop;
    ty = Math.max(0, Math.min(ty, document.documentElement.scrollHeight - window.innerHeight));
    var far = Math.abs(ty - window.scrollY) > window.innerHeight * 3;
    if (lenis) lenis.scrollTo(ty, { duration: far ? 1.6 : 1 });
    else window.scrollTo(0, ty);
  });

  // ---------- Intro ----------
  // Overlay → weiße Linie wächst aus der Mitte → roter Fortschritt aus der Mitte
  // → Linie zieht sich zur Mitte zusammen → Overlay fährt nach unten weg → Video läuft
  // → nach INTRO_HEADLINE_DELAY: Headline-Reveal, Copy-Fade, Thumbnail-Fade.
  var intro = document.getElementById("intro");
  var introBar = document.getElementById("introBar");
  var heroTitle = document.querySelector(".hero .reveal");
  var heroVideo = layers[0];

  function finishIntro() {
    introDone = true;
    body.classList.remove("is-intro");
    if (lenis) lenis.start();
    onScroll();
  }
  var OVERLAY_DURATION = 850;      // ms, muss zu .intro { transition: height … } in css/style.css passen
  // Ablauf nach dem Laden: Linie zur Mitte auf 0 → kurze Pause → Overlay-Reveal
  var LOADER_PAUSE = 150, LOADER_COLLAPSE = 450;   // ms, passend zu css/style.css
  function runIntroSequence() {
    intro.classList.add("is-collapse");                      // Linie zur Mitte auf 0
    setTimeout(function () {
      try { heroVideo.currentTime = 0; } catch (e) {}
      play(heroVideo);                                       // Video läuft, während das Overlay wegfährt
      intro.classList.add("is-leaving");                     // Höhe 100vh → 0
      setTimeout(function () { intro.style.display = "none"; finishIntro(); }, OVERLAY_DURATION + 50);
      setTimeout(function () { body.classList.add("intro-pill"); heroTitle.classList.add("is-revealed"); }, INTRO_HEADLINE_DELAY);
      setTimeout(function () { body.classList.add("intro-copy"); }, INTRO_HEADLINE_DELAY + 350);
      setTimeout(function () { body.classList.add("intro-thumb"); }, INTRO_HEADLINE_DELAY + 600);
      // erstes Jubel-Video schon in den freien Layer laden, danach den Rest vorwärmen
      var first = nextAfter("00_hero");
      if (first) loadInto(layers[1], first);
      setTimeout(startWarmup, 1500);
    }, LOADER_COLLAPSE + LOADER_PAUSE);
  }

  if (reduced) {
    intro.style.display = "none";
    heroTitle.classList.add("is-revealed");
    body.classList.add("intro-pill", "intro-copy", "intro-thumb");
    finishIntro();
    play(heroVideo);
    startWarmup();
  } else {
    // Echter Ladefortschritt: Hero-Video (gepuffert), Schriften, Logo/Thumbnail/Poster, Seite.
    // Der Balken folgt dem Fortschritt weich; fertig, sobald das Hero-Video durchspielen kann.
    var parts = { video: 0, fonts: 0, images: 0, page: 0 };
    var WEIGHTS = { video: 0.65, fonts: 0.1, images: 0.1, page: 0.15 };
    var shown = 0, finished = false;
    // Loader: nach 0,5 s wächst die weiße Linie aus der Mitte, erst danach startet der rote Fortschritt
    var LOADER_DELAY = 500, LOADER_GROW = 550;
    var barReady = false;
    setTimeout(function () { intro.classList.add("show-loader"); }, LOADER_DELAY);
    setTimeout(function () { barReady = true; }, LOADER_DELAY + LOADER_GROW);
    function target() {
      var t = 0;
      for (var k in parts) t += parts[k] * WEIGHTS[k];
      return Math.min(1, t);
    }
    function allDone() { for (var k in parts) if (parts[k] < 1) return false; return true; }
    (function animate() {
      if (barReady) {
        var t = target();
        shown += (t - shown) * 0.1;                          // weich nachziehen
        if (t - shown < 0.002) shown = t;
        introBar.style.transform = "scaleX(" + shown.toFixed(4) + ")";
        if (allDone() && shown >= 0.999) {
          if (!finished) { finished = true; setTimeout(runIntroSequence, 150); }
          return;
        }
      }
      requestAnimationFrame(animate);
    })();

    // Hero-Video: gepufferter Anteil, 100 % bei "canplaythrough"
    function videoProgress() {
      var b = heroVideo.buffered, d = heroVideo.duration;
      if (heroVideo.readyState >= 4) { parts.video = 1; return; }
      if (b.length && d) parts.video = Math.max(parts.video, Math.min(0.98, b.end(b.length - 1) / d));
    }
    heroVideo.preload = "auto";
    ["progress", "loadedmetadata", "loadeddata", "canplay"].forEach(function (ev) { heroVideo.addEventListener(ev, videoProgress); });
    heroVideo.addEventListener("canplaythrough", function () { parts.video = 1; });
    heroVideo.addEventListener("error", function () { parts.video = 1; });
    videoProgress();
    if (heroVideo.networkState === 0) heroVideo.load();   // nur falls der Browser noch gar nicht angefangen hat

    // Schriften
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { parts.fonts = 1; });

    // kritische Bilder
    var imgs = [document.querySelector(".logo img"), thumbImg];
    var posterImg = new Image();
    posterImg.src = heroVideo.getAttribute("poster");
    imgs.push(posterImg);
    var imgDone = 0;
    function imgLoaded() { imgDone++; parts.images = imgDone / imgs.length; }
    imgs.forEach(function (im) {
      if (im.complete && im.naturalWidth) imgLoaded();
      else { im.addEventListener("load", imgLoaded, { once: true }); im.addEventListener("error", imgLoaded, { once: true }); }
    });

    // Seite
    if (document.readyState === "complete") parts.page = 1;
    else window.addEventListener("load", function () { parts.page = 1; });

    // Sicherheitsnetz: spätestens nach 10 s geht es los
    setTimeout(function () { for (var k in parts) parts[k] = 1; }, 10000);
  }

  // ---------- Thumbnail-Hover: Video-Snippet, beim Verlassen wieder Standbild ----------
  var thumbVideo = thumb.querySelector(".thumb-video");
  thumb.addEventListener("mouseenter", function () {
    thumb.classList.add("is-hover");
    thumbVideo.preload = "auto";
    try { thumbVideo.currentTime = 0; } catch (e) {}
    var p = thumbVideo.play();
    if (p && p.catch) p.catch(function () {});
  });
  thumb.addEventListener("mouseleave", function () {
    thumb.classList.remove("is-hover");
    setTimeout(function () { if (!thumb.classList.contains("is-hover")) thumbVideo.pause(); }, 300);
  });

  // ---------- Video-Overlay mit eigener Steuerung ----------
  var playerVideo = document.getElementById("playerVideo");
  var closeBtn = player.querySelector(".player-close");
  var toggleBtn = player.querySelector(".player-toggle");
  var progressEl = player.querySelector(".player-progress");
  var fillEl = player.querySelector(".player-fill");
  var bufferEl = player.querySelector(".player-buffer");
  var timeEl = player.querySelector(".player-time");
  var lastTrigger = null;
  var idleTimer = null;

  function fmt(t) {
    if (!isFinite(t)) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function wake() {
    player.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { if (!playerVideo.paused) player.classList.add("is-idle"); }, PLAYER_IDLE);
  }
  function setPaused() {
    var p = playerVideo.paused;
    player.classList.toggle("is-paused", p);
    toggleBtn.setAttribute("aria-label", p ? "Abspielen" : "Pause");
    if (p) { player.classList.remove("is-idle"); clearTimeout(idleTimer); } else wake();
  }
  function togglePlay() {
    if (playerVideo.paused) playerVideo.play().catch(function () {});
    else playerVideo.pause();
  }

  function openPlayer(url, trigger) {
    lastTrigger = trigger;
    thumbVideo.pause();
    thumb.classList.remove("is-hover");
    playerVideo.src = url;
    playerVideo.muted = false;                               // mit Ton
    playerVideo.volume = 1;
    player.hidden = false;
    body.classList.add("player-open");
    if (lenis) lenis.stop();
    currentLayer().pause();
    pxVideos.forEach(function (v) { v.pause(); });
    requestAnimationFrame(function () { player.classList.add("is-open"); });
    playerVideo.play().catch(function () {});
    wake();
    closeBtn.focus({ preventScroll: true });
  }
  function closePlayer() {
    if (!body.classList.contains("player-open")) return;
    playerVideo.pause();
    clearTimeout(idleTimer);
    player.classList.remove("is-open", "is-idle");
    setTimeout(function () {
      player.hidden = true;
      playerVideo.removeAttribute("src");
      playerVideo.load();
      fillEl.style.width = bufferEl.style.width = "0";
    }, 350);
    body.classList.remove("player-open");
    if (lenis) lenis.start();
    play(currentLayer());
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  thumb.addEventListener("click", function () { openPlayer(thumb.dataset.full, thumb); });
  closeBtn.addEventListener("click", closePlayer);
  toggleBtn.addEventListener("click", function () { togglePlay(); wake(); });
  playerVideo.addEventListener("click", function () { togglePlay(); wake(); });
  playerVideo.addEventListener("play", setPaused);
  playerVideo.addEventListener("pause", setPaused);
  playerVideo.addEventListener("ended", closePlayer);
  playerVideo.addEventListener("timeupdate", function () {
    var d = playerVideo.duration || 0;
    var pct = d ? (playerVideo.currentTime / d) * 100 : 0;
    fillEl.style.width = pct + "%";
    progressEl.setAttribute("aria-valuenow", Math.round(pct));
    timeEl.textContent = fmt(playerVideo.currentTime) + " / " + fmt(d);
  });
  playerVideo.addEventListener("progress", function () {
    var b = playerVideo.buffered, d = playerVideo.duration;
    if (b.length && d) bufferEl.style.width = (b.end(b.length - 1) / d) * 100 + "%";
  });
  ["mousemove", "pointerdown", "touchstart"].forEach(function (ev) { player.addEventListener(ev, wake, { passive: true }); });

  // Fortschrittsbalken: klicken oder ziehen zum Springen
  var seeking = false;
  function seekTo(clientX) {
    var r = progressEl.getBoundingClientRect();
    var f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    if (playerVideo.duration) playerVideo.currentTime = f * playerVideo.duration;
    fillEl.style.width = f * 100 + "%";
  }
  progressEl.addEventListener("pointerdown", function (e) {
    seeking = true;
    progressEl.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  });
  progressEl.addEventListener("pointermove", function (e) { if (seeking) seekTo(e.clientX); });
  progressEl.addEventListener("pointerup", function () { seeking = false; });
  progressEl.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") playerVideo.currentTime = Math.min(playerVideo.duration || 0, playerVideo.currentTime + 5);
    if (e.key === "ArrowLeft") playerVideo.currentTime = Math.max(0, playerVideo.currentTime - 5);
  });

  document.addEventListener("keydown", function (e) {
    if (player.hidden) return;
    if (e.key === "Escape") closePlayer();
    else if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); wake(); }
    else wake();
  });
  // Klick auf den schwarzen Bereich außerhalb des Videos schließt ebenfalls
  player.addEventListener("click", function (e) { if (e.target === player) closePlayer(); });

  // Tab im Hintergrund: Hintergrundvideo anhalten
  document.addEventListener("visibilitychange", function () {
    if (reduced || !player.hidden || !introDone) return;
    if (document.hidden) currentLayer().pause();
    else play(currentLayer());
  });
})();
