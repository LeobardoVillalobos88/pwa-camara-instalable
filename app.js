if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const btnInstalar = document.getElementById('btn-instalar');

let eventoInstalacionDiferido = null;

// Guarda el evento de instalación para usarlo cuando se pulse el botón
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  eventoInstalacionDiferido = event;
  btnInstalar.hidden = false;
});

btnInstalar.addEventListener('click', () => {
  eventoInstalacionDiferido.prompt();

  eventoInstalacionDiferido.userChoice
    .then((resultado) => {
      if (resultado.outcome === 'accepted') {
        btnInstalar.hidden = true;
      }
    });
});

// El iPhone no avisa que la app se puede instalar, así que se muestran los pasos a mano
function verificarEntornoIOS() {
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const estaInstalada = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (esIOS && !estaInstalada) {
    document.getElementById('instrucciones-ios').hidden = false;
  }
}

verificarEntornoIOS();
