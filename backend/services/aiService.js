const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const ask = async (systemPrompt, userContent) => {
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userContent  }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content?.trim() || '';
};

const summarise = (content) =>
  ask('You are a study assistant. Summarise the following notes in clear, student-friendly bullet points. Keep it concise.', content);

const explain = (content) =>
  ask('You are a study assistant. Explain the following notes as if the student is hearing this topic for the first time. Use simple language and real-world examples.', content);

const generateQuiz = async (content) => {
  const raw = await ask(
    `You are a study assistant. Generate exactly 5 quiz questions from the following notes.
3 must be multiple choice (4 options each, mark the correct answer index as "answer": 0-3).
2 must be short answer (no options, no answer key).
Return ONLY a valid JSON array. No explanation. No markdown. Example format:
[{"question":"What is X?","options":["A","B","C","D"],"answer":1},{"question":"Explain Y briefly."}]`,
    content
  );
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [{ question: "Could not parse quiz. Try again.", options: ["A", "B", "C", "D"], answer: 0 }];
  }
};

const generateFlashcards = async (content) => {
  const raw = await ask(
    `Generate 8 flashcards from these notes. Return ONLY a valid JSON array with "term" and "definition" keys. No markdown.
Example: [{"term":"REST","definition":"An architectural style for APIs using HTTP methods."}]`,
    content
  );
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [{ term: "Error", definition: "Could not generate flashcards. Try again." }];
  }
};

const chat = async (messages, system) => {
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system || 'You are a helpful AI study tutor.' },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content?.trim() || '';
};

module.exports = { summarise, explain, generateQuiz, generateFlashcards, chat };
