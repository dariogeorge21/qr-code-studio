import { NextRequest, NextResponse } from 'next/server';
import { sharedDB } from '@/lib/sharedDB';
import { z } from 'zod';
import { contactFormSchema, sanitizeContactData } from '@/lib/validations/contact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize and validate inputs on the server side
    const sanitizedData = sanitizeContactData(body);
    const validationResult = contactFormSchema.safeParse(sanitizedData);
    
    if (!validationResult.success) {
      console.warn('Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    console.log('Processing contact submission:', { name, email, hasSubject: !!subject });

    const result = await sharedDB.query(
      `INSERT INTO qr_contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, message, created_at::text as created_at`,
      [name, email, subject || null, message],
    );

    console.log('Contact submitted successfully:', { id: result.rows[0]?.id });
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error submitting contact form:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
