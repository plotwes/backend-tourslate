const tf = require('@tensorflow/tfjs-node');
const loadModel = require('./loadModel');

const MAX_SEQUENCE_LENGTH = 100; // Sesuaikan dengan panjang maksimum yang digunakan dalam model
let model; // Variabel untuk menyimpan model yang di-cache

async function loadTranslationModel() {
  if (!model) {
    model = await loadModel();
  }
  return model;
}

// Fungsi preprocessing tanpa tokenizer
const preprocess = (text) => {
  const encoderInputTokens = text.split('').map(char => char.charCodeAt(0));
  if (encoderInputTokens.length < MAX_SEQUENCE_LENGTH) {
    const pads = new Array(MAX_SEQUENCE_LENGTH - encoderInputTokens.length).fill(0);
    encoderInputTokens.push(...pads);
  } else if (encoderInputTokens.length > MAX_SEQUENCE_LENGTH) {
    encoderInputTokens.length = MAX_SEQUENCE_LENGTH;
  }
  return tf.tensor2d([encoderInputTokens], [1, MAX_SEQUENCE_LENGTH], 'float32');
};

// Fungsi postprocessing tanpa tokenizer
const postprocess = (outputTensor) => {
  const outputTokens = outputTensor.dataSync();
  const tokensArray = Array.from(outputTokens);
  let translatedText = tokensArray.map(token => String.fromCharCode(token)).join('');
  translatedText = translatedText.replace(/\0/g, '').trim();
  return translatedText;
};

// Fungsi greedy sampling
async function greedySampling(encoderInputTokens, model, startToken, endToken, padToken) {
  let prompt = new Array(MAX_SEQUENCE_LENGTH).fill(padToken);
  prompt[0] = startToken;
  let promptTensor = tf.tensor2d([prompt], [1, MAX_SEQUENCE_LENGTH], 'float32');
  
  let outputTokens = [];
  for (let i = 0; i < MAX_SEQUENCE_LENGTH; i++) {
    const predictions = await model.predict([encoderInputTokens, promptTensor]);
    const logits = predictions.arraySync()[0][i]; // Ambil prediksi untuk posisi saat ini
    const nextToken = logits.indexOf(Math.max(...logits)); // Ambil token dengan probabilitas tertinggi

    if (nextToken === endToken) break; // Jika token adalah endToken, hentikan prediksi
    outputTokens.push(nextToken);

    promptTensor = tf.tensor2d([prompt.slice(0, i + 1).concat([nextToken]).concat(new Array(MAX_SEQUENCE_LENGTH - i - 2).fill(padToken))], [1, MAX_SEQUENCE_LENGTH], 'float32');
  }

  return tf.tensor2d([outputTokens], [1, outputTokens.length], 'float32');
}

// Fungsi utama untuk menerjemahkan teks
const translate = async (Text) => {
  try {
    if (typeof Text !== 'string' || Text.length === 0) {
      throw new Error('Invalid input format: inputText should be a non-empty string.');
    }

    const model = await loadTranslationModel();
    const encoderInputTokens = preprocess(Text);

    const startToken = 2; // Misalkan [START] dilambangkan dengan 2
    const padToken = 0; // Misalkan [PAD] dilambangkan dengan 0
    const endToken = 3; // Misalkan [END] dilambangkan dengan 3
    const unkToken = 1; // Misalkan [UNK] dilambangkan dengan 1

    const outputTensor = await greedySampling(encoderInputTokens, model, startToken, endToken, padToken, unkToken);
    const translatedText = postprocess(outputTensor);

    return translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text");
  }
};

module.exports = translate;