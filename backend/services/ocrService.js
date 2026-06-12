const axios    = require('axios');
const FormData = require('form-data');

const extractText = async (fileBuffer, mimetype) => {
  const form = new FormData();
  form.append('base64Image', `data:${mimetype};base64,${fileBuffer.toString('base64')}`);
  form.append('language', 'eng');
  form.append('isOverlayRequired', 'false');

  const res = await axios.post('https://api.ocr.space/parse/image', form, {
    headers: {
      ...form.getHeaders(),
      apikey: process.env.OCR_API_KEY,
    },
  });

  const result = res.data?.ParsedResults?.[0]?.ParsedText;
  if (!result) throw new Error('No text found in image');
  return result.trim();
};

module.exports = { extractText };
