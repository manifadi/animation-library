// Die Koje · Scrollytelling mit Hintergrund-Videos
// Der Abschnitt in der Bildschirmmitte ist aktiv: sein Video wird eingeblendet und
// von vorn abgespielt, alle anderen pausieren. Kein Framework, keine Abhängigkeiten.
(function () {
  var body = document.body;
  var scenes = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
  var videos = {};
  Array.prototype.forEach.call(document.querySelectorAll(".bg-video"), function (v) { videos[v.dataset.for] = v; });
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bar = document.getElementById("progressBar");

  // Fortschrittspunkte aus den Feature-Abschnitten erzeugen
  var rail = document.getElementById("rail");
  var railLinks = {};
  scenes.forEach(function (s) {
    if (!s.dataset.label) return;
    var li = document.createElement("li");
    li.innerHTML = '<a href="#' + s.id + '"><span class="label">' + s.dataset.label + '</span><span class="dot"></span></a>';
    rail.appendChild(li);
    railLinks[s.dataset.scene] = li.firstChild;
  });

  var lastFeature = Object.keys(videos).pop();
  var currentVideo = null;
  var current = null;

  function showVideo(name) {
    var v = videos[name];
    if (!v || v === currentVideo) return;
    var prev = currentVideo;
    currentVideo = v;
    v.classList.add("is-active");
    if (!reduced) {
      try { v.currentTime = 0; } catch (e) {}
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (prev) {
      prev.classList.remove("is-active");
      // Erst nach dem Ausblenden pausieren, damit der Übergang nicht einfriert
      setTimeout(function () { if (prev !== currentVideo) prev.pause(); }, 900);
    }
    // Das nächste Snippet vorladen
    var keys = Object.keys(videos);
    var next = videos[keys[keys.indexOf(name) + 1]];
    if (next && next.preload !== "auto") next.preload = "auto";
  }

  function setScene(name) {
    if (name === current) return;
    current = name;
    // Im CTA-Bereich läuft das letzte Feature-Video weiter
    showVideo(videos[name] ? name : lastFeature);
    Object.keys(railLinks).forEach(function (k) { railLinks[k].classList.toggle("is-active", k === name); });
    body.classList.toggle("on-hero", name === "hero");
    body.classList.toggle("on-cta", name === "cta");
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var mid = vh / 2;
    var active = scenes[0];
    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid) active = s;
      if (r.top < vh * 0.78) s.classList.add("is-seen");
    });
    setScene(active.dataset.scene);

    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    body.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // „Rundgang nochmal“
  var top = document.querySelector("[data-top]");
  if (top) top.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

  // Tab im Hintergrund: Video anhalten
  document.addEventListener("visibilitychange", function () {
    if (!currentVideo || reduced) return;
    if (document.hidden) currentVideo.pause();
    else { var p = currentVideo.play(); if (p && p.catch) p.catch(function () {}); }
  });
})();
