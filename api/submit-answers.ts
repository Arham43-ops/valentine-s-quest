import { put } from '@vercel/blob';

const QUESTIONS = [
  'How Do You Want To Start The Date?',
  'What kind of plan sounds most fun for us?',
  'What should we do in the Evening?',
  'What kind of place would you enjoy going to?',
  'What would make this date feel like a really good one?',
  'What Do You Like The Most?',
];

export default async function handler(request: Request) {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const body = await request.json();
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (answers.length !== QUESTIONS.length || answers.some((answer: unknown) => typeof answer !== 'string' || !answer.trim())) {
      return Response.json({ error: 'Invalid answer set' }, { status: 400 });
    }
    const submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      answers: QUESTIONS.map((question, index) => ({ question, answer: answers[index] })),
    };
    await put(`submissions/${submission.id}.json`, JSON.stringify(submission, null, 2), {
      access: 'private', contentType: 'application/json', addRandomSuffix: false,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Answer submission failed:', error);
    return Response.json({ error: 'Unable to save answers' }, { status: 500 });
  }
}
