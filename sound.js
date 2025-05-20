const sounds = {
    click: new Audio("./src/audio/clickSound.mp3"),
    goal: new Audio("./src/audio/goal.mp3"),
    menu: new Audio("./src/audio/menuMusic.mp3"),
    fail: new Audio("./src/audio/queMiraBobo.mp3")
};

let isMuted = false;

sounds.menu.loop = true;

function playMenuMusic(restart = false) {
    if (!isMuted) {
        if (restart) {
            sounds.menu.currentTime = 0;
        }
        if (sounds.menu.paused) {
            sounds.menu.play();
        }
    }
}
function stopMenuMusic() {
    sounds.menu.pause();    
}

function playClick() {
    if (!isMuted) {
        sounds.click.currentTime = 0;
        sounds.click.play();
    }
}

function playGoal() {
    if (!isMuted) {
        sounds.goal.currentTime = 0;
        sounds.goal.play();
    }
}

function playFail() {
    if (!isMuted) {
        sounds.fail.currentTime = 0;
        sounds.fail.play();
    }
}

function setMute(mute) {
    isMuted = mute;
    // Pausa todos los sonidos si mute
    if (isMuted) {
        Object.values(sounds).forEach(a => { a.pause(); });
    } else {
        // Si estamos en sección con música, vuelve a sonar la música
        const menu = document.getElementById("menu-container");
        const login = document.getElementById("login-container");
        const register = document.getElementById("register-container");
        const instrucciones = document.getElementById("instructions-container");
        const ranking = document.getElementById("ranking-container");
        const ending = document.getElementById("ending-container");
        const game = document.getElementById("game-container");
        if (
            (menu && menu.style.display === "block") ||
            (login && login.style.display === "block") ||
            (register && register.style.display === "block") ||
            (instrucciones && instrucciones.style.display === "block") ||
            (ranking && ranking.style.display === "block") ||
            (game && game.style.display === "block")
        ) {
            playMenuMusic(false);
        }
    }
}

// Función para ajustar la velocidad de la música de fondo
function setMenuMusicRate(rate = 1) {
    sounds.menu.playbackRate = rate;
}

// Para acceso global
window.playMenuMusic = playMenuMusic;
window.stopMenuMusic = stopMenuMusic;
window.playClick = playClick;
window.playGoal = playGoal;
window.playFail = playFail;
window.setMute = setMute;
window.isMuted = () => isMuted;
window.setMenuMusicRate = setMenuMusicRate;
