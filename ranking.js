// FUNCIONES DE FIREBASE PARA GUARDAR Y MOSTRAR RANKING

// Inicialización de Firestore (Firebase modular)
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
const db = getFirestore(getApp());

const TOP_N = 10;

const backButtonRanking = document.getElementById("back-btn-ranking");

backButtonRanking.addEventListener("click", () => {window.mostrarSeccion(document.getElementById("menu-container"));});

async function guardarPuntuacion(nombre, avatar, puntos) {
  // Guarda solo la mejor puntuación por usuario
  const puntuacionesRef = collection(db, "puntuaciones");
  const q = query(puntuacionesRef, orderBy("puntos", "desc"));
  const snapshot = await getDocs(q);
  let found = null;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.nombre === nombre) found = { id: doc.id, ...data };
  });
  if (!found || puntos > found.puntos) {
    // Si no existe o la nueva puntuación es mejor, guarda/actualiza
    if (found) {
      // Actualiza
      await import("https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js").then(({ doc, setDoc }) =>
        setDoc(doc(db, "puntuaciones", found.id), {
          nombre, avatar, puntos
        })
      );
    } else {
      // Añade
      await import("https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js").then(({ addDoc }) =>
        addDoc(puntuacionesRef, { nombre, avatar, puntos })
      );
    }
  }
}

async function cargarRanking() {
  const tabla = document.getElementById("ranking-table");
  tabla.innerHTML = `
    <tr>
      <th>Jugador</th>
      <th>Puntos</th>
    </tr>`;

  const puntuacionesRef = collection(db, "puntuaciones");
  const q = query(puntuacionesRef, orderBy("puntos", "desc"));
  const snapshot = await getDocs(q);

  // Recoge todas las puntuaciones, solo la mejor por usuario
  const users = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!users[data.nombre] || data.puntos > users[data.nombre].puntos) {
      users[data.nombre] = { ...data };
    }
  });

  // Array de usuarios ordenados por puntos
  const ranking = Object.values(users).sort((a, b) => b.puntos - a.puntos);

  // Usuario actual
  const currentName = localStorage.getItem("nombreJugador");
  let currentIndex = ranking.findIndex(u => u.nombre === currentName);

  // Mostrar top 10
  for (let i = 0; i < Math.min(TOP_N, ranking.length); i++) {
    const user = ranking[i];
    const row = tabla.insertRow();
    if (user.nombre === currentName) row.classList.add("ranking-current");
    const cellName = row.insertCell(0);
    const cellPoints = row.insertCell(1);
    cellName.innerHTML = `<img src="${user.avatar}" width="32" height="32" style="border-radius:50%;vertical-align:middle;margin-right:8px;"> <span>${user.nombre}</span>`;
    cellPoints.textContent = user.puntos;
  }

  // Si el usuario actual no está en el top 10, añádelo como última fila
  if (currentName && currentIndex >= TOP_N) {
    const user = ranking[currentIndex];
    const row = tabla.insertRow();
    row.classList.add("ranking-current");
    const cellName = row.insertCell(0);
    const cellPoints = row.insertCell(1);
    cellName.innerHTML = `<img src="${user.avatar}" width="32" height="32" style="border-radius:50%;vertical-align:middle;margin-right:8px;"> <span>${user.nombre} <span class="ranking-pos">(#${currentIndex + 1})</span></span>`;
    cellPoints.textContent = user.puntos;
  }
}

window.guardarPuntuacion = guardarPuntuacion;
window.cargarRanking = cargarRanking;
