// Main da aplicação

process.env.NODE_ENV === 'production' ? null : require('dotenv').config(); //Obtem as variáveis de ambiente do arquivo '.env'

require('./database');

require('./generateDatabase').generateDataBase();

require('./app')