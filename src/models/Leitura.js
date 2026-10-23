const mongoose = require('mongoose');

const leituraSchema = new mongoose.Schema({
  co2: {
    type: Number,
    required: [true, 'O campo CO2 é obrigatório'],
    min: [0, 'O valor de CO2 deve ser maior ou igual a 0'],
    max: [5000, 'O valor de CO2 deve ser menor ou igual a 5000']
  },
  umidade: {
    type: Number,
    required: [true, 'O campo umidade é obrigatório'],
    min: [0, 'O valor de umidade deve ser maior ou igual a 0'],
    max: [100, 'O valor de umidade deve ser menor ou igual a 100']
  },
  temperatura: {
    type: Number,
    required: [true, 'O campo temperatura é obrigatório'],
    min: [-50, 'O valor de temperatura deve ser maior ou igual a -50'],
    max: [100, 'O valor de temperatura deve ser menor ou igual a 100']
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  dataHora: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create geospatial index for location-based queries
leituraSchema.index({ localizacao: '2dsphere' });

// Create text index for search
leituraSchema.index({ co2: 1, umidade: 1, temperatura: 1, dataHora: -1 });

const Leitura = mongoose.model('Leitura', leituraSchema);

module.exports = Leitura;
