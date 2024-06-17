const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore();

async function storeData(id, data) {
  try {
    const translateCollection = db.collection("translate");

    // Jika data terlalu besar, pecah menjadi beberapa dokumen
    const maxDataSize = 1000000; // Batas ukuran data dalam byte
    const dataStr = JSON.stringify(data);
    
    if (Buffer.byteLength(dataStr, 'utf8') > maxDataSize) {
      const chunks = dataStr.match(new RegExp('.{1,' + maxDataSize + '}', 'g'));
      for (let i = 0; i < chunks.length; i++) {
        await translateCollection.doc(`${id}_part${i}`).set({ data: chunks[i] });
      }
    } else {
      await translateCollection.doc(id).set(data);
    }
    console.log(`Document with ID: ${id} has been successfully written.`);
  } catch (error) {
    console.error("Error storing data:", error);
    throw new Error("Failed to store data");
  }
}

module.exports = storeData;