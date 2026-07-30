import { z } from 'zod';
import xss from 'xss';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  subject: z.string()
    .max(200, "Subject cannot exceed 200 characters")
    .optional(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters"),
});

export const sanitizeContactData = (data: { name: string; email: string; subject?: string; message: string }) => {
  return {
    name: xss(data.name),
    email: xss(data.email),
    subject: data.subject ? xss(data.subject) : undefined,
    message: xss(data.message),
  };
};
