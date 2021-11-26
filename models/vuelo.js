var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VueloSchema = Schema({
    numVuelo:{
        type: String,
        required:true,
        unique:true
    },
    aerolinea:{
        type:String,
        rquired:true
    },
    ciudadOrigen:{
        type: String,
        required: true
    },
    ciudadDestino:{
        type: String,
        required: true
    },
    fSalida:{
        type: String,
        required: true
    },
    horaSalida:{
        type: Number,
        required:true
    },
    minutoSalida:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model("vuelo",VueloSchema)