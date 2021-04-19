require('dotenv').config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 0:
        break;
      case 1:
        /* Buscar Ciudad */
        // Mostrar mensaje
        const termino = await leerInput('Ciudad:');

        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        // Seleccionar el lugar
        const id = await listarLugares(lugares);
        if (id === '0') continue;

        const { nombre, lon, lat } = lugares.find((lugar) => lugar.id === id);

        // Guardar en DB
        busquedas.agregarHistorial(nombre);

        // Clima
        const { desc, temp, min, max } = await busquedas.climaLugar(lat, lon);

        // Mostrar resultados
        console.clear();
        console.log(`\n-|> Informacion de ${nombre.brightGreen}\n`.brightBlue);
        console.log('Ciudad:'.brightBlue, nombre.brightGreen);
        console.log('Latitud:'.brightBlue, lon.toString().brightYellow);
        console.log('Longitud:'.brightBlue, lat.toString().brightYellow);
        console.log('Temperatura:'.brightBlue, temp.toString().brightYellow);
        console.log('Minima:'.brightBlue, min.toString().brightYellow);
        console.log('Maxima:'.brightBlue, max.toString().brightYellow);
        console.log('Como esta el clima:'.brightBlue, desc.brightGreen);
        break;

      case 2:
        // Historial
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.brightYellow;
          console.log(`${idx} ${lugar.brightBlue}`);
        });
        break;

      default:
        console.error('Tu no deberias estar aqui :c');
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
