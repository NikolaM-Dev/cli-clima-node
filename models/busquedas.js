const fs = require('fs');

const axios = require('axios');

class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    // TODO: Leer DB si existe
    this.leerBD();
  }

  leerBD() {
    if (!fs.existsSync(this.dbPath)) return null;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf8' });
    const { historial } = JSON.parse(info);
    this.historial = historial;
  }

  get historialCapitalizado() {
    // Capitalizar
    return this.historial.map((lugar) => {
      let palabras = lugar.split(' ');
      palabras = palabras.map((p) => {
        if (p === 'de') return p;
        return p[0].toUpperCase() + p.substring(1);
      });

      return palabras.join(' ');
    });
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: 'es',
    };
  }

  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    };
  }

  async ciudad(termino = '') {
    try {
      // peticion http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${termino}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lon: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (err) {
      console.warn('No se encontraron datos de la busqueda :(');
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      // instance axios.create()
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/weather',
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      // resp.data
      const { data } = await instance.get();
      const { main, weather } = data;

      return {
        desc: weather[0].description,
        temp: main.temp,
        min: main.temp_min,
        max: main.temp_max,
      };
    } catch (err) {
      console.warn(err);
    }
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  agregarHistorial(lugar = '') {
    if (this.historial.includes(lugar.toLocaleLowerCase())) return;

    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar.toLocaleLowerCase());

    // Grabar en DB
    this.guardarDB();
  }
}

module.exports = Busquedas;
