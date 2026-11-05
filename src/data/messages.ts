import type { Rarity } from "../game/rarity";

export type Level = "pond" | "river" | "ocean";

export interface MessageHeader {
  label: string;
  value: string;
  /**
   * Which lines mattered. Only highlighted after the player has decided: the
   * text itself must stay neutral, because headers can be read before calling it.
   */
  tone?: "bad" | "good";
}

export interface Message {
  id: number;
  /**
   * How hard it is to call. On a phish this is also the rarity of the fish.
   * Legit messages get tiers too, so hard water has hard-to-trust real mail.
   */
  rarity: Rarity;
  channel: string;
  technique: string;
  lever: string;
  from: string;
  subject?: string;
  body: string;
  /** Text pushed far below the visible body by padding (content push-down). */
  fold?: string;
  /** Raw headers the player can pull up. The only tell on some mythics. */
  headers?: MessageHeader[];
  isPhish: boolean;
  flags: string[];
}

// All samples are inert training text: nothing here is ever rendered as a link.
export const MESSAGES: Message[] = [
  // ---------------------------------------------------------------- COMMON
  // Obvious on all three counts: fake title, fake address, broken writing.
  {
    id: 101,
    rarity: "common",
    channel: "Email",
    technique: "Mass email phishing",
    lever: "Fear",
    from: "paypal-secure-team1992@gmail-verify.ru",
    subject: "URGENT!!! YOU ACOUNT HAS BEEN SUSPENDID!!!",
    body: "Dear Costumer, we has detect unusuall activitys on you PayPall acount. You must to verifiy you password and credit card numbr in 24 hour or acount will be DELETE forever!!! Clik here imediatly: http://paypa1-login.ru/verify",
    isPhish: true,
    flags: [
      "Sender is a random string on a .ru domain, nothing to do with PayPal",
      "Spelling and grammar errors in nearly every sentence",
      "All-caps threat and a 24-hour deadline to stop you thinking",
      "Asks for a password and card number outright",
    ],
  },
  {
    id: 102,
    rarity: "common",
    channel: "SMS",
    technique: "Prize smishing",
    lever: "Greed",
    from: "+1 (555) 019-2231",
    body: "CONGRADULATIONS!! U hav WON $5OOO Walmrt gift crd!!! Clik http://bit.ly/fr33-m0ney NOW befor it expire!!! Reply STOP to cancle",
    isPhish: true,
    flags: [
      "You can't win a contest you never entered",
      "Zero in place of the letter O, and 'Walmrt' misspelled",
      "Shortened link hides where it really goes",
      "Replying STOP just confirms your number is live",
    ],
  },
  {
    id: 103,
    rarity: "common",
    channel: "Email",
    technique: "Advance-fee scam",
    lever: "Greed",
    from: "prince.abubakar.official@freemail-bank.biz",
    subject: "Dearest Beloved Frend: $14.5 MILLION USD for You",
    body: "Greetings in the name of God. I am Prince Abubakar and my late father has leave $14,500,000 in bank. I need trusted forigner to recieve funds and you will keep 30%. Kindly send you full name, bank acount and small transfer fee of $450 so we can begin.",
    isPhish: true,
    flags: [
      "Classic advance-fee setup: pay a small fee to unlock a fortune",
      "A stranger has no reason to trust you with millions",
      "Asks for bank details from a free-mail address",
    ],
  },
  {
    id: 104,
    rarity: "common",
    channel: "Email",
    technique: "Credential harvest",
    lever: "Urgency",
    from: "admin@micr0soft-0ffice-login.xyz",
    subject: "Micr0soft Offise 365 Pasword Expierd",
    body: "You Offise pasword is expierd today. Log in with old pasword at link belove to keep you emails or they will be loose. Thank You, Microsoft Teem.",
    isPhish: true,
    flags: [
      "Zeros in 'micr0soft' and a .xyz domain",
      "'Offise', 'Pasword', 'Teem': no real company ships this",
      "Threatens to lose your mail if you don't enter your password",
    ],
  },
  {
    id: 105,
    rarity: "common",
    channel: "Instagram DM",
    technique: "Social media phishing",
    lever: "Fear",
    from: "@instagram_copyrite_helpdesk22",
    body: "Hello Dear User!! You acount has copyrite violashun and will be band in 12 hour. Fill apeal form with you login informashun: insta-apeal-form.tk",
    isPhish: true,
    flags: [
      "Platforms don't handle violations through a DM from a random handle",
      "Misspelled 'copyright' and 'violation'",
      "An 'appeal form' that wants your login is the whole scam",
    ],
  },

  // ------------------------------------------------------------------ RARE
  // One of the three (title, address, text) now looks right. The rest don't.
  {
    id: 201,
    rarity: "rare",
    channel: "Email",
    technique: "Delivery scam",
    lever: "Curiosity",
    from: "ship-update@amazn-delivery.top",
    subject: "Your Amazon order has shipped",
    body: "Hi Customer, your package can not deliver because address is incomplete. Kindly re-confirm your adress and pay the $1.99 redelivery fee in link to avoid return to sender.",
    isPhish: true,
    flags: [
      "The title is believable, and that's the only thing that is",
      "'amazn-delivery.top' is not Amazon",
      "'Kindly' and broken grammar, plus a generic 'Hi Customer'",
      "A tiny fee is how they get your card number",
    ],
  },
  {
    id: 202,
    rarity: "rare",
    channel: "Email",
    technique: "Lookalike domain phishing",
    lever: "Fear",
    from: "no-reply@accounts-google.com",
    subject: "!!! IMPORTANT Act Now - Acount Compromise !!!",
    body: "Dear valued user, someone have tried to access you Google acount from Russia. You must confirm identity now or service will terminated.",
    isPhish: true,
    flags: [
      "The address is close: but Google uses accounts.google.com, not accounts-google.com",
      "Hyphen makes it a totally different domain anyone could buy",
      "Screaming title and broken grammar give it away anyway",
    ],
  },
  {
    id: 203,
    rarity: "rare",
    channel: "Email",
    technique: "Spear-lite HR lure",
    lever: "Curiosity",
    from: "hr.benefits.department@outlook.com",
    subject: "FW: FW: open this asap",
    body: "Hello, as part of our annual review we have updated the salary bands for all staff. Please review the attached document and confirm your details by Friday so that your adjustment can be processed in the next pay cycle.",
    isPhish: true,
    flags: [
      "The writing is clean and professional, the one thing that looks right",
      "Real HR doesn't send from a free outlook.com address",
      "'FW: FW: open this asap' isn't how payroll announces anything",
      "Salary news is bait: you badly want to open it",
    ],
  },
  {
    id: 204,
    rarity: "rare",
    channel: "SMS",
    technique: "Parcel smishing",
    lever: "Urgency",
    from: "+1 (555) 014-8820",
    body: "USPS: Your package is held at our warehouse due to a missing house number. Update within 12 hours: usps-redelivery-center.info",
    isPhish: true,
    flags: [
      "The wording is a good copy of a real delivery text",
      "USPS only uses usps.com: this domain is not theirs",
      "A random personal number, not a USPS short code",
      "USPS doesn't text you links unless you asked for tracking",
    ],
  },
  {
    id: 205,
    rarity: "rare",
    channel: "QR Code",
    technique: "Sticker quishing",
    lever: "Authority",
    from: "Sticker on parking meter",
    subject: "PAY HERE - City Parking",
    body: "Scan to pay for parking: [QR code]. The label looks a little newer than the rest of the meter.",
    isPhish: true,
    flags: [
      "QR code is a sticker placed over the official signage",
      "QR codes hide the destination URL until you've scanned",
      "Check the URL the camera previews, or pay at the machine",
    ],
  },

  // ------------------------------------------------------------------ EPIC
  // State-of-the-art tooling: AI writing, session theft, cloned voices.
  {
    id: 301,
    rarity: "epic",
    channel: "Email",
    technique: "AI-written spear phishing",
    lever: "Flattery",
    from: "dana.whitlock@talentbridge-partners.com",
    subject: "Your network security project caught my eye",
    body: "Hi, I came across your semester project on phishing awareness and really liked the approach you took with the game format. We're hiring security interns for summer and I think you'd be a strong fit. I've put the role details and pay range in a short doc. It just needs your university login to view, since it's shared through our campus partner portal.",
    isPhish: true,
    headers: [
      { label: "SPF", value: "pass (talentbridge-partners.com)" },
      { label: "Domain age", value: "registered 9 days ago", tone: "bad" },
    ],
    flags: [
      "AI lets attackers personalize at scale, using what you post publicly",
      "Perfect grammar no longer means anything",
      "A recruiter doc has no reason to want your university login",
      "SPF passes because they own the domain: it's only 9 days old",
    ],
  },
  {
    id: 302,
    rarity: "epic",
    channel: "Email",
    technique: "Email quishing",
    lever: "Authority",
    from: "it-security@corp-mfa-enroll.com",
    subject: "Action required: MFA re-enrollment",
    body: "Our identity provider is migrating this week. Scan the code below with your phone to re-enroll your authenticator before Thursday. [QR code image]",
    isPhish: true,
    headers: [
      { label: "From domain", value: "corp-mfa-enroll.com", tone: "bad" },
      { label: "Links in body", value: "0 (1 inline image)", tone: "bad" },
    ],
    flags: [
      "A QR image has no link for mail scanners to check",
      "It moves you to your phone, outside work security tools",
      "Sender domain isn't your company's",
    ],
  },
  {
    id: 303,
    rarity: "epic",
    channel: "Email",
    technique: "Adversary-in-the-middle",
    lever: "Curiosity",
    from: "sharepoint@sharepoint-docs-online.net",
    subject: "Q3 budget shared with you",
    body: "Mark shared a file with you: Q3_Budget_Final.xlsx. Open in SharePoint. The link takes you to a Microsoft sign-in page that looks exactly as it always does, and it asks for your password and MFA code.",
    isPhish: true,
    headers: [
      { label: "From domain", value: "sharepoint-docs-online.net", tone: "bad" },
      { label: "Real service", value: "sharepointonline.com" },
    ],
    flags: [
      "A reverse proxy shows the real login page and steals the session token",
      "Normal MFA codes don't stop this; passkeys bound to the real domain do",
      "Check the address bar on any login you reached from an email",
    ],
  },
  {
    id: 304,
    rarity: "epic",
    channel: "SMS + Push",
    technique: "MFA fatigue",
    lever: "Exhaustion",
    from: "+1 (555) 010-4471",
    body: "Hi this is Tyler from the IT help desk. We're syncing your account and you'll get a few Duo prompts tonight. Just hit approve on the next one and they'll stop. Sorry for the spam!",
    isPhish: true,
    flags: [
      "They already have your password: the prompts are them trying to log in",
      "Nobody legitimately needs you to approve a login you didn't start",
      "IT never needs you to accept a prompt. Deny and report it",
    ],
  },
  {
    id: 305,
    rarity: "epic",
    channel: "Web pop-up",
    technique: "Browser-in-the-browser",
    lever: "Convenience",
    from: "Pop-up on free-pdf-tools.example",
    subject: "Sign in with Google",
    body: "A login window opens with the Google logo and an address bar showing accounts.google.com, with a padlock. It looks exactly like the normal pop-up, and your password manager hasn't offered to fill it in.",
    isPhish: true,
    flags: [
      "The fake window, and its fake address bar, are just HTML",
      "Test: try dragging it past the edge of the browser window",
      "A password manager won't autofill it, since the real domain differs",
    ],
  },
  {
    id: 306,
    rarity: "epic",
    channel: "Voicemail",
    technique: "Deepfake voice clone",
    lever: "Authority",
    from: "Voicemail: \"Dr. Reyes\" (your manager's voice)",
    body: "Transcript: \"Hey, it's me. I'm boarding and I'm going to lose signal. The vendor's threatening to cut us off, so I need you to push that $8,400 payment through today. Details are in the text I'm sending you. Don't loop in finance, I'll sort it with them when I land.\"",
    isPhish: true,
    flags: [
      "A few seconds of public audio can clone someone's voice",
      "Unreachable, urgent, secret: three classic pressure tactics at once",
      "Call them back on a number you already have before moving money",
    ],
  },
  {
    id: 307,
    rarity: "epic",
    channel: "Email",
    technique: "OAuth consent phishing",
    lever: "Convenience",
    from: "no-reply@microsoft.com (via Teams)",
    subject: "Mail Reader Pro wants permission",
    body: "You land on the Microsoft login at login.microsoftonline.com and sign in as usual. Then it asks: \"Mail Reader Pro would like to read your mail, access your files, and stay signed in.\" Accept / Cancel.",
    isPhish: true,
    flags: [
      "The page is real, but the app asking for access is the attacker's",
      "Accepting hands over a token that survives a password reset",
      "Read permission screens: unknown app, broad access, no reason",
    ],
  },

  // ------------------------------------------------------------- LEGENDARY
  // Very real. Almost nothing wrong on the surface.
  {
    id: 401,
    rarity: "legendary",
    channel: "Email",
    technique: "Thread hijacking",
    lever: "Trust",
    from: "jen.parker@summitlabsupply.com",
    subject: "RE: PO 44172: July invoice",
    body: "Thanks for confirming the order, and yes the delivery date works on our end. One thing: our bank moved us to a new account after the merger, so please use the attached details for this and future payments. Accounting needs it applied before Friday's run. Thanks! Jen",
    isPhish: true,
    headers: [
      { label: "SPF / DKIM", value: "pass (summitlabsupply.com)" },
      { label: "Reply-To", value: "jen.parker@summitlabsupply.co", tone: "bad" },
    ],
    flags: [
      "A real mailbox was taken over, so it replies inside a real thread",
      "Replies quietly go to .co, not .com",
      "Any change of bank details gets a phone call to a known number",
    ],
  },
  {
    id: 402,
    rarity: "legendary",
    channel: "Email",
    technique: "Business email compromise",
    lever: "Authority",
    from: "m.ellison@yourcornpany.com",
    subject: "Confidential: acquisition wire",
    body: "I'm finishing the Halden deal and legal needs the deposit wired today. This is under NDA, so please don't discuss it until we announce Monday. Our counsel, Robert Haines, will email you the wire instructions. Let me know as soon as it's done. Thanks, Maria",
    isPhish: true,
    headers: [
      { label: "From domain", value: "yourcornpany.com", tone: "bad" },
      { label: "First seen", value: "first mail ever from this domain", tone: "bad" },
    ],
    flags: [
      "'rn' looks like 'm' in most fonts: yourcornpany vs yourcompany",
      "Secrecy cuts out the people who'd catch it",
      "Wire requests get verified in person or by a known number",
    ],
  },
  {
    id: 403,
    rarity: "legendary",
    channel: "Email + PDF",
    technique: "Callback phishing",
    lever: "Fear",
    from: "billing@secure-renewals-norton.com",
    subject: "Receipt: Annual protection plan $399.99",
    body: "Thank you for your renewal. Your card ending in the number on file has been charged $399.99. Invoice attached. If you did not authorize this charge, call our billing team at (555) 013-7700 within 24 hours to cancel.",
    isPhish: true,
    flags: [
      "No links and no malware, so filters see nothing to flag",
      "The 'support' agent walks you into installing remote-access software",
      "Check charges on your bank's own site, and find support numbers yourself",
    ],
  },
  {
    id: 404,
    rarity: "legendary",
    channel: "Email",
    technique: "Trusted service abuse",
    lever: "Authority",
    from: "dse@docusign.net",
    subject: "Complete with DocuSign: Updated_Direct_Deposit_Form.pdf",
    body: "Payroll Department sent you a document to review and sign. Please confirm your direct deposit details, including your online banking sign-in, so that your next paycheck isn't delayed. REVIEW DOCUMENT.",
    isPhish: true,
    headers: [
      { label: "SPF / DKIM", value: "pass (docusign.net)", tone: "good" },
      { label: "Sender account", value: "payroll.dept.hr@gmail.com", tone: "bad" },
    ],
    flags: [
      "Real platform and valid signature, with an attacker's account behind it",
      "Check who the sender is inside the service, not just the service",
      "Payroll changes happen through your HR portal, not a surprise form",
    ],
  },
  {
    id: 405,
    rarity: "legendary",
    channel: "Email",
    technique: "Maintainer supply-chain lure",
    lever: "Urgency",
    from: "support@npmjs.help",
    subject: "Two-factor authentication update required",
    body: "As part of ongoing security improvements, all maintainers must update their 2FA credentials by September 10. Accounts with outdated credentials will be temporarily locked starting that date. Update 2FA now.",
    isPhish: true,
    headers: [
      { label: "From domain", value: "npmjs.help (registered 3 days ago)", tone: "bad" },
      { label: "Real domain", value: "npmjs.com" },
    ],
    flags: [
      "Modeled on a real attack that compromised widely used npm packages",
      "Professional tone, and a believable policy with a real-sounding deadline",
      ".help is not npm: one maintainer's slip reaches millions of installs",
    ],
  },

  // ---------------------------------------------------------------- MYTHIC
  // Real-looking sender. Often the headers are the only evidence left.
  {
    id: 501,
    rarity: "mythic",
    channel: "Email",
    technique: "DKIM replay",
    lever: "Fear",
    from: "no-reply@accounts.google.com",
    subject: "Security alert: a subpoena was issued for your account",
    body: "Google received a legal request to produce your account content. You can view the case materials or submit a protest in the support portal. Sign in to review the case. The Google Accounts team",
    isPhish: true,
    headers: [
      { label: "DKIM", value: "pass (accounts.google.com)", tone: "good" },
      { label: "Signed-to", value: "me@mail-relay7.example", tone: "bad" },
      { label: "Link host", value: "sites.google.com/view/case-review", tone: "bad" },
    ],
    flags: [
      "A genuine Google-signed mail was re-sent as is, so the signature verifies",
      "The 'to' it was signed for isn't you",
      "The portal is on sites.google.com, which anyone can publish to",
      "Modeled on a real 2025 campaign. Passing DKIM doesn't prove it's for you",
    ],
  },
  {
    id: 502,
    rarity: "mythic",
    channel: "Email",
    technique: "Homoglyph domain spoof",
    lever: "Fear",
    from: "no-reply@аpple.com",
    subject: "Your Apple ID was used to sign in on a new device",
    body: "Your Apple ID was used to sign in to iCloud via a web browser. Date and time: today, 2:14 AM. If this was not you, secure your account now. Apple Support",
    isPhish: true,
    headers: [
      { label: "From (raw)", value: "no-reply@xn--pple-43d.com", tone: "bad" },
      { label: "Encoding", value: "IDN (internationalized domain name)", tone: "bad" },
    ],
    flags: [
      "That first 'a' is a Cyrillic letter that renders identically",
      "Only the raw punycode form, xn--pple-43d, gives it away",
      "Never reach an account page from an alert: go to the site yourself",
    ],
  },
  {
    id: 503,
    rarity: "mythic",
    channel: "Email",
    technique: "Content push-down",
    lever: "Trust",
    from: "receipts@squareup.com",
    subject: "Your receipt from Glades Coffee: $6.75",
    body: "Thanks for stopping by! 1 x Cold Brew, $4.75. 1 x Tip, $2.00. Total $6.75. Paid with Visa. No action needed. Rate your experience in the app.",
    fold: "Your account has been flagged by our fraud team. To prevent suspension, verify your payment information within 24 hours using the secure form: square-receipt-verify.example",
    headers: [
      { label: "SPF", value: "softfail (sending IP not listed)", tone: "bad" },
      { label: "Body size", value: "3,812 blank lines between text blocks", tone: "bad" },
    ],
    isPhish: true,
    flags: [
      "Scroll down: blank padding pushes the real payload out of view",
      "The preview, and many filters, only ever see the harmless receipt",
      "The spoofed sender only shows up as an SPF softfail in the headers",
    ],
  },
  {
    id: 504,
    rarity: "mythic",
    channel: "Email",
    technique: "Direct Send internal spoof",
    lever: "Authority",
    from: "it-helpdesk@yourcompany.com",
    subject: "Voicemail from extension 2214 (0:42)",
    body: "You have a new voicemail. Duration: 42 seconds. From: Internal 2214. Attached: VM_2214.html. This message was generated automatically by your company's phone system.",
    headers: [
      { label: "Route", value: "smart host, unauthenticated Direct Send", tone: "bad" },
      { label: "SPF", value: "softfail, originating IP is external", tone: "bad" },
      { label: "Attachment", value: "VM_2214.html", tone: "bad" },
    ],
    isPhish: true,
    flags: [
      "Shown as internal because a tenant feature accepted unauthenticated mail",
      "No outside-sender banner, and the address is really your company's",
      "A voicemail is audio: an .html attachment is a login page in disguise",
    ],
  },

  // ----------------------------------------------------------------- LEGIT
  // Harder tiers include real mail that looks scary, or is badly written.
  {
    id: 3,
    rarity: "common",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "no-reply@github.com",
    subject: "A new sign-in to your account",
    body: "A new sign-in to your account was detected from Chrome on Windows. If this was you, no action is needed.",
    isPhish: false,
    flags: [
      "Real sender domain",
      "No link demanding action or credentials",
      "Tells you no action is needed if it was you",
    ],
  },
  {
    id: 6,
    rarity: "rare",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "billing@stripe.com",
    subject: "Your invoice #4821 is ready",
    body: "Your invoice #4821 is ready. View it anytime in your Stripe dashboard (log in directly at dashboard.stripe.com).",
    isPhish: false,
    flags: [
      "Real sender domain",
      "Directs you to log in directly instead of using a link",
      "Matches a service you actually use",
    ],
  },
  {
    id: 7,
    rarity: "common",
    channel: "SMS",
    technique: "Legitimate",
    lever: "None",
    from: "72975",
    body: "Your dentist appt is Tue 3:30 PM with Dr. Lin. Reply C to confirm or call the office to reschedule.",
    isPhish: false,
    flags: [
      "Expected, from a short code your office uses",
      "No link, and nothing is asked of you but a yes",
    ],
  },
  {
    id: 8,
    rarity: "rare",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "rick@rickscustomreels.com",
    subject: "yr reel is done",
    body: "hey sorry for the late reply been out on the water. your reel is fixed, new drag washers, no charge since it was under warranty. come get it whenever we close at 5",
    isPhish: false,
    flags: [
      "Sloppy writing alone doesn't make it a phish: small businesses write like this",
      "It's a shop you actually used, and it matches your repair",
      "No link, no money, no login",
    ],
  },
  {
    id: 9,
    rarity: "epic",
    channel: "SMS",
    technique: "Legitimate",
    lever: "None",
    from: "32665 (your bank's short code)",
    body: "Cypress Bank Fraud Alert: Did you try to spend $212.40 at SHELL OIL? Reply YES or NO. We will never ask for your PIN or password by text.",
    isPhish: false,
    flags: [
      "Scary subject, but no link and no ask for credentials",
      "Comes from the same short code as earlier alerts",
      "If in doubt, call the number on the back of your card",
    ],
  },
  {
    id: 10,
    rarity: "epic",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "it-announce@yourcompany.com",
    subject: "Scheduled maintenance: password change required by Friday",
    body: "As announced in Monday's all-hands, passwords must be rotated this week. Please change yours through the employee portal you normally use. We are not including a link in this message, on purpose.",
    headers: [
      { label: "SPF / DKIM / DMARC", value: "pass (yourcompany.com)", tone: "good" },
      { label: "Route", value: "internal, authenticated", tone: "good" },
    ],
    isPhish: false,
    flags: [
      "Matches something announced through another channel",
      "Sends you to a portal you already know, with no link at all",
      "Headers all pass, and it took an authenticated internal route",
    ],
  },
  {
    id: 11,
    rarity: "legendary",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "dse@docusign.net",
    subject: "Complete with DocuSign: Lease_Renewal_2027.pdf",
    body: "Palmetto Property Management sent you a document to review and sign. This is the renewal we discussed on the phone Tuesday.",
    headers: [
      { label: "SPF / DKIM", value: "pass (docusign.net)", tone: "good" },
      { label: "Sender account", value: "leasing@palmettoproperty.example", tone: "good" },
    ],
    isPhish: false,
    flags: [
      "Same service as the classic abuse, but the sender account is your landlord",
      "It references a real conversation you can confirm",
      "You were expecting this exact document",
    ],
  },
  {
    id: 12,
    rarity: "mythic",
    channel: "Email",
    technique: "Legitimate",
    lever: "None",
    from: "no-reply@accounts.google.com",
    subject: "Security alert: new sign-in on Pixel 9",
    body: "We noticed a new sign-in to your Google Account on a Pixel 9. If this was you, you don't need to do anything. If not, we'll help you secure your account.",
    headers: [
      { label: "DKIM", value: "pass (accounts.google.com)", tone: "good" },
      { label: "Signed-to", value: "your own address", tone: "good" },
      { label: "Link host", value: "accounts.google.com", tone: "good" },
    ],
    isPhish: false,
    flags: [
      "DKIM passes, and it was signed for your own address",
      "Links go to accounts.google.com itself",
      "You just signed in on your new phone: it matches",
    ],
  },
];
