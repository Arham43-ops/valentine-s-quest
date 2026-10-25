import { put } from '@vercel/blob';

const QUESTIONS = [
  'How Do You Want To Start The Date?',
  'What kind of plan sounds most fun for us?',
  'What should we do in the Evening?',
  'What kind of place would you enjoy going to?',
  'What would make this date feel like a really good one?',
  'What Do You Like The Most?',
];

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const answers = body && typeof body === 'object' && 'answers' in body && Array.isArray(body.answers)
      ? body.answers
      : [];

    if (
      answers.length !== QUESTIONS.length ||
      answers.some((answer: unknown) => typeof answer !== 'string' || !answer.trim())
    ) {
      response.status(400).json({ error: 'Invalid answer set' });
      return;
    }

    const submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      answers: QUESTIONS.map((question, index) => ({ question, answer: answers[index] })),
    };

    await put(`submissions/${submission.id}.json`, JSON.stringify(submission, null, 2), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Answer submission failed:', error);
    response.status(500).json({ error: 'Unable to save answers' });
  }
}
