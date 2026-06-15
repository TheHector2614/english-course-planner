import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.string(),
    level: z.enum(["a1", "a2", "b1", "b1+", "b2", "b2+"]),
    unit: z.number(),
    description: z.string(),
    hours: z.number(),
    tags: z.array(z.string()),
    published: z.boolean().default(true),
  }),
});

const quizzes = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/quizzes" }),
  schema: z.object({
    level: z.string(),
    title: z.string(),
    questions: z.array(z.object({
      id: z.number(),
      question: z.string(),
      options: z.array(z.string()),
      correct: z.number(),
      explanation: z.string(),
    })),
  }),
});

const flashcards = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/flashcards" }),
  schema: z.object({
    level: z.string(),
    cards: z.array(z.object({
      front: z.string(),
      back: z.string(),
      example: z.string(),
    })),
  }),
});

export const collections = { lessons, quizzes, flashcards };
