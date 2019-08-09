// GERA A BASE DE DADOS DE ACORDO COM ARQUIVO QUE FOI FEITO SCRAPPING (receitas.json)

const Recipe = require('./recipe');
const fs = require("fs");

obterReceitas = () => {
    let data = fs.readFileSync("./data/receitas.json", "utf8");
    let json = JSON.parse(data);
    return json.map(
        recipe => new Recipe({
            name: recipe.nome,
            image: recipe.imagem,
            ingredientes: recipe.ingredientes.map(ingrediente => {
                return {
                    id: ingrediente.id,
                    complement: ingrediente.complement,
                    connector: ingrediente.connector,
                    name: ingrediente.nome,
                    measure: ingrediente.nome_medida,
                    ammount: ingrediente.quantidade
                }
            }),
            categories: recipe.categorias,
            steps: recipe.passos
        })
    )
}

module.exports.generateDataBase = () => {
    Recipe.find({}, (err, data) => {
        if (err || data.length <= 0 || data == undefined) {
            // Iteração com cada produto da lista produtos
            obterReceitas().forEach(receita => {
                // Salva o produto no banco
                receita.save()
            });
            console.log("Banco criado");
        }
    })
};