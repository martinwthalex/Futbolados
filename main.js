window.addEventListener('DOMContentLoaded', () => {

    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const menu = document.getElementById('menu-container');
    const game = document.getElementById('game-container');
    const instrucciones = document.getElementById('instructions-container');
    const puntuaciones = document.getElementById('ranking-container');
    const ending = document.getElementById('ending-container');

    const startButton = document.getElementById('start-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const rankingBtn = document.getElementById('ranking-btn');
    const logOutBtn = document.getElementById('logout-btn');
    const muteBtn = document.querySelector('.mute-btn');

    const backButtons = document.querySelectorAll('.back-to-menu');

    const backBtnIntructions = document.getElementById('back-btn');

    const menuWelcome = document.querySelector("#menu-container .welcome-text h1");

    let lastSection = null;

    function updateMuteBtn() {
        if (window.isMuted && window.isMuted()) {
            muteBtn.classList.add('muted');
        } else {
            muteBtn.classList.remove('muted');
        }
    }


    muteBtn.addEventListener('click', () => {
        if (window.setMute) {
            window.setMute(!window.isMuted());
            updateMuteBtn();
        }
    });

    updateMuteBtn();

    function mostrarSeccion(seccion) {
      loginContainer.style.display = 'none';
      registerContainer.style.display = 'none';
      menu.style.display = 'none';
      game.style.display = 'none';
      instrucciones.style.display = 'none';
      puntuaciones.style.display = 'none';
      if (ending) ending.style.display = 'none';
      seccion.style.display = 'block';

      if (seccion === ending) {
        if (window.stopMenuMusic) window.stopMenuMusic();
      } else {
        if (window.playMenuMusic && !window.isMuted()) {
          window.playMenuMusic(false);
          if (window.setMenuMusicRate) window.setMenuMusicRate(1);
        }
      }

      if (seccion === menu) {
        actualizarDatosJugador();
      }
      lastSection = seccion;
    }
    window.mostrarSeccion = mostrarSeccion;

    
    function actualizarDatosJugador() {        
      const nombre = localStorage.getItem("nombreJugador") || "Jugador";
      const avatar = localStorage.getItem("avatarJugador") || "avatar_default.png";

      const menuAvatar = document.getElementById("menu-player-avatar");
      const menuNombre = document.getElementById("menu-player-name");
      if (menuAvatar) menuAvatar.src = avatar;
      if (menuNombre) menuNombre.textContent = nombre;

      if (menuWelcome) menuWelcome.textContent = `¡Bienvenido ${nombre}!`;

      const gameAvatar = document.getElementById("game-player-avatar");
      const gameNombre = document.getElementById("game-player-name");
      if (gameAvatar) gameAvatar.src = avatar;
      if (gameNombre) gameNombre.textContent = nombre;
    }


    startButton.addEventListener('click', () => {
      if (window.startQuiz) window.startQuiz();
      mostrarSeccion(game);
    });

    backBtnIntructions.addEventListener('click', () => {
      mostrarSeccion(menu);      
    });

    instructionsBtn.addEventListener('click', () => {
      mostrarSeccion(instrucciones);
    });

    rankingBtn.addEventListener('click', () => {
      mostrarSeccion(puntuaciones);
      cargarRanking(); // Cargar el ranking al mostrar la sección
    });

    backButtons.forEach(button => {
      button.addEventListener('click', () => {
        mostrarSeccion(menu);
        if (ending) ending.style.display = 'none';
      });
    });

    logOutBtn.addEventListener('click', async () => {
        try {
            const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js");
            const { getApp } = await import("https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js");
            const auth = getAuth(getApp());
            await signOut(auth);
        } catch (e) {
        }
        localStorage.removeItem("nombreJugador");
        localStorage.removeItem("avatarJugador");
        if (window.mostrarSeccion) window.mostrarSeccion(loginContainer);
    });

    mostrarSeccion(loginContainer);
});
