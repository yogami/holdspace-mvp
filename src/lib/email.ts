// HoldSpace — Email Notification Stubs
// These functions log to console now. Wire to Resend when ready.
// Usage: import { sendBookingConfirmation } from "@/lib/email";

export async function sendBookingConfirmation(params: {
    to: string;
    healerName: string;
    seekerName: string;
    date: string;
    modality: string;
}) {
    console.log(`[EMAIL STUB] Booking confirmation → ${params.to}`, params);
    // When ready: const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: "noreply@holdspace.app", to: params.to, ... });
    return { sent: false, stub: true };
}

export async function sendReviewNotification(params: {
    to: string;
    healerName: string;
    rating: number;
    comment: string;
}) {
    console.log(`[EMAIL STUB] Review notification → ${params.to}`, params);
    return { sent: false, stub: true };
}

export async function sendSafetyReportAlert(params: {
    healerName: string;
    category: string;
    description: string;
}) {
    console.log(`[EMAIL STUB] Safety report alert for ${params.healerName}`, params);
    return { sent: false, stub: true };
}
