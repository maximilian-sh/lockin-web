# Web

Teaser-Seite der Suite. Eine Datei, kein Build, kein Framework.

```bash
cd web && python3 -m http.server 8788
```

## Aufbau

Die Seite ist ein Wörterbucheintrag. Bedeutung 1 ist die Redewendung,
Bedeutung 2 sind die vier Apps als Unterbedeutungen a bis d. Mehr steht nicht
drauf — sie soll den Gedanken verkaufen, nicht Funktionen aufzählen.

| Datei | |
|---|---|
| `index.html` | der Eintrag |
| `styles.css` | dunkel, Serifenschrift, das Metall ist die einzige helle Stelle |
| `main.js` | rastert „lock in" zur Alphamaske, lässt sie vorverarbeiten und hängt den Shader darüber |
| `vendor/paper-shaders.js` | gebündelt aus `@paper-design/shaders`, Apache-2.0 |
| `icons/` | je App die eigene Tönung: Lock Platin, Recall Smaragd, Pod Champagner — auf 176 px verkleinert |

Hub hat noch kein Icon, steht deshalb als gestricheltes Feld da. Vorgesehene
Tönung: Nachtstahl.

Die Seite passt auf eine Bildschirmhöhe und scrollt nicht. Alle senkrechten
Maße hängen an `svh`, das Wortzeichen nimmt die volle Breite, solange seine
Höhe ins Budget passt. Unter 520 px Fensterhöhe wird Scrollen wieder erlaubt,
abschneiden wäre schlechter.

## Das Wortzeichen

Kein Bild, sondern derselbe Liquid-Metal-Shader wie bei den App-Icons, live.
Tönung Platin `#b8c6d6` bei 0.9, `u_time` 23 wie bei den Icons.

Zwei Werte weichen bewusst ab: **Wiederholung 6** statt 2 und **Kontur 0.1**
statt 0.4. Buchstaben sind fast nur Kante; mit den Icon-Werten säuft das
Metall in den Serifen ab. Dispersion ist auf 0.15 halbiert, sonst flimmern
die Serifen bunt.

Ohne WebGL bleibt die gesetzte Schrift stehen. Bei `prefers-reduced-motion`
steht das Metall still, statt zu fließen.

## Bündel neu bauen

Im Werkzeug-Repo (`dev/liquidMetal`, hat esbuild und die Abhängigkeit):

```bash
npx esbuild vendor/web-entry.js --bundle --format=iife \
  --global-name=PaperShaders \
  --outfile=<pfad>/web/vendor/paper-shaders.js
```
