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

function nextBatch(options) {
  const { batches, asyncMap, beforeNextBatchCallback, afterAsyncResultsBatch, batchDelay, justOneBatch } = options;

  const currentBatch = batches.shift();

  if (currentBatch) {
    if (beforeNextBatchCallback) {
      beforeNextBatchCallback(currentBatch);
    }

    const promises = currentBatch.map(asyncMap);

    Promise.all(promises).then(results => {
      afterAsyncResultsBatch(results, { isLastBatch: batches.length == 0 });

      if (!justOneBatch) {
        if (batchDelay) {
          setTimeout(() => {
            nextBatch(options);
          }, batchDelay);
        } else {
          nextBatch(options);
        }
      }
    });
  }
}

function processBatch({ entries, batchSize = 10, beforeNextBatchCallback, asyncMap, afterAsyncResultsBatch, firstBatchSize, batchDelay, justOneBatch } = {}) {
  const batches = chunkArray(entries, batchSize, firstBatchSize);
  nextBatch({ batches, asyncMap, beforeNextBatchCallback, afterAsyncResultsBatch, batchDelay, justOneBatch });
}

export default processBatch;
