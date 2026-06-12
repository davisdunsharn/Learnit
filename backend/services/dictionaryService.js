const axios = require('axios');

const getDefinition = async (word) => {
  const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  const entry = res.data?.[0];
  if (!entry) return null;
  const meaning  = entry.meanings?.[0];
  const def      = meaning?.definitions?.[0];
  return {
    word: entry.word,
    phonetic: entry.phonetic || '',
    partOfSpeech: meaning?.partOfSpeech || '',
    definition: def?.definition || '',
    example: def?.example || '',
  };
};

module.exports = { getDefinition };
