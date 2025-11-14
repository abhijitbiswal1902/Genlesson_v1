'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Eye } from 'lucide-react';
import { generateLesson, Lesson } from '@/ai/flows/generate-lesson-from-topic';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type GeneratedLesson = {
  id: string;
  topic: string;
  lesson: Lesson | null;
  status: 'pending' | 'generated' | 'failed';
};

export function LessonGenerator() {
  const [topic, setTopic] = useState('');
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLesson[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a topic.',
      });
      return;
    }

    setIsLoading(true);
    const newLesson: GeneratedLesson = {
      id: new Date().toISOString(),
      topic,
      lesson: null,
      status: 'pending',
    };
    setGeneratedLessons((prev) => [newLesson, ...prev]);
    setTopic('');

    try {
      const result = await generateLesson({ topic: newLesson.topic });
      if (result?.lesson) {
        setGeneratedLessons((prev) =>
          prev.map((l) =>
            l.id === newLesson.id
              ? { ...l, lesson: result.lesson, status: 'generated' }
              : l
          )
        );
      } else {
        throw new Error('The generated lesson was empty.');
      }
    } catch (error) {
      console.error(error);
      setGeneratedLessons((prev) =>
        prev.map((l) =>
          l.id === newLesson.id ? { ...l, status: 'failed' } : l
        )
      );
      toast({
        variant: 'destructive',
        title: 'Failed to generate lesson',
        description:
          'An error occurred while generating the lesson. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl shadow-2xl bg-card">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold tracking-tighter">
            LessonGen
          </CardTitle>
        </div>
        <CardDescription className="text-lg text-muted-foreground">
          Enter any topic and let AI create a comprehensive lesson for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleGenerate}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            type="text"
            placeholder="e.g., 'The basics of Quantum Physics'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            className="flex-grow text-base"
          />
          <Button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Lesson'
            )}
          </Button>
        </form>
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium">Lesson Outline Examples:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>A one-pager on how to divide with long division</li>
            <li>
              An explanation of how the Cartesian Grid works and an example of
              finding distances between points
            </li>
            <li>A test on counting numbers</li>
          </ul>
        </div>
      </CardContent>

      {generatedLessons.length > 0 && <Separator className="my-0" />}

      {generatedLessons.length > 0 && (
        <CardContent className="p-6">
          <h2 className="text-xl font-headline font-semibold mb-4 text-foreground">
            History
          </h2>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.topic}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lesson.status === 'generated'
                            ? 'default'
                            : lesson.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {lesson.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {lesson.status === 'generated' && lesson.lesson && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                {lesson.lesson.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                              <div className="bg-secondary/30 p-4 rounded-md border mb-4">
                                <h3 className="font-semibold text-lg mb-2 text-primary">
                                  Introduction
                                </h3>
                                <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-foreground/90">
                                  {lesson.lesson.introduction}
                                </p>
                              </div>
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                                defaultValue="item-0"
                              >
                                {lesson.lesson.sections.map((section, i) => (
                                  <AccordionItem
                                    value={`item-${i}`}
                                    key={i}
                                  >
                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                      {section.title}
                                    </AccordionTrigger>
                                    <AccordionContent className="whitespace-pre-wrap font-body text-base leading-relaxed text-foreground/90 bg-secondary/30 p-4 rounded-md border">
                                      {section.content}
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>

                              <div className="bg-secondary/30 p-4 rounded-md border mt-4">
                                <h3 className="font-semibold text-lg mb-2 text-primary">
                                  Summary
                                </h3>
                                <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-foreground/90">
                                  {lesson.lesson.summary}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {lesson.status === 'pending' && (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
