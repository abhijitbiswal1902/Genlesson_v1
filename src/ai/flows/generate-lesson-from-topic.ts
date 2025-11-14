'use server';

/**
 * @fileOverview Generates a lesson from a given topic using the Gemini API.
 *
 * - generateLesson - A function that accepts a topic and returns a generated lesson.
 * - GenerateLessonInput - The input type for the generateLesson function.
 * - GenerateLessonOutput - The return type for the generateLesson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a lesson.'),
});
export type GenerateLessonInput = z.infer<typeof GenerateLessonInputSchema>;

const LessonSectionSchema = z.object({
  title: z.string().describe('Title of the lesson section.'),
  content: z.string().describe('Content of the lesson section.'),
});

const GenerateLessonOutputSchema = z.object({
  lesson: z
    .object({
      title: z.string().describe('The title of the lesson.'),
      introduction: z
        .string()
        .describe('A brief introduction to the lesson.'),
      sections: z
        .array(LessonSectionSchema)
        .describe('The sections of the lesson.'),
      summary: z.string().describe('A summary of the lesson.'),
    })
    .describe('The generated lesson in a structured format.'),
});
export type GenerateLessonOutput = z.infer<typeof GenerateLessonOutputSchema>;
export type Lesson = z.infer<typeof GenerateLessonOutputSchema>['lesson'];

export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonOutput> {
  return generateLessonFlow(input);
}

const generateLessonPrompt = ai.definePrompt({
  name: 'generateLessonPrompt',
  input: {schema: GenerateLessonInputSchema},
  output: {schema: GenerateLessonOutputSchema},
  prompt: `You are a helpful assistant that creates lessons on any topic.

  Generate a lesson about the following topic: {{{topic}}}
  
  The lesson should be structured with a title, an introduction, multiple sections with titles and content, and a summary.`,
});

const generateLessonFlow = ai.defineFlow(
  {
    name: 'generateLessonFlow',
    inputSchema: GenerateLessonInputSchema,
    outputSchema: GenerateLessonOutputSchema,
  },
  async input => {
    const {output} = await generateLessonPrompt(input);
    return output!;
  }
);
