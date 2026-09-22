/* Das Wortzeichen ist kein Bild, sondern derselbe Liquid-Metal-Shader, der
   auch die App-Icons erzeugt hat. Ablauf: Schrift in eine Alphamaske rastern,
   daraus das Feld rechnen lassen (toProcessedLiquidMetal), das Ergebnis als
   Textur in einen ShaderMount hängen.

   Tönung und Spiegelung wie bei den Icons: Platin #b8c6d6 bei 0.9,
   u_time 23 (ShaderMount rechnet in Millisekunden).

   Anders als bei den Icons braucht Schrift mehr Streifen und weniger Kontur:
   Buchstaben sind fast nur Kante, mit den Icon-Werten (Wiederholung 2,
   Kontur 0.4) säuft das Metall in den Serifen ab. */

(function () {
  'use strict';

  var P = window.PaperShaders;
  var host = document.getElementById('wordmark');
  if (!P || !host) return;

  var WORT = 'lock in';
  var TOENUNG = [184 / 255, 198 / 255, 214 / 255, 0.9];   // Platin
  var SPIEGELUNG = 23000;                                  // ms, entspricht Phase 23
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Schrift in eine weiße Maske auf Transparenz rastern. */
  function maske(text, groesse) {
    var stil = '700 ' + groesse + 'px ' + getComputedStyle(document.body).fontFamily;
    var mess = document.createElement('canvas').getContext('2d');
    mess.font = stil;
    var m = mess.measureText(text);
    var links = Math.ceil(Math.abs(m.actualBoundingBoxLeft));
    var rechts = Math.ceil(Math.abs(m.actualBoundingBoxRight));
    var oben = Math.ceil(Math.abs(m.actualBoundingBoxAscent));
    var unten = Math.ceil(Math.abs(m.actualBoundingBoxDescent));
    var rand = Math.round(groesse * 0.08);

    var c = document.createElement('canvas');
    c.width = links + rechts + rand * 2;
    c.height = oben + unten + rand * 2;
    var x = c.getContext('2d');
    x.font = stil;
    x.fillStyle = '#fff';
    x.textBaseline = 'alphabetic';
    x.fillText(text, rand + links, rand + oben);
    return c;
  }

  function alsDatei(canvas) {
    return new Promise(function (res, rej) {
      canvas.toBlob(function (b) {
        b ? res(new File([b], 'wortzeichen.png', { type: 'image/png' })) : rej(new Error('kein PNG'));
      }, 'image/png');
    });
  }

  function starten() {
    var c = maske(WORT, 660);
    // Das Verhältnis steuert in CSS zugleich die Breite, damit die Höhe
    // aus --wm-hoehe kommt und die Seite auf einen Bildschirm passt.
    host.style.setProperty('--wm-verhaeltnis', (c.width / c.height).toFixed(4));

    return alsDatei(c)
      .then(function (datei) { return P.toProcessedLiquidMetal(datei); })
      .then(function (ergebnis) {
        // ShaderMount nimmt als Textur nur ein fertig geladenes Image,
        // eine URL-Zeichenkette ignoriert es stillschweigend.
        return new Promise(function (res, rej) {
          var bild = new Image();
          bild.onload = function () { res(bild); };
          bild.onerror = rej;
          bild.src = URL.createObjectURL(ergebnis.pngBlob);
        });
      })
      .then(function (bild) {
        new P.ShaderMount(
          host,
          P.liquidMetalFragmentShader,
          {
            u_image: bild,
            u_colorBack: [0, 0, 0, 0],      // durchsichtig, die Seite liegt darunter
            u_colorTint: TOENUNG,
            u_repetition: 6,
            u_softness: 0.05,
            u_shiftRed: 0.15,
            u_shiftBlue: 0.15,
            u_distortion: 0.07,
            u_contour: 0.1,
            u_angle: 70,
            u_shape: 0,
            u_isImage: true,
            u_fit: 1,                       // contain
            u_scale: 1,
            u_rotation: 0,
            u_offsetX: 0,
            u_offsetY: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0
          },
          undefined,
          ruhig ? 0 : 0.22,
          SPIEGELUNG,
          2,
          undefined,
          ['u_image']
        );
        host.classList.add('live');
      })
      .catch(function (e) {
        // Ohne WebGL bleibt die gesetzte Schrift stehen — das ist der Rückfall.
        console.warn('Wortzeichen ohne Shader:', e && e.message);
      });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(starten);
  else starten();
})();
