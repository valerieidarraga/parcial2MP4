// Importar Mongoose
const mongoose = require('mongoose');

// Definir la estructura de los reportes
const mensajeSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true
    },

    ubicacion: {
        type: String,
        required: true
    },

    descripcion: {
        type: String,
        required: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }

});

// Exportar el modelo
module.exports = mongoose.model('Mensaje', mensajeSchema);