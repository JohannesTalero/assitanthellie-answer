document.getElementById('formEvaluaciones').addEventListener('submit', function(e) {
    e.preventDefault();

    // Mostrar mensaje de carga
    mostrarMensajeCarga(true);

    const courseName = document.getElementById('courseName').value;
    const dateA = document.getElementById('fechaInicio').value;
    const dateB = document.getElementById('fechaFin').value;

    fetch('https://johannesta.pythonanywhere.com/get-evaluation-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            courseName: courseName,
            dateA: dateA,
            dateB: dateB,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        downloadExcel(data, `Evaluaciones_${courseName}_${dateA}_${dateB}`);
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensajeError('Error al procesar la solicitud');
    })
    .finally(() => {
        // Ocultar mensaje de carga
        mostrarMensajeCarga(false);
    });
});

function mostrarMensajeCarga(mostrar) {
    // Aquí puedes manipular el DOM para mostrar u ocultar un mensaje de carga
    const mensajeCarga = document.getElementById('mensajeCarga');
    mensajeCarga.style.display = mostrar ? 'block' : 'none';
}

function mostrarMensajeError(mensaje) {
    // Aquí puedes mostrar un mensaje de error en la interfaz de usuario
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
}

// Tu función downloadExcel existente...


function downloadExcel(jsonData, fileName) {
    let data;
    // Intentar parsear el JSON
    try {
        data = (typeof jsonData === 'string') ? JSON.parse(jsonData) : jsonData;
        //console.log('Datos parseados:', data);
    } catch (error) {
        //console.error('Error al parsear JSON:', error);
        return;
    }

    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Iterar sobre cada llave del objeto JSON
    Object.keys(data).forEach((key) => {
        let sheetData;
        try {
            // Intentar parsear cada arreglo de la cadena
            sheetData = JSON.parse(data[key]);
            //console.log('Datos de la hoja', key, ':', sheetData);
        } catch (e) {
            console.error('Error al parsear datos de la hoja', key, ':', e);
            return;
        }

        // Verificar que la propiedad convertida sea un arreglo
        if (Array.isArray(sheetData)) {
            // Convertir cada arreglo de objetos en una hoja de cálculo
            const worksheet = XLSX.utils.json_to_sheet(sheetData);
            // Añadir la hoja al libro de trabajo
            XLSX.utils.book_append_sheet(workbook, worksheet, key);
        } else {
            console.warn('La propiedad convertida', key, 'no es un arreglo:', sheetData);
        }
    });

    // Descargar el archivo Excel
    XLSX.writeFile(workbook, fileName + ".xlsx");
}
