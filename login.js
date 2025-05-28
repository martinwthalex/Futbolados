const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const menuContainer = document.getElementById('menu-container');

document.getElementById('show-register-btn').addEventListener('click', () => {
    if (window.mostrarSeccion) window.mostrarSeccion(registerContainer);    
});

document.getElementById('show-login-btn').addEventListener('click', () => {
    if (window.mostrarSeccion) window.mostrarSeccion(loginContainer);
});


let selectedRegisterAvatar = "";
document.querySelectorAll("#register-avatar-options .avatar-option").forEach(img => {
    img.addEventListener("click", () => {
        document.querySelectorAll("#register-avatar-options .avatar-option").forEach(i => i.classList.remove("selected"));
        img.classList.add("selected");
        selectedRegisterAvatar = img.getAttribute("src");
    });
});


import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

const auth = getAuth(getApp());
const db = getFirestore(getApp());


document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('login-continue-btn');
    submitBtn.classList.add('pulse-submit');
    setTimeout(() => submitBtn.classList.remove('pulse-submit'), 350);

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElem = document.getElementById('login-error');
    errorElem.textContent = "";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, "usuarios", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("Perfil recuperado:", data);
            localStorage.setItem("nombreJugador", data.nombre);
            localStorage.setItem("avatarJugador", data.avatar);
        } else {
            console.warn("No existe perfil en Firestore para este usuario");
        }

        if (window.actualizarDatosJugador) window.actualizarDatosJugador();
        if (window.mostrarSeccion) window.mostrarSeccion(menuContainer);

    } catch (error) {
        errorElem.textContent = "Email o contraseña incorrectos.";
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('register-continue-btn');
    submitBtn.classList.add('pulse-submit');
    setTimeout(() => submitBtn.classList.remove('pulse-submit'), 350);

    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value.trim();
    // Elimina './' si existe al principio de la ruta del avatar
    let avatar = selectedRegisterAvatar;
    if (avatar && avatar.startsWith('./')) {
        avatar = avatar.substring(2);
    }
    const errorElem = document.getElementById('register-error');
    errorElem.textContent = "";

    if (!avatar) {
        errorElem.textContent = "Selecciona un avatar.";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "usuarios", uid), {
            nombre: name,
            avatar: avatar,
            email: email
        });

        localStorage.setItem("nombreJugador", name);
        localStorage.setItem("avatarJugador", avatar);

        if (window.actualizarDatosJugador) window.actualizarDatosJugador();
        if (window.mostrarSeccion) window.mostrarSeccion(menuContainer);

    } catch (error) {
        errorElem.textContent = error.message || "Error al registrar usuario.";
    }
});

window.addEventListener('DOMContentLoaded', () => {
    if (window.mostrarSeccion) window.mostrarSeccion(loginContainer);
});

document.querySelectorAll('button:not(.answer-button):not(#restart-btn):not(#exit-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.playClick) window.playClick();
    });
});
