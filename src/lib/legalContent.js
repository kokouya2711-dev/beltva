// 利用規約・プライバシーポリシーの共通コンテンツ
// TermsPage / PrivacyPolicyPage / LegalSheet で共有

export const TERMS = {
  title: "BELTVA Terms of Service",
  effective: "[DATE OF PUBLICATION]",
  updated: "[DATE OF PUBLICATION]",
  intro: [
    { type: "p", text: "These Terms of Service (“Terms”) govern your use of the BELTVA app and related services (the “Service”). The Service is operated by [LEGAL NAME OF OPERATOR] (“BELTVA,” “we,” or “us”). By creating an account or using the Service, you agree to these Terms. Please also read our Privacy Policy." },
  ],
  sections: [
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
  ],
};

export const PRIVACY = {
  title: "BELTVA Privacy Policy",
  effective: "September 14, 2026",
  updated: "September 14, 2026",
  intro: [
    { type: "p", text: "This Privacy Policy explains how BELTVA collects, uses, shares, and protects your information when you use the BELTVA application and related services (the “Service”)." },
  ],
  sections: [
    {
      title: "1. Information We Collect",
      blocks: [
        { type: "h3", text: "Account Information" },
        { type: "p", text: "When you create or use an account, we may collect:" },
        { type: "ul", items: [
          "Email address",
          "Login and authentication information",
          "Name",
          "User ID",
          "Date of birth",
          "Gender",
          "Profile country or region",
          "Display language",
        ]},
        { type: "p", text: "Your profile country or region is selected by you for your profile. BELTVA does not use it to verify your nationality, birthplace, or current location." },
        { type: "h3", text: "Profile and Social Activity" },
        { type: "p", text: "Depending on how you use the Service, we may collect:" },
        { type: "ul", items: [
          "Profile photo",
          "Bio",
          "Posts and uploaded images",
          "Comments and replies",
          "Likes",
          "Following and follower information",
          "Chat messages",
          "Online status",
          "Privacy and notification settings",
        ]},
        { type: "h3", text: "Training Records" },
        { type: "p", text: "We may collect the following information when you use the training record feature:" },
        { type: "ul", items: [
          "Dates on which you trained",
          "Muscle groups you trained",
          "Duration of cardio activity",
        ]},
        { type: "p", text: "Training records are private and are not shown to other users." },
        { type: "h3", text: "Safety and Support Information" },
        { type: "p", text: "We may collect information you provide when you:" },
        { type: "ul", items: [
          "Report a user, post, comment, or message",
          "Block or mute another user",
          "Contact BELTVA for a request, problem report, or help",
        ]},
        { type: "h3", text: "Technical Information" },
        { type: "p", text: "When you use the Service, BELTVA and its service providers may automatically process technical information such as:" },
        { type: "ul", items: [
          "IP address",
          "Device and browser type",
          "Operating system",
          "Access times",
          "App activity and diagnostic logs",
          "Error and crash information",
          "Notification identifiers, if notifications are enabled",
          "Cookies or similar technologies required to operate the Service",
        ]},
        { type: "p", text: "BELTVA does not collect your precise location or contacts." },
        { type: "p", text: "BELTVA accesses your camera or selected photos only when you choose to take or upload an image. BELTVA does not currently support video or microphone access." },
      ],
    },
    {
      title: "2. How We Use Information",
      blocks: [
        { type: "p", text: "We may use information to:" },
        { type: "ul", items: [
          "Create, authenticate, and manage accounts",
          "Provide profiles, posts, comments, likes, follows, and chat",
          "Save and display private training records to the account owner",
          "Apply age-group separation and privacy settings",
          "Send notifications selected by the user",
          "Respond to requests, problem reports, and help inquiries",
          "Review reports and enforce our Terms",
          "Prevent spam, fraud, abuse, and unauthorized access",
          "Maintain, troubleshoot, secure, and improve the Service",
          "Comply with legal obligations and valid legal requests",
        ]},
        { type: "p", text: "Where required by applicable law, we rely on consent, performance of our agreement with you, legitimate interests in operating and protecting the Service, or compliance with legal obligations." },
      ],
    },
    {
      title: "3. Information Visible to Other Users",
      blocks: [
        { type: "p", text: "Your name, User ID, profile photo, profile country or region, bio, gender, posts, and related activity may be visible to users in the same age group." },
        { type: "p", text: "Your age and online status are visible only when you enable the relevant privacy settings." },
        { type: "p", text: "Your following and follower counts may be visible to users in the same age group. The identities shown in your following and follower lists are visible only to you." },
        { type: "p", text: "The following information is not displayed to other users:" },
        { type: "ul", items: [
          "Email address",
          "Full date of birth",
          "Training records",
          "Reports you submit",
          "Users you block or mute",
          "Support requests",
        ]},
        { type: "p", text: "Chat messages are visible to the participants in the conversation. BELTVA may access relevant messages when they are reported or when reasonably necessary to investigate abuse, protect users, enforce our Terms, or comply with law." },
      ],
    },
    {
      title: "4. Age Groups and Younger Users",
      blocks: [
        { type: "p", text: "BELTVA is intended for users aged 13 or older." },
        { type: "p", text: "BELTVA separates users into two age groups:" },
        { type: "ul", items: [
          "Users aged 13 through 17",
          "Users aged 18 or older",
        ]},
        { type: "p", text: "Users in different age groups are not displayed to one another through profiles, search results, posts, follows, chats, or other social features." },
        { type: "p", text: "Date of birth is used to determine the appropriate age group and is not displayed in full to other users. Providing a false date of birth may result in account restriction or removal." },
        { type: "p", text: "When a user turns 18, the account automatically moves to the adult age group. Existing follow relationships and chat conversations with users under 18 will no longer be visible to either side." },
        { type: "p", text: "If the law where you live requires permission from a parent or guardian to use an online service, you may use BELTVA only with that permission." },
        { type: "p", text: "If we reasonably believe that an account belongs to a user under 13, we may suspend or delete the account." },
      ],
    },
    {
      title: "5. Service Providers and Sharing",
      blocks: [
        { type: "p", text: "BELTVA uses third-party service providers to operate the Service. These providers may process information only as necessary to provide their services or as otherwise permitted by law." },
        { type: "p", text: "Current providers may include:" },
        { type: "ul", items: [
          "Base44, for application hosting, databases, authentication, and technical infrastructure",
          "Google services, for receiving and managing support email",
        ]},
        { type: "p", text: "Information may be processed in countries other than the country where you live. Where required, appropriate safeguards will be used for international data transfers." },
        { type: "p", text: "BELTVA may also disclose information:" },
        { type: "ul", items: [
          "When required by law, court order, or a valid request from a public authority",
          "To investigate fraud, abuse, security incidents, or violations of our Terms",
          "To protect the safety, rights, and property of users, BELTVA, or others",
          "In connection with a merger, acquisition, financing, reorganization, or transfer of the Service, subject to appropriate safeguards",
        ]},
        { type: "p", text: "BELTVA does not sell personal information and does not use personal information for targeted advertising." },
      ],
    },
    {
      title: "6. Data Retention and Account Deletion",
      blocks: [
        { type: "p", text: "We retain information only for as long as reasonably necessary to provide the Service, protect users, resolve disputes, enforce our agreements, and comply with legal obligations." },
        { type: "p", text: "When you request account deletion:" },
        { type: "ul", items: [
          "Your account and profile will become unavailable",
          "You will be signed out on all devices",
          "You may restore the account within 30 days",
          "After 30 days, the account cannot be restored",
          "Account information and content will then be deleted or anonymized, except where limited retention is necessary for legal, security, fraud-prevention, dispute-resolution, or enforcement purposes",
        ]},
        { type: "p", text: "Messages you sent before deleting your account may remain in the recipient’s conversation. Your identity will be replaced with a label such as “Deleted User.”" },
        { type: "p", text: "Reports, moderation records, and related evidence may be retained when necessary to investigate misconduct, protect users, or comply with law." },
      ],
    },
    {
      title: "7. Security and Safety",
      blocks: [
        { type: "p", text: "BELTVA uses reasonable technical and organizational measures intended to protect information from unauthorized access, loss, misuse, or alteration. No online service can guarantee complete security." },
        { type: "p", text: "The identity of a person who submits a report is not disclosed to the reported user." },
        { type: "p", text: "Blocking and muting choices are private. BELTVA may preserve relevant posts, comments, messages, or account records when reasonably necessary for a safety or moderation investigation." },
      ],
    },
    {
      title: "8. Your Choices and Rights",
      blocks: [
        { type: "p", text: "Depending on the Service features available to you, you may:" },
        { type: "ul", items: [
          "Review or update certain account and profile information",
          "Control age and online-status visibility",
          "Control notification preferences",
          "Delete posts or other content you created",
          "Block or mute users",
          "Request account deletion",
          "Withdraw camera, photo, or notification permissions through your device settings",
        ]},
        { type: "p", text: "If your date of birth is incorrect and cannot be changed in the app, contact BELTVA Support. We may request reasonable information to confirm the correction and protect the account." },
        { type: "p", text: "Depending on the law where you live, you may also have the right to:" },
        { type: "ul", items: [
          "Request access to your personal information",
          "Correct inaccurate information",
          "Request deletion of information",
          "Restrict or object to certain processing",
          "Withdraw consent where processing is based on consent",
          "Request a portable copy of eligible information",
          "Submit a complaint to the relevant data-protection authority",
        ]},
        { type: "p", text: "To exercise these rights, contact us using the address below. We may need to verify that the request relates to your account." },
      ],
    },
    {
      title: "9. Changes to This Policy",
      blocks: [
        { type: "p", text: "We may update this Privacy Policy when the Service, our practices, or applicable requirements change." },
        { type: "p", text: "The updated version will show a new “Last updated” date. If a change materially affects how we use personal information, we may also provide notice within the Service." },
      ],
    },
    {
      title: "10. Contact",
      blocks: [
        { type: "p", text: "For privacy questions or requests, contact:" },
        { type: "p", text: "BELTVA Support" },
        { type: "p", text: "Email: beltva.support@gmail.com" },
      ],
    },
  ],
};