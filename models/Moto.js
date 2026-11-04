const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['Cambio de Aceite', 'Filtro de Aire', 'Bujía', 'Frenos', 'Cadena/Transmisión', 'Ajuste General', 'Otro']
  },
  kilometraje: {
    type: Number,
    required: true
  },
  detalles: {
    type: String,
    trim: true
  },
  costo: {
    type: Number,
    default: 0
  },
  realizadoPor: {
    type: String, // Nombre del mecánico o admin que hizo el servicio
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const motoSchema = new mongoose.Schema({
  placas: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  marca: {
    type: String,
    required: true,
    trim: true
  },
  modelo: {
    type: String,
    required: true,
    trim: true
  },
  anio: {
    type: Number,
    required: true
  },
  propietario: {
    nombre: { type: String, required: true },
    telefono: { type: String, required: true }
  },
  servicios: [servicioSchema], // Array embebido (NoSQL) con todo el historial de bitácoras
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Moto', motoSchema);