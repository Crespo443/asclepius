const predictClassification = require('../services/inferenceService');
const storeData = require('../services/storeData')
const crypto = require('crypto');
const { Firestore } = require('@google-cloud/firestore');
 
const postPredictHandler = async(request, h) => {
    try {
        const { image } = request.payload;
        const { model } = request.server.app;
        if (!image) {
            throw new InputError('No file uploaded', 400);
        }
        if (Buffer.byteLength(image) > 1000000) {
            throw new InputError('File size exceeds the maximum limit of 1MB', 413);
        }

        const { label, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        
        const data = {
            "id": id,
            "result": label,
            "suggestion": suggestion,
            "createdAt": createdAt
        }
        await storeData(id, data)
        
        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data
        })
        response.code(201);
        return response;
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error instanceof InputError ? error.message : 'Terjadi kesalahan dalam melakukan prediksi',
          }).code(400);
    }
}

const getHistoryPredictHandler = async (request , h) => {
    try {
        const db = new Firestore();
        const predictCollection = db.collection('predictions');
        const predictSnapshot = await predictCollection.get();

        const data = [];

        predictSnapshot.forEach((doc) => {
            const history = {
                id: doc.id,
                history: doc.data()
            };
            data.push(history);
        });

        const response = h.response({
            status: 'success',
            data: data
        });
        response.code(200);
        return response;
    } catch (error) {
        console.log(error.message)
    }
}
 
module.exports = {
    postPredictHandler,
    getHistoryPredictHandler
}