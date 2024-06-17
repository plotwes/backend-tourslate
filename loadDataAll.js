const { Firestore } = require("@google-cloud/firestore");

async function loadDataAll() {
  try {
    const snapshotData = await db.collection("translate").get();
    const allData = [];
    snapshotData.forEach((doc) => {
      allData.push({
        id: doc.id,
        history: doc.data(),
      });
    });

    // Gabungkan data jika terpecah
    const mergedData = {};
    allData.forEach((data) => {
      const match = data.id.match(/(.*)_part(\d+)/);
      if (match) {
        const [_, baseId, part] = match;
        if (!mergedData[baseId]) {
          mergedData[baseId] = [];
        }
        mergedData[baseId][part] = data.history.data;
      } else {
        mergedData[data.id] = data.history;
      }
    });

    // Gabungkan bagian data menjadi satu
    for (const id in mergedData) {
      if (Array.isArray(mergedData[id])) {
        mergedData[id] = JSON.parse(mergedData[id].join(''));
      }
    }

    return Object.keys(mergedData).map((id) => ({
      id,
      history: mergedData[id],
    }));
  } catch (error) {
    console.error("Error loading data:", error);
    throw new Error("Failed to load data");
  }
}

module.exports = loadDataAll;