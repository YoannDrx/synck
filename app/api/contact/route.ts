import { NextResponse } from 'next/server';
import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    if (!resend) {
      console.warn('RESEND_API_KEY is not configured. Contact form submission cannot be sent.');
      return NextResponse.json(
        { error: 'Service de messagerie non configuré' },
        { status: 503 }
      );
    }

    // Send email with Resend
    const data = await resend.emails.send({
      from: 'Contact Portfolio <onboarding@resend.dev>', // Replace with your verified domain
      to: ['caroline.senyk@gmail.com'],
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d5ff0a;">Nouveau message de contact</h2>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Sujet:</strong> ${subject}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border-left: 4px solid #d5ff0a;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Ce message a été envoyé depuis le formulaire de contact du portfolio.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
