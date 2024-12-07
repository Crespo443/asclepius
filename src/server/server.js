const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv').config()
const routes = require('../server/routes')
const loadModel = require('../services/loadModel')
const InputError = require('../exceptions/InputError');

const init = async () => {
    const server = Hapi.server({
        port : 4000,
        host : '0.0.0.0',
        routes : {
            cors : {
                origin : ['*']
            },
            payload : {
                maxBytes : 1000000,
            },
        },
    });

    const model = await loadModel()
    server.app.model = model
    server.route(routes)

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response.isBoom && response.output.statusCode === 413) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
            
            newResponse.code(413);
            return newResponse;
        }

        if (response instanceof InputError || response.isBoom) {
            const statusCode = response instanceof InputError ? response.statusCode : 400;
            const newResponse = h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi',
            });

            newResponse.code(parseInt(statusCode));
            return newResponse;
        }
 
        return h.continue;
    });

    await server.start();
    console.log(`Server start at : ${server.info.uri}`)   
}

init()