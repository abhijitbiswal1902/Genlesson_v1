import { LessonGenerator } from '@/components/lesson-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <LessonGenerator />
    </main>
  );
}
