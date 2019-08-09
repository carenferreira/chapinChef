const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    id: { type: Number },
    complement: { type: String },
    connector: { type: String },
    name: { type: String, required: true },
    measure: { type: String },
    ammount: { type: String },
})

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    ingredientes: [ingredientSchema],
    categories: [],
    steps: []
})

module.exports = mongoose.model('Recipe', recipeSchema);