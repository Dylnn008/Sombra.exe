// ============================================================
//  APP: botón Iniciar, tarjeta de datos y aparición al bajar
// ============================================================

const ICONO_LUPA = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;

// "metro" si es 1, "metros" en los demás casos
function metros(numero) {
  return numero === 1 ? "metro" : "metros";
}

// Arma la tarjeta con los datos conocidos (salen de js/datos.js)
function crearTarjetaDatos() {
  document.getElementById("tarjeta-datos").innerHTML = `
    <div class="cabecera">${ICONO_LUPA}<h2>EXPEDIENTE 001 — SOMBRA.EXE</h2></div>
    <p class="nota">Misión: descubrir la altura de un poste sin medirlo directamente.</p>
    <hr>
    <h3>Datos conocidos</h3>
    <ul class="puntos">
      <li>Una varilla vertical mide ${fmt(DATOS.alturaVarilla)} ${metros(DATOS.alturaVarilla)}.</li>
      <li>La sombra de la varilla mide ${fmt(DATOS.sombraVarilla)} ${metros(DATOS.sombraVarilla)}.</li>
      <li>La sombra del poste mide ${fmt(DATOS.sombraPoste)} ${metros(DATOS.sombraPoste)}.</li>
      <li>Las sombras se consideran medidas bajo las mismas condiciones de iluminación y sobre un suelo horizontal.</li>
    </ul>`;
}

// Hace que las hojas aparezcan cuando se bajan hasta ellas
function activarAparicion() {
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".revelar").forEach(el => observador.observe(el));
}

// Botón "Iniciar": oculta la portada y arranca la escena animada (React)
function iniciar() {
  const inicio = document.getElementById("inicio");
  inicio.classList.add("oculto");
  document.getElementById("contenido").hidden = false;
  window.scrollTo(0, 0);
  montarEscena();
  activarAparicion();
  setTimeout(() => { inicio.hidden = true; }, 700);
}

// ---- Arranque ----
crearTarjetaDatos();
crearCalculadora();
document.getElementById("btn-iniciar").addEventListener("click", iniciar);
