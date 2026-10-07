// URL del backend Node/Express (ver carpeta mi-servidor: npm start)
const API_URL = 'http://localhost:3000/api/usuarios';

const formulario = document.getElementById('formularioRegistro');
const avisoExito = document.getElementById('avisoExito');

const campoTipoDocumento = document.getElementById('tipoDocumento');
const campoNombres = document.getElementById('nombres');
const campoApellidos = document.getElementById('apellidos');
const campoDireccion = document.getElementById('direccion');
const campoCiudad = document.getElementById('ciudad');
const campoFecha = document.getElementById('fechaNacimiento');
const campoCorreo = document.getElementById('correo');
const campoDocumento = document.getElementById('numeroDocumento');
const campoCelular = document.getElementById('celular');

const errorNombres = document.getElementById('errorNombres');
const errorCorreo = document.getElementById('errorCorreo');
const errorDocumento = document.getElementById('errorDocumento');
const errorCelular = document.getElementById('errorCelular');

const btnGuardar = document.getElementById('btnGuardar');
const btnActualizar = document.getElementById('btnActualizar');
const btnCancelar = document.getElementById('btnCancelar');

const contenedorTabla = document.getElementById('contenedorTabla');
const cuerpoTabla = document.getElementById('cuerpoTabla');

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSoloNumeros = /^[0-9]+$/;

// ---- Estado local (espejo de lo que hay en db.json) ----
let registros = [];
let idEditando = null; // id del registro que se está editando (null = modo "nuevo")

// ==================== VALIDACIONES ====================

function marcarError(input, mensajeElemento, mensaje) {
  input.classList.add('invalido');
  mensajeElemento.textContent = mensaje;
}

function limpiarError(input, mensajeElemento) {
  input.classList.remove('invalido');
  mensajeElemento.textContent = '';
}

function validarNombres() {
  if (campoNombres.value.trim() === '') {
    marcarError(campoNombres, errorNombres, 'El nombre es obligatorio.');
    return false;
  }
  limpiarError(campoNombres, errorNombres);
  return true;
}

function validarCorreo() {
  const valor = campoCorreo.value.trim();
  if (valor === '') {
    marcarError(campoCorreo, errorCorreo, 'El correo es obligatorio.');
    return false;
  }
  if (!regexCorreo.test(valor)) {
    marcarError(campoCorreo, errorCorreo, 'Ingresa un correo con formato válido, ej: ejemplo@correo.com');
    return false;
  }
  limpiarError(campoCorreo, errorCorreo);
  return true;
}

function validarDocumento() {
  const valor = campoDocumento.value.trim();
  if (valor === '') {
    marcarError(campoDocumento, errorDocumento, 'El número de documento es obligatorio.');
    return false;
  }
  if (!regexSoloNumeros.test(valor)) {
    marcarError(campoDocumento, errorDocumento, 'El número de documento debe ser numérico.');
    return false;
  }
  limpiarError(campoDocumento, errorDocumento);
  return true;
}

function validarCelular() {
  const valor = campoCelular.value.trim();
  if (valor === '') {
    marcarError(campoCelular, errorCelular, 'El celular es obligatorio.');
    return false;
  }
  if (!regexSoloNumeros.test(valor)) {
    marcarError(campoCelular, errorCelular, 'El celular debe ser numérico.');
    return false;
  }
  limpiarError(campoCelular, errorCelular);
  return true;
}

function validarTipoDocumento() {
  if (campoTipoDocumento.value === '') {
    return false;
  }
  return true;
}

campoNombres.addEventListener('input', validarNombres);
campoCorreo.addEventListener('input', validarCorreo);
campoCelular.addEventListener('input', validarCelular);
campoDocumento.addEventListener('input', validarDocumento);

// ==================== FOCUS / BLUR (colores) ====================

const coloresFoco = {
  tipoDocumento: '#ff4fa3',
  numeroDocumento: '#9b30ff',
  nombres: '#22c55e',
  apellidos: '#ff4fa3',
  direccion: '#9b30ff',
  ciudad: '#22c55e',
  fechaNacimiento: '#ff4fa3',
  correo: '#9b30ff',
  celular: '#22c55e'
};

Object.keys(coloresFoco).forEach(function (idCampo) {
  const elemento = document.getElementById(idCampo);
  if (!elemento) return;

  elemento.addEventListener('focus', function () {
    elemento.style.backgroundColor = coloresFoco[idCampo];
    elemento.style.color = '#ffffff';
  });

  elemento.addEventListener('blur', function () {
    elemento.style.backgroundColor = '#ffffff';
    elemento.style.color = '#000000';
  });
});

// ==================== CARGA DE DATOS DESDE LA API ====================

async function cargarRegistros() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error('No se pudo consultar la API');
    registros = await respuesta.json();
    renderizarTabla();
  } catch (error) {
    console.error('Error al cargar los registros:', error);
    mostrarAviso('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }
}

// ==================== CONSTRUIR REGISTRO Y TABLA ====================

function construirRegistroDesdeFormulario() {
  return {
    tipoDocumento: campoTipoDocumento.value,
    numeroDocumento: campoDocumento.value.trim(),
    nombres: campoNombres.value.trim(),
    apellidos: campoApellidos.value.trim(),
    direccion: campoDireccion.value.trim(),
    ciudad: campoCiudad.value,
    fechaNacimiento: campoFecha.value,
    correo: campoCorreo.value.trim(),
    celular: campoCelular.value.trim()
  };
}

function cargarDatosEnFormulario(registro) {
  campoTipoDocumento.value = registro.tipoDocumento;
  campoDocumento.value = registro.numeroDocumento;
  campoNombres.value = registro.nombres;
  campoApellidos.value = registro.apellidos;
  campoDireccion.value = registro.direccion;
  campoCiudad.value = registro.ciudad;
  campoFecha.value = registro.fechaNacimiento;
  campoCorreo.value = registro.correo;
  campoCelular.value = registro.celular;
}

function renderizarTabla() {
  cuerpoTabla.innerHTML = '';

  registros.forEach(function (r) {
    const fila = document.createElement('tr');
    fila.innerHTML =
      '<td>' + r.tipoDocumento + '</td>' +
      '<td>' + r.numeroDocumento + '</td>' +
      '<td>' + r.nombres + '</td>' +
      '<td>' + r.apellidos + '</td>' +
      '<td>' + r.direccion + '</td>' +
      '<td>' + r.ciudad + '</td>' +
      '<td>' + r.fechaNacimiento + '</td>' +
      '<td>' + r.correo + '</td>' +
      '<td>' + r.celular + '</td>' +
      '<td>' +
        '<button type="button" class="btn-accion btn-actualizar" data-id="' + r.id + '">Editar</button>' +
        '<button type="button" class="btn-accion btn-eliminar" data-id="' + r.id + '">Eliminar</button>' +
      '</td>';
    cuerpoTabla.appendChild(fila);
  });

  contenedorTabla.style.display = registros.length > 0 ? 'block' : 'none';
}

function mostrarAviso(mensaje) {
  avisoExito.textContent = mensaje;
  avisoExito.classList.add('visible');
}

// ==================== MODO EDICIÓN ====================

function entrarModoEdicion(registro) {
  idEditando = registro.id;
  cargarDatosEnFormulario(registro);

  // Bloqueamos el documento mientras se edita para no crear ambigüedad
  campoTipoDocumento.disabled = true;
  campoDocumento.disabled = true;

  btnGuardar.disabled = true;
  btnActualizar.disabled = false;
  btnCancelar.disabled = false;
}

function salirModoEdicion() {
  idEditando = null;
  formulario.reset();

  campoTipoDocumento.disabled = false;
  campoDocumento.disabled = false;

  btnGuardar.disabled = false;
  btnActualizar.disabled = true;
  btnCancelar.disabled = true;

  [campoNombres, campoCorreo, campoDocumento, campoCelular].forEach(function (campo) {
    campo.classList.remove('invalido');
  });
  [errorNombres, errorCorreo, errorDocumento, errorCelular].forEach(function (span) {
    span.textContent = '';
  });
}

btnCancelar.addEventListener('click', salirModoEdicion);

// ==================== GUARDAR (POST) ====================

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  avisoExito.classList.remove('visible');

  if (idEditando !== null) return; // seguridad: no debería poder pasar aquí

  const tipoValido = validarTipoDocumento();
  const nombresValido = validarNombres();
  const correoValido = validarCorreo();
  const documentoValido = validarDocumento();
  const celularValido = validarCelular();

  if (!tipoValido) {
    campoTipoDocumento.classList.add('invalido');
  } else {
    campoTipoDocumento.classList.remove('invalido');
  }

  if (!(tipoValido && nombresValido && correoValido && documentoValido && celularValido)) {
    return;
  }

  const registro = construirRegistroDesdeFormulario();

  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    });

    if (!respuesta.ok) throw new Error('No se pudo guardar el registro');

    formulario.reset();
    await cargarRegistros();
    mostrarAviso('Registro guardado correctamente.');
  } catch (error) {
    console.error('Error al guardar:', error);
    mostrarAviso('Ocurrió un error al guardar el registro.');
  }
});

// ==================== ACTUALIZAR (PUT) ====================

btnActualizar.addEventListener('click', async function () {
  if (idEditando === null) return;

  const nombresValido = validarNombres();
  const correoValido = validarCorreo();
  const celularValido = validarCelular();

  if (!(nombresValido && correoValido && celularValido)) {
    return;
  }

  const registroActualizado = construirRegistroDesdeFormulario();
  registroActualizado.id = idEditando;

  try {
    const respuesta = await fetch(API_URL + '/' + idEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registroActualizado)
    });

    if (!respuesta.ok) throw new Error('No se pudo actualizar el registro');

    salirModoEdicion();
    await cargarRegistros();
    mostrarAviso('Registro actualizado correctamente.');
  } catch (error) {
    console.error('Error al actualizar:', error);
    mostrarAviso('Ocurrió un error al actualizar el registro.');
  }
});

// ==================== ACCIONES DE LA GRILLA (delegación de eventos) ====================

cuerpoTabla.addEventListener('click', async function (evento) {
  const boton = evento.target.closest('button');
  if (!boton) return;

  const id = boton.getAttribute('data-id');
  const registro = registros.find(function (r) { return String(r.id) === String(id); });
  if (!registro) return;

  if (boton.classList.contains('btn-actualizar')) {
    entrarModoEdicion(registro);
    return;
  }

  if (boton.classList.contains('btn-eliminar')) {
    const confirmar = confirm('¿Realmente deseas eliminar el registro de ' + registro.nombres + ' ' + registro.apellidos + '?');
    if (!confirmar) return;

    try {
      const respuesta = await fetch(API_URL + '/' + id, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('No se pudo eliminar el registro');

      // Si estabas editando justo el registro eliminado, sal del modo edición
      if (String(idEditando) === String(id)) {
        salirModoEdicion();
      }

      await cargarRegistros();
      mostrarAviso('Registro eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      mostrarAviso('Ocurrió un error al eliminar el registro.');
    }
  }
});

// ==================== INICIO ====================

cargarRegistros();