const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

async function loadModel() {
  const modelUrl = process.env.TRANSLATION_MODEL_URL;
  if (!modelUrl) {
    throw new Error('modelUrl in loadGraphModel() cannot be null. Please provide a URL or an IOHandler that loads the model');
  }
  return tf.loadGraphModel(modelUrl);
}

module.exports = loadModel;