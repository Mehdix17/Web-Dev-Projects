import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Default resend email 'onboarding@resend.dev' works for testing.
    // Replace with your verified domain email (e.g., 'hello@yourdomain.com') when ready.
    const data = await resend.emails.send({
      from: "Slidely Contact Form <onboarding@resend.dev>",
      to: ["slidelyofficial@gmail.com"], // Your email where you want to receive the messages
      replyTo: email, // Reply directly to the user who filled the form
      subject: `New Contact Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
