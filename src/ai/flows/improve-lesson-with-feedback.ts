'use server';

/**
 * @fileOverview A flow to improve a lesson based on user feedback.
 *
 * - improveLessonWithFeedback - A function that improves a lesson based on feedback.
 * - ImproveLessonWithFeedbackInput - The input type for the improveLessonWithFeedback function.
 * - ImproveLessonWithFeedbackOutput - The return type for the improveLessonWithFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveLessonWithFeedbackInputSchema = z.object({
  lesson: z.string().describe('The lesson to improve.'),
  feedback: z.string().describe('The feedback to use to improve the lesson.'),
});
export type ImproveLessonWithFeedbackInput = z.infer<
  typeof ImproveLessonWithFeedbackInputSchema
>;

const ImproveLessonWithFeedbackOutputSchema = z.object({
  improvedLesson: z.string().describe('The improved lesson.'),
});
export type ImproveLessonWithFeedbackOutput = z.infer<
  typeof ImproveLessonWithFeedbackOutputSchema
>;

export async function improveLessonWithFeedback(
  input: ImproveLessonWithFeedbackInput
): Promise<ImproveLessonWithFeedbackOutput> {
  return improveLessonWithFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveLessonWithFeedbackPrompt',
  input: {schema: ImproveLessonWithFeedbackInputSchema},
  output: {schema: ImproveLessonWithFeedbackOutputSchema},
  prompt: `You are an expert teacher who can improve lessons based on feedback.

  Here is the lesson to improve:
  {{lesson}}

  Here is the feedback to use to improve the lesson:
  {{feedback}}

  Improve the lesson based on the feedback. Return the improved lesson.
  `,
});

const improveLessonWithFeedbackFlow = ai.defineFlow(
  {
    name: 'improveLessonWithFeedbackFlow',
    inputSchema: ImproveLessonWithFeedbackInputSchema,
    outputSchema: ImproveLessonWithFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
