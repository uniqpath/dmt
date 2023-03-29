export default function splitTextIntoChunks(text) {
  const paragraphs = text.split('\n\n');

  const chunks = [];
  let currentChunk = '';
  let targetChunkSize = Math.ceil(text.length / Math.ceil(text.length / 1024));

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > 1024) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length > 1) {
    const avgSize = Math.floor(text.length / chunks.length);
    let i = 0;
    while (i < chunks.length - 1) {
      if (chunks[i].length < avgSize * 0.8 && chunks[i + 1].length > avgSize * 1.2) {
        const nextChunkParagraphs = chunks[i + 1].split('\n\n');
        if (nextChunkParagraphs.length > 1) {
          chunks[i] = chunks[i] + '\n\n' + nextChunkParagraphs[0];
          chunks[i + 1] = nextChunkParagraphs.slice(1).join('\n\n');
          continue;
        }
      }
      i++;
    }
  }

  return chunks;
}
