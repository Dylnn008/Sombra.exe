// ============================================================
//  CALCULADORA: un solo campo para la altura del poste
// ============================================================

// Altura correcta, calculada con los datos de js/datos.js
// (semejanza de triángulos: H / sombra del poste = altura de la varilla / sombra de la varilla)
const ALTURA_CORRECTA = (DATOS.sombraPoste * DATOS.alturaVarilla) / DATOS.sombraVarilla;

// Da formato argentino a un número: 0.75 -> "0,75"
function fmt(numero) {
  return numero.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

// Muestra el cartel de resultado. tipo: "ok" (verde) o "error" (rojo).
function mostrar(html, tipo) {
  const cartel = document.getElementById("resultado");
  cartel.className = "cartel " + tipo;
  cartel.innerHTML = html;
}

// Se ejecuta al apretar "Comprobar"
function comprobar() {
  // Aceptamos "6", "6,0", "6 m" y "6 metros"
  const texto = document.getElementById("altura-poste").value
    .toLowerCase()
    .replace(/metros?|m/g, "")
    .replace(",", ".")
    .trim();

  if (texto === "") {
    mostrar("Escribí la altura del poste.", "error");
    return;
  }

  const altura = Number(texto);
  if (Number.isNaN(altura)) {
    mostrar("Escribí solo un número, por ejemplo 12,5.", "error");
    return;
  }
  if (altura <= 0) {
    mostrar("La altura tiene que ser mayor que cero.", "error");
    return;
  }

  // Comparamos con un margen mínimo por los decimales
  if (Math.abs(altura - ALTURA_CORRECTA) < 0.01) {
    mostrar("✔ ¡Correcto!", "ok");
  } else {
    mostrar('✖ Incorrecto<span class="sub">Revisá tu cálculo e intentá de nuevo.</span>', "error");
  }
}

// Conecta el formulario
function crearCalculadora() {
  document.getElementById("formulario").addEventListener("submit", evento => {
    evento.preventDefault();       // evita que la página se recargue
    comprobar();
  });
  // Si la persona vuelve a escribir, el cartel anterior desaparece
  document.getElementById("altura-poste").addEventListener("input", () => mostrar("", ""));
}
