// ============================================================
//  ESCENA ANIMADA (React)
//  Cada elemento del dibujo depende del tiempo "t" (en segundos).
//  En cada cuadro, React vuelve a dibujar la escena con el nuevo "t".
// ============================================================
const { useState, useEffect } = React;
const h = React.createElement;   // h("etiqueta", propiedades, ...hijos)

// ---- Medidas del dibujo (en píxeles del SVG, no son metros) ----
const SUELO = 420;
const VARILLA = { x: 300, alto: 50,  sombra: 37.5 };
const POSTE   = { x: 620, alto: 300, sombra: 225 };
const PENDIENTE = 0.75;                                   // los rayos avanzan 0,75 px a la derecha por cada 1 px que bajan
const RAYOS_DE_ADORNO = [150, 230, 430, 540, 920, 985];   // x donde tocan el suelo

// ---- Línea de tiempo (en segundos) ----
const DUR_RAYO = 1.5;
const T = { sol: 0, varilla: 1.4, poste: 1.7, rayoVarilla: 3.0, rayoPoste: 3.2, fin: 5.4 };
const DURACION = 5.5;

// ---- Ayudas para animar ----
const tramo = (t, inicio, dur) => Math.min(1, Math.max(0, (t - inicio) / dur));   // va de 0 a 1
const suave = x => x * x * (3 - 2 * x);                                           // arranca y frena despacio
const rebote = x => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);      // se pasa un poquito y vuelve
const entre = (a, b, k) => a + (b - a) * k;                                       // valor entre a y b

// Mezcla dos colores "#rrggbb" (k = 0 es el primero, k = 1 es el segundo)
function mezclar(colorA, colorB, k) {
  const canal = (color, i) => parseInt(color.slice(1 + i * 2, 3 + i * 2), 16);
  const rgb = [0, 1, 2].map(i => Math.round(entre(canal(colorA, i), canal(colorB, i), k)));
  return "rgb(" + rgb.join(",") + ")";
}

// Reloj: devuelve el tiempo "t" y lo actualiza en cada cuadro hasta que termina
function useReloj(ciclo) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(DURACION);                       // si la persona pidió menos movimiento: va directo al final
      return;
    }
    const inicio = performance.now();
    let idCuadro;
    const paso = ahora => {
      const segundos = Math.min(DURACION, Math.max(0, (ahora - inicio) / 1000));
      setT(segundos);
      if (segundos < DURACION) idCuadro = requestAnimationFrame(paso);
    };
    setT(0);
    idCuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(idCuadro);
  }, [ciclo]);                              // si "ciclo" cambia, la animación arranca de nuevo
  return t;
}

// Un rayo de sol. "avance" va de 0 (no se ve) a 1 (llega al suelo).
function rayo(xSuelo, avance, clave, key) {
  const xInicio = xSuelo - SUELO * PENDIENTE;
  return h("line", {
    key: key,
    x1: xInicio, y1: 0,
    x2: entre(xInicio, xSuelo, avance), y2: SUELO * avance,
    stroke: clave ? "#ff7a00" : "#ffa000",
    strokeWidth: clave ? 3 : 2,
    strokeLinecap: "round",
    opacity: clave ? 1 : 0.5
  });
}

// Rayitos alrededor del sol (giran despacio gracias al CSS)
const CORONA = Array.from({ length: 12 }, (_, i) => {
  const angulo = (i * 30 * Math.PI) / 180;
  const largo = i % 2 === 0 ? 62 : 54;
  return h("line", {
    key: i,
    x1: Math.cos(angulo) * 44, y1: Math.sin(angulo) * 44,
    x2: Math.cos(angulo) * largo, y2: Math.sin(angulo) * largo,
    stroke: "#ffbf00", strokeWidth: 4, strokeLinecap: "round"
  });
});

function Escena() {
  const [ciclo, setCiclo] = useState(0);
  const t = useReloj(ciclo);

  // 1) Amanece: sube el sol y el cielo se aclara
  const dia = suave(tramo(t, T.sol, 1.8));
  const solY = entre(500, 56, dia);

  // 2) Crecen la varilla y el poste (con un pequeño rebote)
  const kVarilla = rebote(tramo(t, T.varilla, 0.8));
  const kPoste = rebote(tramo(t, T.poste, 1.0));

  // 3) Llegan los rayos y, cuando tocan la punta de cada objeto, empieza su sombra
  const tocaVarilla = T.rayoVarilla + DUR_RAYO * (SUELO - VARILLA.alto) / SUELO;
  const tocaPoste = T.rayoPoste + DUR_RAYO * (SUELO - POSTE.alto) / SUELO;
  const largoSombraVarilla = VARILLA.sombra * suave(tramo(t, tocaVarilla, T.fin - tocaVarilla));
  const largoSombraPoste = POSTE.sombra * suave(tramo(t, tocaPoste, T.fin - tocaPoste));

  const rayosDeAdorno = RAYOS_DE_ADORNO.map((xSuelo, i) =>
    rayo(xSuelo, tramo(t, 2.6 + i * 0.12, 1.3), false, "adorno" + i));

  return h("div", { className: "escena-caja" },
    h("svg", {
      id: "escena", viewBox: "0 0 1000 480", role: "img",
      "aria-label": "El sol ilumina una varilla y un poste, y cada uno proyecta su sombra en el suelo"
    },
      h("defs", null,
        h("linearGradient", { id: "cielo", x1: 0, y1: 0, x2: 0, y2: 1 },
          h("stop", { offset: 0, stopColor: mezclar("#1f3a8a", "#7fc8f8", dia) }),
          h("stop", { offset: 1, stopColor: mezclar("#ff9a6b", "#e6f5ff", dia) })),
        h("radialGradient", { id: "brillo" },
          h("stop", { offset: 0, stopColor: "#ffd54a", stopOpacity: 0.85 }),
          h("stop", { offset: 1, stopColor: "#ffd54a", stopOpacity: 0 }))),

      h("rect", { width: 1000, height: SUELO, fill: "url(#cielo)" }),

      // El sol se dibuja antes que el suelo: así sale desde atrás del horizonte
      h("circle", { cx: 64, cy: solY, r: 100 * (0.6 + 0.4 * dia), fill: "url(#brillo)" }),
      h("g", { transform: "translate(64 " + solY + ")" }, h("g", { className: "corona" }, ...CORONA)),
      h("circle", { cx: 64, cy: solY, r: 34, fill: "#ffbf00" }),

      h("rect", { y: SUELO, width: 1000, height: 60, fill: mezclar("#3d5a35", "#7aa862", dia) }),

      // Rayos de sol (paralelos, porque el sol está muy lejos)
      ...rayosDeAdorno,
      rayo(VARILLA.x + VARILLA.sombra, tramo(t, T.rayoVarilla, DUR_RAYO), true, "claveVarilla"),
      rayo(POSTE.x + POSTE.sombra, tramo(t, T.rayoPoste, DUR_RAYO), true, "clavePoste"),

      // Sombras sobre el suelo
      h("rect", { x: VARILLA.x, y: SUELO, width: largoSombraVarilla, height: 12, fill: "#0b1a52", fillOpacity: 0.7 }),
      h("rect", { x: POSTE.x, y: SUELO, width: largoSombraPoste, height: 12, fill: "#0b1a52", fillOpacity: 0.7 }),

      // Varilla y poste
      h("rect", { x: VARILLA.x - 3, y: SUELO - VARILLA.alto * kVarilla, width: 6, height: VARILLA.alto * kVarilla, rx: 2, fill: "#b45f1f" }),
      h("rect", { x: POSTE.x - 6, y: SUELO - POSTE.alto * kPoste, width: 12, height: POSTE.alto * kPoste, rx: 3, fill: "#55627a" }),
      h("circle", { cx: POSTE.x, cy: SUELO - POSTE.alto * kPoste, r: 8 * Math.min(1, kPoste), fill: "#dbe3f0" }),

      // Nombres (sin ninguna medida)
      h("text", { x: 282, y: 400, textAnchor: "end", opacity: tramo(t, 2.6, 0.6) }, "varilla"),
      h("text", { x: 598, y: 150, textAnchor: "end", opacity: tramo(t, 2.6, 0.6) }, "poste")
    ),
    h("button", { type: "button", className: "boton secundario", onClick: () => setCiclo(c => c + 1) },
      "Repetir animación")
  );
}

// Lo llama app.js cuando se aprieta "Iniciar"
function montarEscena() {
  ReactDOM.createRoot(document.getElementById("escena-raiz")).render(h(Escena));
}
