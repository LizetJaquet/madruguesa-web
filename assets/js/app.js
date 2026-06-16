/* =========================================================
   LA MADRUGUESA — interactividad (Alpine.js)
   Componentes:
     loyalty()  -> tarjeta lunar del Club de los Desvelados
     lunatic()  -> reloj en vivo de la "Hora Lunática"
     nav()      -> menú mobile + estado del header al hacer scroll
   Es un prototipo: no hay backend, todo es estado local simulado.
   ========================================================= */

document.addEventListener('alpine:init', () => {

  /* --- Club de los Desvelados: 5 sellos = la 6ª gratis --- */
  Alpine.data('loyalty', () => ({
    max: 5,
    stamps: 3,        // arranca "logueado" con 3 sellos para mostrar el estado vivo
    justUnlocked: false,

    // Fases lunares con textura real (la porción iluminada muestra la foto de la luna).
    // Cada fase recorta luna.webp con la forma del creciente; el resto queda en sombra.
    moonPhase(i) {
      const lit = [
        'M50,4 A46,46 0 0 1 50,96 A34.96,46 0 0 0 50,4 Z', // creciente fino
        'M50,4 A46,46 0 0 1 50,96 A15.64,46 0 0 0 50,4 Z', // creciente
        'M50,4 A46,46 0 0 1 50,96 L50,4 Z',                // cuarto (mitad)
        'M50,4 A46,46 0 0 1 50,96 A22.08,46 0 0 1 50,4 Z', // gibosa
        null,                                              // llena (sin recorte)
      ];
      const idx = (i >= 0 && i < lit.length) ? i : lit.length - 1;
      const img = '<image href="assets/img/luna.webp" x="2" y="2" width="96" height="96" preserveAspectRatio="xMidYMid slice"';
      const shadow = '<circle cx="50" cy="50" r="46" fill="#11111c"/>';
      if (lit[idx] === null) {
        return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${shadow}${img}/></svg>`;
      }
      const cid = 'mp' + idx;
      return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${cid}"><path d="${lit[idx]}"/></clipPath></defs>${shadow}${img} clip-path="url(#${cid})"/></svg>`;
    },
    phaseSvg(i) { return this.moonPhase(i); },

    get remaining() { return Math.max(0, this.max - this.stamps); },
    get unlocked()  { return this.stamps >= this.max; },
    get percent()   { return Math.round((this.stamps / this.max) * 100); },

    isOn(i)     { return i <= this.stamps; },
    label() {
      if (this.unlocked) return '🌕 ¡Luna llena! Tu 6ª hamburguesa es GRATIS';
      if (this.remaining === 1) return 'Te falta 1 sello para la hamburguesa gratis';
      return `Te faltan ${this.remaining} sellos para la hamburguesa gratis`;
    },

    add() {
      if (this.stamps < this.max) {
        this.stamps++;
        if (this.stamps === this.max) {
          this.justUnlocked = true;
          setTimeout(() => { this.justUnlocked = false; }, 2200);
        }
      }
    },
    redeem() { this.stamps = 0; this.justUnlocked = false; },  // canjea y vuelve a empezar el ciclo
  }));

  /* --- Hora Lunática: 20% OFF de 00:00 a 04:00 --- */
  Alpine.data('lunatic', () => ({
    time: '--:--:--',
    active: false,
    openNow: false,

    init() {
      this.tick();
      setInterval(() => this.tick(), 1000);
    },
    tick() {
      const d = new Date();
      const h = d.getHours();
      const p = n => String(n).padStart(2, '0');
      this.time = `${p(h)}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      // Local abierto 20:00–04:00; Hora Lunática activa 00:00–04:00
      this.openNow = (h >= 20) || (h < 4);
      this.active  = (h >= 0)  && (h < 4);
    },
    get statusText() {
      if (this.active)  return 'Hora Lunática ACTIVA · 20% OFF en todo el menú';
      if (this.openNow) return 'Abierto · la Hora Lunática arranca a las 00:00';
      return 'Cerrado · abrimos 20:00 · Hora Lunática desde las 00:00';
    },
  }));

  /* --- Header + nav mobile --- */
  Alpine.data('nav', () => ({
    open: false,
    scrolled: false,
    init() {
      this.onScroll();
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },
    onScroll() { this.scrolled = window.scrollY > 40; },
    go() { this.open = false; },  // cierra el menú mobile al elegir una sección
  }));
});
