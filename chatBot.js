// CONECTA A WATSON E OBTEM AS RESPOSTAS BASEADO NAS PERGUNTAS.

require('dotenv').config() //Obtem as variáveis de ambiente do arquivo '.env'
const AssistantV1 = require('ibm-watson/assistant/v1');
const Recipe = require('./recipe');

// Configuração do asistente do IBM Watson (Chaves)
// todo process.env.<VALOR> é uma variável de ambiente
const assistant = new AssistantV1({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url: process.env.WATSON_URL,
    version: process.env.WATSON_VERSION
});

module.exports.perguntarWatson = (input) => new Promise((resolve, reject) => {

    // envio ao watson a sessão do usuário e a mensagem que ele informou para análise.
    assistant.message({
        workspace_id: process.env.WATSON_WORKSPACE_ID,
        context: input.context,
        input: input.message
    })
        .then((res) => {
            let entidadesDeIngredientes = res.entities.filter((entidade) => entidade.entity === 'ingrediente');

            let entidadesDeCategoria = res.entities.filter((entidade) => entidade.entity === 'categoria');

            if (entidadesDeCategoria.length > 0 && entidadesDeIngredientes.length > 0) {
                let query = Recipe.find({
                    "categories.id": parseInt(entidadesDeCategoria[0].value),
                    "ingredientes.id": { "$all": entidadesDeIngredientes.map(entidade => parseInt(entidade.value)) }
                }).limit(5);

                query.exec((err, data) => {
                    data.forEach(receita => {
                        res.output.generic.push({
                            response_type: 'image',
                            title: receita.name,
                            source: receita.image,
                            description: `${receita.name} [ver_receita]`,
                            payload: `obter_receita ${receita._id}`
                        })
                    });
                    resolve(res);
                })
            }
            if (entidadesDeCategoria.length > 0) {
                if (entidadesDeCategoria.length > 1) {
                    res.output.generic = [{
                        response_type: 'text',
                        text: 'Ops! eu só consigo pesquisar uma categoria! utilize só uma por favor :)'
                    }]
                    resolve(res);
                }

                else {
                    let query = Recipe.find({
                        "categories.id": parseInt(entidadesDeCategoria[0].value)
                    }).limit(5);

                    query.exec((err, data) => {
                        data.forEach(receita => {
                            res.output.generic.push({
                                response_type: 'image',
                                title: receita.name,
                                source: receita.image,
                                description: `${receita.name} [ver_receita]`,
                                payload: `obter_receita ${receita._id}`
                            })
                        });
                        resolve(res);
                    })
                }
            }
            else if (entidadesDeIngredientes.length > 0) {
                let query = Recipe.find({
                    "ingredientes.id": { "$all": entidadesDeIngredientes.map(entidade => parseInt(entidade.value)) }
                }).limit(5);

                query.exec((err, data) => {
                    data.forEach(receita => {
                        res.output.generic.push({
                            response_type: 'image',
                            title: receita.name,
                            source: receita.image,
                            description: `${receita.name} [ver_receita]`,
                            payload: `obter_receita ${receita._id}`
                        })
                    });
                    resolve(res);
                })
            }
            else if (res.intents.length > 0 && res.intents[0].intent === 'obter_receita') {
                let query = Recipe.findById(res.input.text.split(" ")[1]);

                query.exec((err, data) => {
                    //console.log(data);

                    res.output.generic.push({
                        response_type: 'text',
                        text: `Essa é a receita ${data.name}`
                    })

                    res.output.generic.push({
                        response_type: 'text',
                        text: `Ingredientes:`
                    })

                    data.ingredientes.forEach(ingrediente => {
                        res.output.generic.push({
                            response_type: 'text',
                            text: `${ingrediente.ammount || ''} ${ingrediente.measure || ''} ${ingrediente.connector || ''} ${ingrediente.name || ''}`
                        })
                    });

                    res.output.generic.push({
                        response_type: 'text',
                        text: `Modo de preparo:`
                    })

                    data.steps.forEach(step => {
                        res.output.generic.push({
                            response_type: 'text',
                            text: `${step}`
                        })
                    });

                    resolve(res);
                })
            }
            else {
                resolve(res);
            }
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
});