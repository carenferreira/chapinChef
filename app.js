// INTEGRAÇÃO ENTRE WATSON, BANCO DE DADOS E FACEBOOK MESSENGER

'use strict';

const BootBot = require('bootbot');
const chatBot = require('./chatBot');
const User = require('./user');

const bot = new BootBot({
    accessToken: process.env.FB_ACCESS_TOKEN,
    verifyToken: process.env.FB_VERIFY_TOKEN,
    appSecret: process.env.FB_APP_SECRET
});

function enviaMensagens(chat, mensagens) {

    mensagens.forEach((mensagem, index) => {
        setTimeout(() => {
            chat.say(mensagem);
        }, (index * 2500));
    });

    return [];
}

function enviaCards(chat, cards) {

    cards.forEach(card => console.log(card.title));

    if (cards.length > 0)
        setTimeout(() => {
            chat.say({
                cards
            })
        }, cards.length * 500);

    return [];
}

function responderMessenger(chat, user) {
    chatBot.perguntarWatson(user)
        .then(resp => {
            let mensagens = [];
            let cards = [];
            resp.output.generic.forEach((objeto, index) => {
                setTimeout(() => {
                    if (objeto.response_type == 'text') {
                        if (cards.length > 0)
                            cards = enviaCards(chat, cards);
                        mensagens.push(objeto.text);
                    }
                    else if (objeto.response_type == 'image') {
                        let description = objeto.description.split("[")[0];
                        let postback = objeto.description.match(/\[(.*)\]/) ? objeto.description.match(/\[(.*)\]/)[1] : null;
                        
                        if (postback)
                            if (mensagens.length > 0)
                                mensagens = enviaMensagens(chat, mensagens);
                        cards.push(
                            {
                                title: objeto.title,
                                image_url: objeto.source,
                                subtitle: description,
                                buttons: [
                                    { type: 'postback', title: postback, payload: objeto.payload },
                                ]
                            }
                        )
                    }

                    if (resp.output.generic.length - 1 == index) {
                        cards = enviaCards(chat, cards);
                        mensagens = enviaMensagens(chat, mensagens);
                    }
                }, index * 100);
            });

            user.save()
        })
}

function analisaMessenger(payload, chat) {
    User.find({ id: payload.sender.id }, function (err, data) {
        let user;
        if (data.length == 0) {
            chat.getUserProfile().then((user) => {
                let newUser = new User({
                    id: payload.sender.id,
                    context: {
                        metadata: {
                            user_id: payload.sender.id
                        },
                        name: user.first_name
                    },
                    message: {
                        text: payload.message.text
                    }
                })
                user = newUser;
                responderMessenger(chat, user);
            })
        }
        else {
            user = data[0];
            user.message = {
                text: payload.message.text
            }
            responderMessenger(chat, user);
        }
    })
}

bot.on('postback', (payload, chat) => {
    payload.message = {
        text: payload.postback.payload
    }
    analisaMessenger(payload, chat);
});

bot.on('message', (payload, chat) => {
    analisaMessenger(payload, chat);
});

//Inicia o serviço do bot
bot.start(process.env.PORT || 3000);