//CONECTA O BANCO DE DADOS

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const uri = process.env.MONGODB_URI || 'mongodb://localhost/chapin_chef'

module.exports = mongoose.connect(uri)