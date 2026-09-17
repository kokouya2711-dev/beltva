import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EFFECTIVE = "[DATE OF PUBLICATION]";
const UPDATED = "[DATE OF PUBLICATION]";

const INTRO = [
  { type: "p", text: "These Terms of Service (“Terms”) govern your use of the BELTVA app and related services (the “Service”). The Service is operated by [LEGAL NAME OF OPERATOR] (“BELTVA,” “we,” or “us”). By creating an account or using the Service, you agree to these Terms. Please also read our Privacy Policy." },
];

const SECTIONS = [
  {
    title: "1. Eligibility and age groups",
    blocks: [
      { type: "p", text: "You must be at least 13 years old and meet any higher minimum age required where you live. If the law where you live requires a parent or guardian’s permission, you may use the Service only with that permission. You must provide your correct date of birth. You may not misrepresent your age to enter another age group." },
      { type: "p", text: "BELTVA separates users aged 13 through 17 from users aged 18 or older. Users in different age groups are not shown to one another through profiles, search, posts, follows, chats, or other social features. When you turn 18, your account moves to the adult age group. Existing follows and chats with users under 18 will no longer be visible to either side." },
    ],
  },
  {
    title: "2. Your account",
    blocks: [
      { type: "p", text: "You are responsible for keeping your sign-in information secure and for activity on your account. Do not use someone else’s account or let someone else use yours. Contact us at beltva.support@gmail.com if you believe your account has been accessed without permission." },
      { type: "p", text: "You can request account deletion in account settings. You may restore the account within 30 days. After that period, it cannot be restored. Our Privacy Policy explains what happens to account data and messages you previously sent." },
    ],
  },
  {
    title: "3. Using the Service",
    blocks: [
      { type: "p", text: "BELTVA lets you record training activity and use social features such as profiles, posts, comments, follows, and chat. Your training records are private. What other users can see from your profile and social activity depends on the feature and your privacy settings, as described in our Privacy Policy." },
      { type: "p", text: "Content shared by other users is their responsibility and may be inaccurate. Information on BELTVA is general information, not individualized medical or professional advice. BELTVA does not promise any particular training or health result." },
    ],
  },
  {
    title: "4. Your content",
    blocks: [
      { type: "p", text: "You keep ownership of the text, photos, and other material you submit (“Your Content”). You must have the rights and permissions needed to share it, including permission to share another person’s image or private information." },
      { type: "p", text: "You give BELTVA a non-exclusive, worldwide, royalty-free license to host, store, reproduce, and display Your Content only as needed to provide, operate, and maintain the Service in line with your settings. This does not transfer ownership to us. The license ends when Your Content is deleted, except to the extent limited retention is necessary for legal, security, or moderation purposes or for messages that remain in a recipient’s conversation as explained in our Privacy Policy." },
      { type: "p", text: "Content you choose to make visible to other users may be seen by those users while it is available on the Service. If your account is deleted, messages you sent may remain in the recipient’s conversation with a label such as “Deleted User.”" },
    ],
  },
  {
    title: "5. Rules for the community",
    blocks: [
      { type: "p", text: "You may not use BELTVA to:" },
      { type: "ul", items: [
        "Threaten, bully, harass, or discriminate against others.",
        "Share exploitative or sexually explicit content, or content that promotes violence or other harm.",
        "Scam, impersonate others, spam, or send unwanted promotions or solicitations.",
        "Share another person’s private information without permission, or infringe intellectual property rights.",
        "Evade a block, account restriction, or the separation of age groups.",
        "Interfere with the Service or attempt to gain unauthorized access to accounts or data.",
        "Break applicable law.",
      ]},
      { type: "p", text: "These rules apply to profiles, posts, comments, photos, and chats. You can report content or conduct through the Service and block other users." },
    ],
  },
  {
    title: "6. Reports and account actions",
    blocks: [
      { type: "p", text: "We may review reports and relevant content. When reasonably necessary to address a violation of these Terms or protect users or the Service, we may remove content, warn a user, limit features, suspend an account, or close an account. We may act promptly in serious cases. A report does not automatically lead to a penalty; we assess the information available to us." },
      { type: "p", text: "If you have a question about an action on your account, contact beltva.support@gmail.com. We may not be able to share another user’s private information or the details of a report." },
    ],
  },
  {
    title: "7. Changes and availability",
    blocks: [
      { type: "p", text: "We may change, pause, or discontinue features. We aim to keep the Service available but cannot promise uninterrupted access. When reasonably possible, we will notify users of changes that materially affect how they use the Service." },
    ],
  },
  {
    title: "8. BELTVA’s rights",
    blocks: [
      { type: "p", text: "BELTVA’s name, branding, software, and content provided by us belong to us or our licensors. We give you a limited, personal, non-transferable right to use the Service under these Terms. You may not copy or redistribute our software or branding without permission." },
    ],
  },
  {
    title: "9. Links and other services",
    blocks: [
      { type: "p", text: "The Service may let you open links or share content through services operated by others. Those services have their own terms and privacy practices. BELTVA does not control their content or availability." },
    ],
  },
  {
    title: "10. Responsibility",
    blocks: [
      { type: "p", text: "The Service and user content are provided on an “as available” basis. To the extent permitted by applicable law, BELTVA is not responsible for inaccurate user content or interruptions beyond our reasonable control. Nothing in these Terms excludes or limits rights or remedies that cannot legally be excluded or limited." },
    ],
  },
  {
    title: "11. Changes to these Terms",
    blocks: [
      { type: "p", text: "We may update these Terms as the Service changes. We will show a new “Last updated” date and notify users of material changes through the Service or another appropriate channel. Where required by law, we will ask you to accept updated Terms before you continue using affected features." },
    ],
  },
  {
    title: "12. Contact",
    blocks: [
      { type: "p", text: "For questions about these Terms, contact BELTVA Support at beltva.support@gmail.com." },
    ],
  },
];

function Block({ block }) {
  switch (block.type) {
    case "h3":
      return <h3 className="text-[17px] font-semibold mt-6 mb-2">{block.text}</h3>;
    case "p":
      return <p className="text-[16px] leading-[1.6] mb-3 text-foreground/90">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-6 mb-3 space-y-1.5">
          {block.items.map((it, i) => (
            <li key={i} className="text-[16px] leading-[1.6] text-foreground/90">{it}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default function TermsPage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="relative flex items-center h-14 px-2">
            <button onClick={goBack} className="p-2 -ml-1 rounded-full hover:bg-secondary/60 transition" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">Terms of Service</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <h2 className="text-2xl font-bold tracking-tight mb-3">BELTVA Terms of Service</h2>
        <p className="text-[16px] leading-[1.6] text-foreground/90">Effective date: {EFFECTIVE}</p>
        <p className="text-[16px] leading-[1.6] text-foreground/90 mb-5">Last updated: {UPDATED}</p>

        {INTRO.map((b, i) => <Block key={i} block={b} />)}

        {SECTIONS.map((s, si) => (
          <section key={si}>
            <h2 className="text-xl font-bold tracking-tight mt-8 mb-3">{s.title}</h2>
            {s.blocks.map((b, bi) => <Block key={bi} block={b} />)}
          </section>
        ))}
      </main>
    </div>
  );
}