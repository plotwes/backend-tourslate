const translateServicePromise = require('./translateService');
const storeData = require('./storeData');
const loadDataAll = require('./loadDataAll');
const crypto = require('crypto');

function generateUniqueId() {
    return crypto.randomBytes(16).toString('hex');
}

async function postTranslateHandler(request, h) {
    const { text } = request.payload;

    try {
        const translateService = await translateServicePromise; // Tunggu hingga translateService siap
        const translatedText = await translateService(text);
        const id = generateUniqueId();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            originalText: text,
            translatedText,
            createdAt,
        };

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: 'Text has been translated successfully',
            data,
        });
        response.code(201);
        return response;
    } catch (error) {
        console.error('Error handling translation:', error);
        const response = h.response({
            status: 'error',
            message: 'Failed to translate text',
        });
        response.code(500);
        return response;
    }
}

async function getTranslateHistoryHandler(request, h) {
    try {
        const allData = await loadDataAll();
        const response = h.response({
            status: 'success',
            data: allData,
        });
        response.code(200);
        return response;
    } catch (error) {
        console.error('Error loading translation history:', error);
        const response = h.response({
            status: 'error',
            message: 'Failed to load translation history',
        });
        response.code(500);
        return response;
    }
}

module.exports = { postTranslateHandler, getTranslateHistoryHandler };