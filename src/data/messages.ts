export type Level = "pond" | "river" | "ocean";

export interface Message {
  id: number;
  level: Level;
  channel: string;
  technique: string;
  lever: string;
  from: string;
  body: string;
  isPhish: boolean;
  flags: string[];
}

export const MESSAGES: Message[] = [
  {
    id: 1,
    level: "pond",
    channel: "Email",
    technique: "Email phishing",
    lever: "Urgency",
    from: "security@paypa1-support.com",
    body: "URGENT: Your account will be closed in 24 hours. Click here to verify your password immediately.",
    isPhish: true,
    flags: [
      "Lookalike domain: 'paypa1' uses the number 1 instead of an 'l'",
      "Artificial urgency pressures you to act without thinking",
      "Asks for your password via a link",
    ],
  },
  {
    id: 2,
    level: "pond",
    channel: "SMS",
    technique: "Smishing",
    lever: "Reward",
    from: "+1 (555) 019-2231",
    body: "Congrats! You won a $500 gift card. Claim now: bit.ly/x9Fq2",
    isPhish: true,
    flags: [
      "Unexpected prize for a contest you never entered",
      "Shortened link hides the real destination",
      "Unknown sender number",
    ],
  },
  {
    id: 3,
    level: "pond",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "no-reply@github.com",
    body: "A new sign-in to your account was detected from Chrome on Windows. If this was you, no action is needed.",
    isPhish: false,
    flags: [
      "Real sender domain",
      "No link demanding action or credentials",
      "Tells you no action is needed if it was you",
    ],
  },
  {
    id: 4,
    level: "river",
    channel: "QR Code",
    technique: "Quishing",
    lever: "Authority",
    from: "Sticker on parking meter",
    body: "Scan to pay for parking: [QR code] (sticker placed over the original meter label)",
    isPhish: true,
    flags: [
      "QR code is a sticker placed over the official signage",
      "QR codes hide the destination URL until scanned",
      "Payment requests via unverified codes are a common scam",
    ],
  },
  {
    id: 5,
    level: "river",
    channel: "Email",
    technique: "Business email compromise",
    lever: "Authority",
    from: "ceo@yourcompany-corp.com",
    body: "I'm in a meeting and can't talk. I need you to buy 5 gift cards for a client today. Reply with the codes. Keep this between us.",
    isPhish: true,
    flags: [
      "Impersonates an executive (authority)",
      "Gift card requests are a classic scam",
      "Asks for secrecy and bypasses normal process",
    ],
  },
  {
    id: 6,
    level: "ocean",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "billing@stripe.com",
    body: "Your invoice #4821 is ready. View it anytime in your Stripe dashboard (log in directly at dashboard.stripe.com).",
    isPhish: false,
    flags: [
      "Real sender domain",
      "Directs you to log in directly instead of using a link",
      "Matches a service you actually use",
    ],
  },
];