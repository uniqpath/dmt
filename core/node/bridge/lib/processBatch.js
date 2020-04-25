function chunkArray(myArray, chunkSize, firstChunkSize) {
  const arrayLength = myArray.length;
  const tempArray = [];

  if (!firstChunkSize) {
    firstChunkSize = chunkSize;
  }

  const getChunkSize = index => (index == 0 ? firstChunkSize : chunkSize);

  for (let index = 0; index < arrayLength; index += getChunkSize(index)) {
    const myChunk = myArray.slice(index, index + getChunkSize(index));
    tempArray.push(myChunk);
  }

  return tempArray;
}

function nextBatch({ batches, asyncMap, afterAsyncResultsBatch, batchDelay }) {
  if (batches.length) {
    const currentBatch = batches[0];
    const promises = currentBatch.map(asyncMap);

    Promise.all(promises).then(results => {
      afterAsyncResultsBatch(results);

      const next = () => {
        nextBatch({ batches: batches.slice(1), asyncMap, afterAsyncResultsBatch });
      };

      if (batchDelay) {
        setTimeout(next, batchDelay);
      } else {
        next();
      }
    });
  }
}

function processBatch({ entries, batchSize = 10, asyncMap, afterAsyncResultsBatch, firstBatchSize, batchDelay } = {}) {
  const batches = chunkArray(entries, batchSize, firstBatchSize);
  nextBatch({ batches, asyncMap, afterAsyncResultsBatch, batchDelay });
}

export default processBatch;
