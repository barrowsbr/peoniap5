# peonia

Una animación interactiva de una peonía hecha con p5.js. Corre directo en el navegador, sin instalar nada.

## Cómo usarlo

Abrí `index.html` en el navegador: es un panel/galería donde elegís la animación con un click y se abre a pantalla completa (Esc para volver). Para agregar una animación nueva, sumá un objeto al array `ANIMATIONS` dentro de `index.html`.

También podés abrir cada animación directo: `peonia.html` o `peonia-plus.html`. No necesita servidor, no necesita npm, no necesita nada.

## Versión plus

`peonia-plus.html` es una versión extendida con los mismos fundamentos más:

- **pétalos que se desprenden y caen** cuando la flor se marchita (tumbando en 3D, pasando por el mismo filtro ascii/puntos/píxeles)
- **polen/luciérnagas** flotando con parallax del mouse
- **banda sonora generativa** (Web Audio, sin archivos): un drone grave que respira + campanas pentatónicas al florecer, cambiar de modo y marchitarse; ruido suave en el glitch
- **halo de luz** de fondo teñido por el color de la flor
- **nuevas variedades** (violeta medianoche, dorada)
- **interacciones**: click suelta pétalos, scroll controla la densidad, `space` pausa, `P` pétalos, `S` sonido, `F` pantalla completa, `G` glitch

El sonido arranca con el primer click (política de autoplay del navegador).

## Qué hace

Dibuja una peonía en 3D que florece sola, cicla entre distintas variantes de color y después se marchita. El mouse influye en la rotación. Los efectos van rotando solos entre ascii, puntos y píxeles, y hay un glitch que aparece cada tanto.

## Lo que se usó

- [p5.js](https://p5js.org/) — toda la parte gráfica, el canvas, el render
- HTML/CSS/JS vanilla — sin frameworks, sin bundlers
