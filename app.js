if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const btnInstalar = document.getElementById('btn-instalar');
const btnPreparar = document.getElementById('btn-preparar-camara');
const btnConfirmar = document.getElementById('btn-confirmar-permiso');
const btnAlternar = document.getElementById('btn-alternar-camara');
const btnApagar = document.getElementById('btn-apagar-camara');
const avisoPermiso = document.getElementById('aviso-permiso');
const controlesCamara = document.getElementById('controles-camara');
const visorVideo = document.getElementById('visor-camara');

let eventoInstalacionDiferido = null;
let streamActual = null;
let modoCamaraActual = 'environment'; // 'environment' = trasera | 'user' = frontal

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

function actualizarMensajeEstado(mensaje) {
  document.getElementById('mensaje-estado').textContent = mensaje;
}

function mostrarControles(camaraEncendida) {
  btnPreparar.hidden = camaraEncendida;
  controlesCamara.hidden = !camaraEncendida;
}

function bloquearBotones(bloquear) {
  [btnPreparar, btnAlternar, btnApagar].forEach((boton) => {
    boton.disabled = bloquear;
  });
}

// Libera la cámara actual; muchos teléfonos no dejan abrir otra mientras siga encendida
function detenerCamaraActiva() {
  if (streamActual) {
    streamActual.getTracks().forEach((track) => {
      track.stop();
    });
    streamActual = null;
  }
}

function iniciarCamara(modo) {
  detenerCamaraActiva();
  // Evita que un doble toque abra dos cámaras a la vez
  bloquearBotones(true);
  actualizarMensajeEstado('Encendiendo cámara...');

  const restricciones = {
    video: { facingMode: modo },
    audio: false
  };

  return navigator.mediaDevices.getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      visorVideo.srcObject = stream;
      mostrarControles(true);
      actualizarMensajeEstado(`Cámara activa (${modo === 'environment' ? 'Trasera' : 'Frontal'})`);
    })
    .catch((error) => {
      visorVideo.srcObject = null;

      if (error.name === 'NotAllowedError') {
        actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.');
      } else if (error.name === 'NotFoundError') {
        actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.');
      } else {
        actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`);
      }
    })
    .finally(() => {
      bloquearBotones(false);
    });
}

// El primer botón solo explica para qué se usa la cámara; todavía no se pide el permiso
btnPreparar.addEventListener('click', () => {
  document.getElementById('camara-aviso').textContent = modoCamaraActual === 'environment' ? 'trasera' : 'frontal';
  avisoPermiso.hidden = false;
});

btnConfirmar.addEventListener('click', () => {
  avisoPermiso.hidden = true;
  iniciarCamara(modoCamaraActual);
});

btnAlternar.addEventListener('click', () => {
  modoCamaraActual = modoCamaraActual === 'environment' ? 'user' : 'environment';
  iniciarCamara(modoCamaraActual);
});

btnApagar.addEventListener('click', () => {
  detenerCamaraActiva();
  visorVideo.srcObject = null;
  mostrarControles(false);
  actualizarMensajeEstado('Cámara apagada');
});

verificarEntornoIOS();
