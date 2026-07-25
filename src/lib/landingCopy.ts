import type { Lang } from "./i18n";

/**
 * Copy for the public landing page, kept out of i18n.ts so the app dictionary
 * stays focused on in-product strings. Same Lang union, same RTL rules.
 *
 * `heroTitle` carries an `{accent}` placeholder rather than being split into
 * two halves: the highlighted word lands in a different position in Hindi,
 * Urdu, Punjabi and Telugu than it does in English.
 */
export interface LandingCopy {
  navFeatures: string;
  navHow: string;
  navWhatsapp: string;
  navSignIn: string;

  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSub: string;
  heroCta1: string;
  heroCta2: string;
  heroNote: string;

  mToday: string;
  mCars: string;
  mDone: string;
  mInProgress: string;
  mLeft: string;
  mCalendar: string;
  mClients: string;
  mPayments: string;
  mPending: string;
  mPaid: string;
  mOverdue: string;
  mActive: string;
  mPaused: string;
  mDue: string;
  mMarkPaid: string;
  mOverview: string;
  mCommunities: string;
  mVillas: string;
  mEmployees: string;
  mJobsToday: string;
  mThisWeek: string;
  mRevenueMonth: string;
  mByCommunity: string;
  mByCleaner: string;

  adminEyebrow: string;
  adminTitle: string;
  adminSub: string;
  a1Title: string;
  a1Body: string;
  a2Title: string;
  a2Body: string;
  a3Title: string;
  a3Body: string;
  a4Title: string;
  a4Body: string;

  waEyebrow: string;
  waTitle: string;
  waSub: string;
  wa1Title: string;
  wa1Body: string;
  wa2Title: string;
  wa2Body: string;
  wa3Title: string;
  wa3Body: string;
  wa4Title: string;
  wa4Body: string;
  wa5Title: string;
  wa5Body: string;
  waNote: string;
  waChatMsg1: string;
  waChatMsg2: string;
  waChatMsg3: string;

  screensEyebrow: string;
  screensTitle: string;
  screensSub: string;
  scCalTitle: string;
  scCalBody: string;
  scClientsTitle: string;
  scClientsBody: string;
  scPayTitle: string;
  scPayBody: string;

  featEyebrow: string;
  featTitle: string;
  featSub: string;
  f1Title: string;
  f1Body: string;
  f2Title: string;
  f2Body: string;
  f3Title: string;
  f3Body: string;
  f4Title: string;
  f4Body: string;
  f5Title: string;
  f5Body: string;
  f6Title: string;
  f6Body: string;

  strip1Title: string;
  strip1Body: string;
  strip2Title: string;
  strip2Body: string;

  howEyebrow: string;
  howTitle: string;
  howSub: string;
  s1Title: string;
  s1Body: string;
  s2Title: string;
  s2Body: string;
  s3Title: string;
  s3Body: string;
  s4Title: string;
  s4Body: string;

  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
  /** Pre-filled body of the wa.me message the CTA opens. */
  ctaWaMessage: string;
  footerTagline: string;
  footerPlace: string;
}

const en: LandingCopy = {
  navFeatures: "Features",
  navHow: "How it works",
  navWhatsapp: "WhatsApp",
  navSignIn: "Sign in",

  heroBadge: "Built for car wash companies in the UAE",
  heroTitle: "Run every wash without the {accent}.",
  heroAccent: "spreadsheet",
  heroSub:
    "Carwaj puts today's round in your cleaners' pockets, keeps your clients updated on WhatsApp, and shows the office what every villa is worth.",
  heroCta1: "Book a demo",
  heroCta2: "Sign in",
  heroNote: "No card needed · Set up in an afternoon",

  mToday: "Today",
  mCars: "6 cars",
  mDone: "2 done",
  mInProgress: "1 in progress",
  mLeft: "3 left",
  mCalendar: "Calendar",
  mClients: "Clients",
  mPayments: "Payments",
  mPending: "Pending",
  mPaid: "Paid",
  mOverdue: "3 days overdue",
  mActive: "Active",
  mPaused: "Paused",
  mDue: "Due 1 Aug",
  mMarkPaid: "Mark paid",

  waEyebrow: "WhatsApp, built in",
  waTitle: "Your clients never download anything",
  waSub:
    "Every update reaches the owner where they already are. Five messages go out on their own, from your company's WhatsApp Business number.",
  wa1Title: "The welcome link",
  wa1Body:
    "A new client gets a link, fills in their own villa, cars and wash days — and their schedule builds itself. You type nothing.",
  wa2Title: "Car cleaned",
  wa2Body:
    "The moment a cleaner marks a wash done, the owner knows. No more “was my car done today?” phone calls.",
  wa3Title: "Payment due",
  wa3Body: "A polite reminder before the due date, with the amount and the day it falls.",
  wa4Title: "Gentle chase",
  wa4Body:
    "If it slips past, the follow-up goes out by itself with the days outstanding. Nobody has to be the bad guy.",
  wa5Title: "Paid, confirmed",
  wa5Body: "Mark it cash or transfer and the receipt lands on the client's phone instantly.",
  waNote:
    "Sent through the official WhatsApp Business platform on approved message templates — so your number stays trusted and every message actually lands.",
  waChatMsg1: "Hi Ahmed 👋 Your Land Cruiser has just been cleaned. Photos are in the app.",
  waChatMsg2: "Your monthly payment of AED 450 is due in 3 days (1 Aug).",
  waChatMsg3: "Payment of AED 450 received by transfer. Thank you! 🙏",

  screensEyebrow: "The app",
  screensTitle: "Four screens, nothing to learn",
  screensSub: "The whole day fits under a cleaner's thumb. The whole month fits on one page.",
  scCalTitle: "Calendar",
  scCalBody: "Every day dotted by status. Tap one to see the full round, grouped by community.",
  scClientsTitle: "Clients",
  scClientsBody: "Villas, owners, cars and schedules — active, paused and former kept apart.",
  scPayTitle: "Payments",
  scPayBody: "Pending and paid, overdue days counted, cash or transfer in a single tap.",

  featEyebrow: "Features",
  featTitle: "Everything the operation needs",
  featSub: "One app for the cleaner in the field and the manager in the office.",
  f1Title: "Today's round, ready",
  f1Body:
    "Cleaners open the app to today's list — grouped by community, with the villa, the car and the service already on it.",
  f2Title: "Photos on every wash",
  f2Body:
    "Before and after, taken on the phone, compressed and uploaded in seconds. Arguments end before they start.",
  f3Title: "Schedules that repeat themselves",
  f3Body:
    "Set a subscription once — twice a week, every Tuesday, whatever they signed for — and the bookings generate ahead of time.",
  f4Title: "Money you can see",
  f4Body:
    "The monthly amount per villa, what has been collected, what is overdue and by how many days.",
  f5Title: "The office view",
  f5Body:
    "Jobs today, jobs this week by community, and monthly revenue split by community and by cleaner.",
  f6Title: "Every cleaner, their own patch",
  f6Body:
    "Assign communities to each cleaner and they see only their villas, their round and their payments.",

  strip1Title: "Six languages, right-to-left included",
  strip1Body:
    "English, हिन्दी, বাংলা, اردو, پنجابی and తెలుగు — your team uses the app in the language they think in.",
  strip2Title: "Installs on any phone",
  strip2Body: "Add to home screen on Android or iPhone. No app store, no downloads, no IT department.",

  howEyebrow: "How it works",
  howTitle: "Live by the end of the week",
  howSub: "Four steps — and most of the typing isn't yours.",
  s1Title: "Map your patch",
  s1Body: "Add the communities you cover and assign each cleaner to theirs. Ten minutes, once.",
  s2Title: "Invite the client",
  s2Body:
    "Send the WhatsApp link. The owner fills in their villa, their cars and the days they want washed.",
  s3Title: "Let it schedule",
  s3Body:
    "Bookings generate from each subscription and land on the right cleaner's day, week after week.",
  s4Title: "Wash, notify, collect",
  s4Body:
    "Photos go up, the owner gets a WhatsApp, the payment gets marked — and the dashboard totals it all up.",

  ctaTitle: "See it on your own routes",
  ctaSub:
    "Tell us the communities you cover and we'll set up a demo company with your villas, so you can try it with real names and real rounds.",
  mOverview: "Overview",
  mCommunities: "Communities",
  mVillas: "Villas",
  mEmployees: "Employees",
  mJobsToday: "Jobs today",
  mThisWeek: "This week",
  mRevenueMonth: "Revenue this month",
  mByCommunity: "By community",
  mByCleaner: "By cleaner",

  adminEyebrow: "For the office",
  adminTitle: "The owner sees the whole company",
  adminSub:
    "Cleaners get a phone. Admins get a desktop dashboard — every community, every villa, every cleaner and every dirham, without ringing anyone to ask how the day went.",
  a1Title: "Communities",
  a1Body:
    "Add the compounds you cover and assign cleaners to them. That one assignment decides who sees which villas — nothing else to configure.",
  a2Title: "Villas and clients",
  a2Body:
    "Every villa in the company with its owner, cars and subscription — across all communities at once, not one round at a time.",
  a3Title: "Cleaners",
  a3Body:
    "Add a cleaner and they get a login on their own phone. Whatever they wash is attributed to them automatically.",
  a4Title: "Payments and revenue",
  a4Body:
    "Every payment in the company — collected, pending, overdue — with monthly revenue split by community and by cleaner.",

  ctaBtn: "Message us on WhatsApp",
  ctaWaMessage: "Hi Carwaj — I run a car wash company and I'd like to see a demo.",
  footerTagline: "Car care, organised.",
  footerPlace: "Dubai, UAE",
};

const hi: LandingCopy = {
  navFeatures: "फ़ीचर्स",
  navHow: "यह कैसे काम करता है",
  navWhatsapp: "व्हाट्सऐप",
  navSignIn: "साइन इन",

  heroBadge: "यूएई की कार वॉश कंपनियों के लिए बना",
  heroTitle: "हर वॉश संभालिए, बिना {accent} के।",
  heroAccent: "स्प्रेडशीट",
  heroSub:
    "Carwaj आज का पूरा राउंड आपके क्लीनर की जेब में रखता है, ग्राहकों को व्हाट्सऐप पर अपडेट रखता है, और ऑफ़िस को दिखाता है कि हर विला से कितनी कमाई है।",
  heroCta1: "डेमो बुक करें",
  heroCta2: "साइन इन",
  heroNote: "कार्ड की ज़रूरत नहीं · एक दोपहर में सेटअप",

  mToday: "आज",
  mCars: "6 गाड़ियाँ",
  mDone: "2 पूरी",
  mInProgress: "1 चल रही",
  mLeft: "3 बाक़ी",
  mCalendar: "कैलेंडर",
  mClients: "ग्राहक",
  mPayments: "भुगतान",
  mPending: "बाक़ी",
  mPaid: "भुगतान हुआ",
  mOverdue: "3 दिन की देरी",
  mActive: "सक्रिय",
  mPaused: "रुका हुआ",
  mDue: "1 अगस्त तक",
  mMarkPaid: "भुगतान दर्ज करें",

  waEyebrow: "व्हाट्सऐप, अंदर ही",
  waTitle: "आपके ग्राहक को कुछ भी डाउनलोड नहीं करना पड़ता",
  waSub:
    "हर अपडेट मालिक तक वहीं पहुँचता है जहाँ वे पहले से हैं। पाँच मैसेज अपने आप जाते हैं, आपकी कंपनी के व्हाट्सऐप बिज़नेस नंबर से।",
  wa1Title: "स्वागत लिंक",
  wa1Body:
    "नए ग्राहक को एक लिंक मिलता है, वे अपना विला, गाड़ियाँ और धुलाई के दिन खुद भरते हैं — और शेड्यूल अपने आप बन जाता है। आपको कुछ टाइप नहीं करना।",
  wa2Title: "गाड़ी साफ़ हो गई",
  wa2Body:
    "जैसे ही क्लीनर वॉश पूरा दर्ज करता है, मालिक को पता चल जाता है। “आज मेरी गाड़ी हुई या नहीं?” वाले फ़ोन बंद।",
  wa3Title: "भुगतान की याद",
  wa3Body: "तारीख़ से पहले एक शालीन रिमाइंडर — रकम और तारीख़ के साथ।",
  wa4Title: "नरम तक़ाज़ा",
  wa4Body:
    "तारीख़ निकल जाए तो फ़ॉलो-अप अपने आप चला जाता है, कितने दिन बाक़ी हैं इसके साथ। किसी को सख़्त बनने की ज़रूरत नहीं।",
  wa5Title: "भुगतान की पुष्टि",
  wa5Body: "कैश या ट्रांसफ़र दर्ज कीजिए और रसीद तुरंत ग्राहक के फ़ोन पर पहुँच जाती है।",
  waNote:
    "आधिकारिक व्हाट्सऐप बिज़नेस प्लेटफ़ॉर्म और मंज़ूरशुदा टेम्पलेट से भेजा जाता है — ताकि आपका नंबर भरोसेमंद रहे और हर मैसेज सचमुच पहुँचे।",
  waChatMsg1: "नमस्ते अहमद 👋 आपकी लैंड क्रूज़र अभी साफ़ हुई है। फ़ोटो ऐप में हैं।",
  waChatMsg2: "आपका मासिक भुगतान AED 450 3 दिन में देय है (1 अगस्त)।",
  waChatMsg3: "AED 450 का भुगतान ट्रांसफ़र से मिल गया। धन्यवाद! 🙏",

  screensEyebrow: "ऐप",
  screensTitle: "चार स्क्रीन, सीखने को कुछ नहीं",
  screensSub: "पूरा दिन क्लीनर के अंगूठे के नीचे। पूरा महीना एक पेज पर।",
  scCalTitle: "कैलेंडर",
  scCalBody:
    "हर दिन पर स्थिति का रंगीन निशान। किसी दिन पर टैप कीजिए और पूरा राउंड कम्युनिटी के हिसाब से दिखता है।",
  scClientsTitle: "ग्राहक",
  scClientsBody: "विला, मालिक, गाड़ियाँ और शेड्यूल — सक्रिय, रुके हुए और पुराने अलग-अलग।",
  scPayTitle: "भुगतान",
  scPayBody: "बाक़ी और चुकाए हुए, देरी के दिन गिने हुए, कैश या ट्रांसफ़र एक टैप में।",

  featEyebrow: "फ़ीचर्स",
  featTitle: "काम के लिए जो चाहिए, सब",
  featSub: "एक ही ऐप — मैदान में क्लीनर के लिए और ऑफ़िस में मैनेजर के लिए।",
  f1Title: "आज का राउंड, तैयार",
  f1Body:
    "क्लीनर ऐप खोलते ही आज की लिस्ट देखता है — कम्युनिटी के हिसाब से, विला, गाड़ी और सर्विस पहले से भरी हुई।",
  f2Title: "हर वॉश की फ़ोटो",
  f2Body:
    "पहले और बाद की फ़ोटो, फ़ोन से ही, सेकंडों में कंप्रेस होकर अपलोड। बहस शुरू होने से पहले ख़त्म।",
  f3Title: "शेड्यूल जो ख़ुद दोहराता है",
  f3Body:
    "सब्सक्रिप्शन एक बार सेट कीजिए — हफ़्ते में दो बार, हर मंगलवार, जो भी तय हो — बुकिंग पहले से बन जाती है।",
  f4Title: "पैसा साफ़ दिखता है",
  f4Body: "हर विला की मासिक रकम, कितना आया, कितना बाक़ी है और कितने दिन की देरी है।",
  f5Title: "ऑफ़िस का नज़रिया",
  f5Body:
    "आज के काम, इस हफ़्ते के काम कम्युनिटी के हिसाब से, और महीने की कमाई कम्युनिटी और क्लीनर के हिसाब से।",
  f6Title: "हर क्लीनर, अपना इलाक़ा",
  f6Body:
    "हर क्लीनर को कम्युनिटी सौंपिए — उसे सिर्फ़ अपने विला, अपना राउंड और अपने भुगतान दिखते हैं।",

  strip1Title: "छह भाषाएँ, दाएँ-से-बाएँ समेत",
  strip1Body:
    "English, हिन्दी, বাংলা, اردو, پنجابی और తెలుగు — आपकी टीम उसी भाषा में ऐप चलाती है जिसमें वह सोचती है।",
  strip2Title: "किसी भी फ़ोन पर इंस्टॉल",
  strip2Body: "एंड्रॉइड या आईफ़ोन की होम स्क्रीन पर लगाइए। न ऐप स्टोर, न डाउनलोड, न आईटी विभाग।",

  howEyebrow: "यह कैसे काम करता है",
  howTitle: "हफ़्ते के आख़िर तक चालू",
  howSub: "चार क़दम — और ज़्यादातर टाइपिंग आपको नहीं करनी।",
  s1Title: "अपना इलाक़ा तय कीजिए",
  s1Body: "जिन कम्युनिटी में आप काम करते हैं उन्हें जोड़िए और हर क्लीनर को सौंपिए। दस मिनट, एक बार।",
  s2Title: "ग्राहक को बुलाइए",
  s2Body:
    "व्हाट्सऐप लिंक भेजिए। मालिक ख़ुद अपना विला, गाड़ियाँ और धुलाई के दिन भर देता है।",
  s3Title: "शेड्यूल अपने आप",
  s3Body:
    "हर सब्सक्रिप्शन से बुकिंग बनती है और सही क्लीनर के दिन में पहुँच जाती है, हर हफ़्ते।",
  s4Title: "धोइए, बताइए, वसूलिए",
  s4Body:
    "फ़ोटो चढ़ती है, मालिक को व्हाट्सऐप जाता है, भुगतान दर्ज होता है — और डैशबोर्ड सब जोड़ देता है।",

  ctaTitle: "अपने ही रूट पर देखिए",
  ctaSub:
    "बताइए आप किन कम्युनिटी में काम करते हैं, हम आपके विला के साथ एक डेमो कंपनी बना देंगे — असली नाम, असली राउंड।",
  mOverview: "ओवरव्यू",
  mCommunities: "कम्युनिटी",
  mVillas: "विला",
  mEmployees: "कर्मचारी",
  mJobsToday: "आज के काम",
  mThisWeek: "इस हफ़्ते",
  mRevenueMonth: "इस महीने की कमाई",
  mByCommunity: "कम्युनिटी के हिसाब से",
  mByCleaner: "क्लीनर के हिसाब से",

  adminEyebrow: "ऑफ़िस के लिए",
  adminTitle: "मालिक को पूरी कंपनी दिखती है",
  adminSub:
    "क्लीनर को फ़ोन मिलता है, एडमिन को डेस्कटॉप डैशबोर्ड — हर कम्युनिटी, हर विला, हर क्लीनर और हर दिरहम, बिना किसी को फ़ोन करके पूछे कि दिन कैसा रहा।",
  a1Title: "कम्युनिटी",
  a1Body:
    "जिन कंपाउंड में आप काम करते हैं उन्हें जोड़िए और क्लीनर सौंपिए। यही एक सेटिंग तय करती है कि किसे कौन से विला दिखेंगे — और कुछ सेट नहीं करना।",
  a2Title: "विला और ग्राहक",
  a2Body:
    "कंपनी का हर विला — मालिक, गाड़ियाँ और सब्सक्रिप्शन के साथ — सारी कम्युनिटी एक साथ, एक-एक राउंड करके नहीं।",
  a3Title: "क्लीनर",
  a3Body:
    "क्लीनर जोड़िए, उसे अपने फ़ोन पर लॉगिन मिल जाता है। जो भी वह धोता है, अपने आप उसके खाते में जुड़ता है।",
  a4Title: "भुगतान और कमाई",
  a4Body:
    "कंपनी का हर भुगतान — वसूला हुआ, बाक़ी, देरी वाला — और महीने की कमाई कम्युनिटी तथा क्लीनर के हिसाब से बँटी हुई।",

  ctaBtn: "व्हाट्सऐप पर संदेश भेजें",
  ctaWaMessage: "नमस्ते Carwaj — मैं एक कार वॉश कंपनी चलाता/चलाती हूँ और डेमो देखना चाहता/चाहती हूँ।",
  footerTagline: "कार की देखभाल, व्यवस्थित।",
  footerPlace: "दुबई, यूएई",
};

const bn: LandingCopy = {
  navFeatures: "ফিচার",
  navHow: "কীভাবে কাজ করে",
  navWhatsapp: "হোয়াটসঅ্যাপ",
  navSignIn: "সাইন ইন",

  heroBadge: "সংযুক্ত আরব আমিরাতের কার ওয়াশ কোম্পানির জন্য তৈরি",
  heroTitle: "প্রতিটি ওয়াশ চালান, {accent} ছাড়াই।",
  heroAccent: "স্প্রেডশিট",
  heroSub:
    "Carwaj আজকের পুরো রাউন্ড আপনার ক্লিনারের পকেটে রাখে, গ্রাহককে হোয়াটসঅ্যাপে আপডেট রাখে, আর অফিসকে দেখায় প্রতিটি ভিলা থেকে কত আয়।",
  heroCta1: "ডেমো বুক করুন",
  heroCta2: "সাইন ইন",
  heroNote: "কার্ড লাগবে না · এক বিকেলেই সেটআপ",

  mToday: "আজ",
  mCars: "৬টি গাড়ি",
  mDone: "২টি শেষ",
  mInProgress: "১টি চলছে",
  mLeft: "৩টি বাকি",
  mCalendar: "ক্যালেন্ডার",
  mClients: "গ্রাহক",
  mPayments: "পেমেন্ট",
  mPending: "বাকি",
  mPaid: "পরিশোধিত",
  mOverdue: "৩ দিন দেরি",
  mActive: "সক্রিয়",
  mPaused: "স্থগিত",
  mDue: "১ আগস্টের মধ্যে",
  mMarkPaid: "পেমেন্ট দিন",

  waEyebrow: "হোয়াটসঅ্যাপ, ভেতরেই",
  waTitle: "আপনার গ্রাহককে কিছুই ডাউনলোড করতে হয় না",
  waSub:
    "প্রতিটি আপডেট মালিকের কাছে সেখানেই পৌঁছায় যেখানে তিনি এমনিতেই আছেন। পাঁচটি বার্তা নিজে থেকেই যায়, আপনার কোম্পানির হোয়াটসঅ্যাপ বিজনেস নম্বর থেকে।",
  wa1Title: "স্বাগত লিঙ্ক",
  wa1Body:
    "নতুন গ্রাহক একটি লিঙ্ক পান, নিজের ভিলা, গাড়ি আর ধোয়ার দিন নিজেই লেখেন — সূচি নিজে থেকেই তৈরি হয়। আপনাকে কিছু টাইপ করতে হয় না।",
  wa2Title: "গাড়ি পরিষ্কার",
  wa2Body:
    "ক্লিনার ওয়াশ শেষ চিহ্নিত করার সঙ্গে সঙ্গে মালিক জেনে যান। “আজ আমার গাড়ি হয়েছে কি?” — এই ফোন আর নয়।",
  wa3Title: "পেমেন্টের তারিখ",
  wa3Body: "নির্ধারিত দিনের আগে একটি ভদ্র মনে করিয়ে দেওয়া — টাকার অঙ্ক আর তারিখসহ।",
  wa4Title: "নরম তাগাদা",
  wa4Body:
    "তারিখ পেরিয়ে গেলে ফলো-আপ নিজেই চলে যায়, কত দিন বাকি তা জানিয়ে। কাউকে কড়া হতে হয় না।",
  wa5Title: "পেমেন্ট নিশ্চিত",
  wa5Body: "নগদ বা ট্রান্সফার চিহ্নিত করুন, রসিদ সঙ্গে সঙ্গে গ্রাহকের ফোনে পৌঁছে যায়।",
  waNote:
    "অফিসিয়াল হোয়াটসঅ্যাপ বিজনেস প্ল্যাটফর্ম আর অনুমোদিত টেমপ্লেট দিয়ে পাঠানো — যাতে আপনার নম্বর নির্ভরযোগ্য থাকে আর প্রতিটি বার্তা সত্যিই পৌঁছায়।",
  waChatMsg1: "হ্যালো আহমেদ 👋 আপনার ল্যান্ড ক্রুজার এইমাত্র পরিষ্কার হয়েছে। ছবি অ্যাপে আছে।",
  waChatMsg2: "আপনার মাসিক পেমেন্ট AED 450 ৩ দিনের মধ্যে দিতে হবে (১ আগস্ট)।",
  waChatMsg3: "AED 450 ট্রান্সফারে পাওয়া গেছে। ধন্যবাদ! 🙏",

  screensEyebrow: "অ্যাপ",
  screensTitle: "চারটি স্ক্রিন, শেখার কিছু নেই",
  screensSub: "গোটা দিন ক্লিনারের বুড়ো আঙুলের নিচে। গোটা মাস এক পাতায়।",
  scCalTitle: "ক্যালেন্ডার",
  scCalBody:
    "প্রতিটি দিনে অবস্থার রঙিন বিন্দু। একটি দিনে ট্যাপ করলেই পুরো রাউন্ড, কমিউনিটি অনুযায়ী সাজানো।",
  scClientsTitle: "গ্রাহক",
  scClientsBody: "ভিলা, মালিক, গাড়ি আর সূচি — সক্রিয়, স্থগিত আর পুরোনো আলাদা রাখা।",
  scPayTitle: "পেমেন্ট",
  scPayBody: "বাকি আর পরিশোধিত, দেরির দিন গোনা, নগদ বা ট্রান্সফার এক ট্যাপে।",

  featEyebrow: "ফিচার",
  featTitle: "কাজ চালাতে যা যা লাগে",
  featSub: "একটাই অ্যাপ — মাঠের ক্লিনার আর অফিসের ম্যানেজার, দুজনের জন্যই।",
  f1Title: "আজকের রাউন্ড, তৈরি",
  f1Body:
    "ক্লিনার অ্যাপ খুললেই আজকের তালিকা — কমিউনিটি অনুযায়ী, ভিলা, গাড়ি আর সার্ভিস আগে থেকেই বসানো।",
  f2Title: "প্রতিটি ওয়াশে ছবি",
  f2Body:
    "আগে আর পরে, ফোনেই তোলা, সেকেন্ডে কমপ্রেস হয়ে আপলোড। তর্ক শুরুর আগেই শেষ।",
  f3Title: "সূচি নিজেই পুনরাবৃত্তি করে",
  f3Body:
    "একবার সাবস্ক্রিপশন ঠিক করুন — সপ্তাহে দুবার, প্রতি মঙ্গলবার, যা-ই চুক্তি হোক — বুকিং আগেভাগেই তৈরি হয়ে যায়।",
  f4Title: "টাকা চোখের সামনে",
  f4Body: "প্রতিটি ভিলার মাসিক অঙ্ক, কত আদায় হয়েছে, কত বাকি আর কত দিনের দেরি।",
  f5Title: "অফিসের দৃশ্য",
  f5Body:
    "আজকের কাজ, এই সপ্তাহের কাজ কমিউনিটি অনুযায়ী, আর মাসিক আয় কমিউনিটি ও ক্লিনার অনুযায়ী ভাগ করা।",
  f6Title: "প্রতিটি ক্লিনারের নিজের এলাকা",
  f6Body:
    "প্রতিটি ক্লিনারকে কমিউনিটি দিন — তিনি শুধু নিজের ভিলা, নিজের রাউন্ড আর নিজের পেমেন্ট দেখেন।",

  strip1Title: "ছয়টি ভাষা, ডান-থেকে-বাম সহ",
  strip1Body:
    "English, हिन्दी, বাংলা, اردو, پنجابی আর తెలుగు — আপনার দল যে ভাষায় ভাবে, সেই ভাষাতেই অ্যাপ চালায়।",
  strip2Title: "যেকোনো ফোনে ইনস্টল",
  strip2Body: "অ্যান্ড্রয়েড বা আইফোনের হোম স্ক্রিনে যোগ করুন। অ্যাপ স্টোর নেই, ডাউনলোড নেই, আইটি বিভাগ নেই।",

  howEyebrow: "কীভাবে কাজ করে",
  howTitle: "সপ্তাহ শেষ হতেই চালু",
  howSub: "চারটি ধাপ — আর বেশির ভাগ টাইপিং আপনার নয়।",
  s1Title: "এলাকা ঠিক করুন",
  s1Body: "যে কমিউনিটিগুলোয় কাজ করেন সেগুলো যোগ করুন আর প্রতিটি ক্লিনারকে ভাগ করে দিন। দশ মিনিট, একবারই।",
  s2Title: "গ্রাহককে ডাকুন",
  s2Body:
    "হোয়াটসঅ্যাপ লিঙ্ক পাঠান। মালিক নিজেই তাঁর ভিলা, গাড়ি আর ধোয়ার দিন লিখে দেন।",
  s3Title: "সূচি আপনাআপনি",
  s3Body:
    "প্রতিটি সাবস্ক্রিপশন থেকে বুকিং তৈরি হয় আর সঠিক ক্লিনারের দিনে বসে যায়, সপ্তাহের পর সপ্তাহ।",
  s4Title: "ধোয়া, জানানো, আদায়",
  s4Body:
    "ছবি ওঠে, মালিক হোয়াটসঅ্যাপ পান, পেমেন্ট চিহ্নিত হয় — আর ড্যাশবোর্ড সব যোগ করে দেয়।",

  ctaTitle: "নিজের রুটেই দেখে নিন",
  ctaSub:
    "আপনি কোন কমিউনিটিতে কাজ করেন বলুন, আমরা আপনার ভিলা দিয়ে একটি ডেমো কোম্পানি বানিয়ে দেব — আসল নাম, আসল রাউন্ড।",
  mOverview: "ওভারভিউ",
  mCommunities: "কমিউনিটি",
  mVillas: "ভিলা",
  mEmployees: "কর্মী",
  mJobsToday: "আজকের কাজ",
  mThisWeek: "এই সপ্তাহে",
  mRevenueMonth: "এই মাসের আয়",
  mByCommunity: "কমিউনিটি অনুযায়ী",
  mByCleaner: "ক্লিনার অনুযায়ী",

  adminEyebrow: "অফিসের জন্য",
  adminTitle: "মালিক গোটা কোম্পানি দেখতে পান",
  adminSub:
    "ক্লিনার পান ফোন, অ্যাডমিন পান ডেস্কটপ ড্যাশবোর্ড — প্রতিটি কমিউনিটি, প্রতিটি ভিলা, প্রতিটি ক্লিনার আর প্রতিটি দিরহাম, দিন কেমন গেল জানতে কাউকে ফোন না করেই।",
  a1Title: "কমিউনিটি",
  a1Body:
    "যে কম্পাউন্ডগুলোয় কাজ করেন সেগুলো যোগ করে ক্লিনার ভাগ করে দিন। ওই একটি সেটিংই ঠিক করে কে কোন ভিলা দেখবে — আর কিছু সেট করার নেই।",
  a2Title: "ভিলা আর গ্রাহক",
  a2Body:
    "কোম্পানির প্রতিটি ভিলা — মালিক, গাড়ি আর সাবস্ক্রিপশনসহ — সব কমিউনিটি একসঙ্গে, একটি করে রাউন্ড ধরে নয়।",
  a3Title: "ক্লিনার",
  a3Body:
    "ক্লিনার যোগ করুন, তিনি নিজের ফোনে লগইন পেয়ে যান। তিনি যা ধোবেন, তা আপনাআপনি তাঁর নামে যুক্ত হয়।",
  a4Title: "পেমেন্ট আর আয়",
  a4Body:
    "কোম্পানির প্রতিটি পেমেন্ট — আদায় হওয়া, বাকি, দেরি হওয়া — আর মাসিক আয় কমিউনিটি ও ক্লিনার অনুযায়ী ভাগ করা।",

  ctaBtn: "হোয়াটসঅ্যাপে বার্তা পাঠান",
  ctaWaMessage: "হ্যালো Carwaj — আমি একটি কার ওয়াশ কোম্পানি চালাই, ডেমো দেখতে চাই।",
  footerTagline: "গাড়ির যত্ন, গোছানো।",
  footerPlace: "দুবাই, সংযুক্ত আরব আমিরাত",
};

const ur: LandingCopy = {
  navFeatures: "خصوصیات",
  navHow: "یہ کیسے کام کرتا ہے",
  navWhatsapp: "واٹس ایپ",
  navSignIn: "سائن اِن",

  heroBadge: "متحدہ عرب امارات کی کار واش کمپنیوں کے لیے بنایا گیا",
  heroTitle: "ہر واش سنبھالیں، بغیر {accent} کے۔",
  heroAccent: "اسپریڈ شیٹ",
  heroSub:
    "Carwaj آج کا پورا راؤنڈ آپ کے کلینر کی جیب میں رکھتا ہے، گاہکوں کو واٹس ایپ پر باخبر رکھتا ہے، اور دفتر کو دکھاتا ہے کہ ہر ولا سے کتنی آمدنی ہے۔",
  heroCta1: "ڈیمو بُک کریں",
  heroCta2: "سائن اِن",
  heroNote: "کارڈ کی ضرورت نہیں · ایک دوپہر میں سیٹ اپ",

  mToday: "آج",
  mCars: "6 گاڑیاں",
  mDone: "2 مکمل",
  mInProgress: "1 جاری",
  mLeft: "3 باقی",
  mCalendar: "کیلنڈر",
  mClients: "گاہک",
  mPayments: "ادائیگیاں",
  mPending: "باقی",
  mPaid: "ادا شدہ",
  mOverdue: "3 دن کی تاخیر",
  mActive: "فعال",
  mPaused: "روکا ہوا",
  mDue: "یکم اگست تک",
  mMarkPaid: "ادائیگی درج کریں",

  waEyebrow: "واٹس ایپ، اندر ہی شامل",
  waTitle: "آپ کے گاہک کو کچھ ڈاؤن لوڈ نہیں کرنا پڑتا",
  waSub:
    "ہر اپ ڈیٹ مالک تک وہیں پہنچتی ہے جہاں وہ پہلے سے موجود ہے۔ پانچ پیغامات خود بخود جاتے ہیں، آپ کی کمپنی کے واٹس ایپ بزنس نمبر سے۔",
  wa1Title: "خوش آمدید لنک",
  wa1Body:
    "نئے گاہک کو ایک لنک ملتا ہے، وہ اپنا ولا، گاڑیاں اور دھلائی کے دن خود بھرتا ہے — اور شیڈول خود بن جاتا ہے۔ آپ کو کچھ ٹائپ نہیں کرنا پڑتا۔",
  wa2Title: "گاڑی صاف ہو گئی",
  wa2Body:
    "جیسے ہی کلینر واش مکمل درج کرتا ہے، مالک کو خبر ہو جاتی ہے۔ “کیا آج میری گاڑی ہوئی؟” والے فون ختم۔",
  wa3Title: "ادائیگی کی یاد دہانی",
  wa3Body: "مقررہ تاریخ سے پہلے ایک مہذب یاد دہانی — رقم اور تاریخ کے ساتھ۔",
  wa4Title: "نرم تقاضا",
  wa4Body:
    "تاریخ گزر جائے تو فالو اپ خود چلا جاتا ہے، کتنے دن باقی ہیں اس کے ساتھ۔ کسی کو سخت بننے کی ضرورت نہیں۔",
  wa5Title: "ادائیگی کی تصدیق",
  wa5Body: "نقد یا ٹرانسفر درج کریں، رسید فوراً گاہک کے فون پر پہنچ جاتی ہے۔",
  waNote:
    "سرکاری واٹس ایپ بزنس پلیٹ فارم اور منظور شدہ ٹیمپلیٹس سے بھیجا جاتا ہے — تاکہ آپ کا نمبر قابلِ بھروسہ رہے اور ہر پیغام واقعی پہنچے۔",
  waChatMsg1: "السلام علیکم احمد 👋 آپ کی لینڈ کروزر ابھی صاف ہوئی ہے۔ تصاویر ایپ میں ہیں۔",
  waChatMsg2: "آپ کی ماہانہ ادائیگی AED 450 تین دن میں واجب ہے (یکم اگست)۔",
  waChatMsg3: "AED 450 کی ادائیگی ٹرانسفر کے ذریعے موصول ہوئی۔ شکریہ! 🙏",

  screensEyebrow: "ایپ",
  screensTitle: "چار اسکرینیں، سیکھنے کو کچھ نہیں",
  screensSub: "پورا دن کلینر کے انگوٹھے کے نیچے۔ پورا مہینہ ایک صفحے پر۔",
  scCalTitle: "کیلنڈر",
  scCalBody:
    "ہر دن پر حالت کا رنگین نشان۔ کسی دن پر ٹیپ کریں اور پورا راؤنڈ کمیونٹی کے حساب سے دیکھیں۔",
  scClientsTitle: "گاہک",
  scClientsBody: "ولا، مالکان، گاڑیاں اور شیڈول — فعال، روکے ہوئے اور پرانے الگ الگ۔",
  scPayTitle: "ادائیگیاں",
  scPayBody: "باقی اور ادا شدہ، تاخیر کے دن گنے ہوئے، نقد یا ٹرانسفر ایک ٹیپ میں۔",

  featEyebrow: "خصوصیات",
  featTitle: "کام کے لیے جو کچھ چاہیے، سب",
  featSub: "ایک ہی ایپ — میدان میں کلینر کے لیے اور دفتر میں مینیجر کے لیے۔",
  f1Title: "آج کا راؤنڈ، تیار",
  f1Body:
    "کلینر ایپ کھولتے ہی آج کی فہرست دیکھتا ہے — کمیونٹی کے حساب سے، ولا، گاڑی اور سروس پہلے سے درج۔",
  f2Title: "ہر واش کی تصویر",
  f2Body:
    "پہلے اور بعد کی تصویریں، فون سے ہی، سیکنڈوں میں کمپریس ہو کر اپ لوڈ۔ بحث شروع ہونے سے پہلے ختم۔",
  f3Title: "شیڈول جو خود دہراتا ہے",
  f3Body:
    "سبسکرپشن ایک بار طے کریں — ہفتے میں دو بار، ہر منگل، جو بھی طے ہو — بکنگ پہلے سے بن جاتی ہے۔",
  f4Title: "پیسہ صاف نظر آتا ہے",
  f4Body: "ہر ولا کی ماہانہ رقم، کتنا وصول ہوا، کتنا باقی ہے اور کتنے دن کی تاخیر ہے۔",
  f5Title: "دفتر کا نظارہ",
  f5Body:
    "آج کے کام، اس ہفتے کے کام کمیونٹی کے حساب سے، اور ماہانہ آمدنی کمیونٹی اور کلینر کے حساب سے۔",
  f6Title: "ہر کلینر، اپنا علاقہ",
  f6Body:
    "ہر کلینر کو کمیونٹی سونپیں — اسے صرف اپنے ولا، اپنا راؤنڈ اور اپنی ادائیگیاں نظر آتی ہیں۔",

  strip1Title: "چھ زبانیں، دائیں سے بائیں سمیت",
  strip1Body:
    "English، हिन्दी، বাংলা، اردو، پنجابی اور తెలుగు — آپ کی ٹیم اسی زبان میں ایپ چلاتی ہے جس میں وہ سوچتی ہے۔",
  strip2Title: "کسی بھی فون پر انسٹال",
  strip2Body: "اینڈرائیڈ یا آئی فون کی ہوم اسکرین پر لگائیں۔ نہ ایپ اسٹور، نہ ڈاؤن لوڈ، نہ آئی ٹی شعبہ۔",

  howEyebrow: "یہ کیسے کام کرتا ہے",
  howTitle: "ہفتے کے آخر تک چالو",
  howSub: "چار قدم — اور زیادہ تر ٹائپنگ آپ کو نہیں کرنی۔",
  s1Title: "اپنا علاقہ طے کریں",
  s1Body: "جن کمیونٹیز میں آپ کام کرتے ہیں انہیں شامل کریں اور ہر کلینر کو سونپ دیں۔ دس منٹ، ایک بار۔",
  s2Title: "گاہک کو بلائیں",
  s2Body:
    "واٹس ایپ لنک بھیجیں۔ مالک خود اپنا ولا، گاڑیاں اور دھلائی کے دن بھر دیتا ہے۔",
  s3Title: "شیڈول خود بخود",
  s3Body:
    "ہر سبسکرپشن سے بکنگ بنتی ہے اور صحیح کلینر کے دن میں پہنچ جاتی ہے، ہر ہفتے۔",
  s4Title: "دھوئیں، بتائیں، وصول کریں",
  s4Body:
    "تصویریں چڑھتی ہیں، مالک کو واٹس ایپ جاتا ہے، ادائیگی درج ہوتی ہے — اور ڈیش بورڈ سب جوڑ دیتا ہے۔",

  ctaTitle: "اپنے ہی روٹ پر دیکھیں",
  ctaSub:
    "بتائیں آپ کن کمیونٹیز میں کام کرتے ہیں، ہم آپ کے ولا کے ساتھ ایک ڈیمو کمپنی بنا دیں گے — اصلی نام، اصلی راؤنڈ۔",
  mOverview: "مجموعی جائزہ",
  mCommunities: "کمیونٹیز",
  mVillas: "ولے",
  mEmployees: "ملازمین",
  mJobsToday: "آج کے کام",
  mThisWeek: "اس ہفتے",
  mRevenueMonth: "اس مہینے کی آمدنی",
  mByCommunity: "کمیونٹی کے حساب سے",
  mByCleaner: "کلینر کے حساب سے",

  adminEyebrow: "دفتر کے لیے",
  adminTitle: "مالک کو پوری کمپنی نظر آتی ہے",
  adminSub:
    "کلینر کو فون ملتا ہے، ایڈمن کو ڈیسک ٹاپ ڈیش بورڈ — ہر کمیونٹی، ہر ولا، ہر کلینر اور ہر درہم، بغیر کسی کو فون کر کے پوچھے کہ دن کیسا رہا۔",
  a1Title: "کمیونٹیز",
  a1Body:
    "جن کمپاؤنڈز میں آپ کام کرتے ہیں انہیں شامل کریں اور کلینر سونپ دیں۔ یہی ایک سیٹنگ طے کرتی ہے کہ کس کو کون سے ولے نظر آئیں گے — اور کچھ سیٹ نہیں کرنا۔",
  a2Title: "ولے اور گاہک",
  a2Body:
    "کمپنی کا ہر ولا — مالک، گاڑیوں اور سبسکرپشن سمیت — تمام کمیونٹیز ایک ساتھ، ایک ایک راؤنڈ کر کے نہیں۔",
  a3Title: "کلینر",
  a3Body:
    "کلینر شامل کریں، اسے اپنے فون پر لاگ اِن مل جاتا ہے۔ جو کچھ وہ دھوتا ہے، خود بخود اس کے کھاتے میں جڑتا ہے۔",
  a4Title: "ادائیگیاں اور آمدنی",
  a4Body:
    "کمپنی کی ہر ادائیگی — وصول شدہ، باقی، تاخیر والی — اور ماہانہ آمدنی کمیونٹی اور کلینر کے حساب سے تقسیم شدہ۔",

  ctaBtn: "واٹس ایپ پر پیغام بھیجیں",
  ctaWaMessage: "السلام علیکم Carwaj — میں ایک کار واش کمپنی چلاتا ہوں اور ڈیمو دیکھنا چاہتا ہوں۔",
  footerTagline: "گاڑی کی دیکھ بھال، ترتیب سے۔",
  footerPlace: "دبئی، متحدہ عرب امارات",
};

const pa: LandingCopy = {
  navFeatures: "خوبیاں",
  navHow: "ایہہ کِویں کم کردا اے",
  navWhatsapp: "واٹس ایپ",
  navSignIn: "سائن اِن",

  heroBadge: "متحدہ عرب امارات دیاں کار واش کمپنیاں لئی بݨایا گیا",
  heroTitle: "ہر واش سنبھالو، بغیر {accent} توں۔",
  heroAccent: "اسپریڈ شیٹ",
  heroSub:
    "Carwaj اَج دا سارا راؤنڈ تہاڈے کلینر دی جیب وچ رکھدا اے، گاہکاں نوں واٹس ایپ تے خبر دیندا اے، تے دفتر نوں وکھاندا اے کہ ہر ولے توں کِنّی کمائی اے۔",
  heroCta1: "ڈیمو بُک کرو",
  heroCta2: "سائن اِن",
  heroNote: "کارڈ دی لوڑ نئیں · اِک دوپہر وچ سیٹ اپ",

  mToday: "اَج",
  mCars: "6 گڈیاں",
  mDone: "2 مکمل",
  mInProgress: "1 چل رہی",
  mLeft: "3 باقی",
  mCalendar: "کیلنڈر",
  mClients: "گاہک",
  mPayments: "ادائیگیاں",
  mPending: "باقی",
  mPaid: "ادا ہو گئی",
  mOverdue: "3 دن دی دیر",
  mActive: "چالو",
  mPaused: "روکیا ہویا",
  mDue: "پہلی اگست تک",
  mMarkPaid: "ادائیگی درج کرو",

  waEyebrow: "واٹس ایپ، اندر ای شامل",
  waTitle: "تہاڈے گاہک نوں کجھ وی ڈاؤن لوڈ نئیں کرنا پیندا",
  waSub:
    "ہر اپ ڈیٹ مالک تک اوتھے ای اپڑدی اے جِتھے اوہ پہلاں توں اے۔ پنج سنیہے آپے چلے جاندے نیں، تہاڈی کمپنی دے واٹس ایپ بزنس نمبر توں۔",
  wa1Title: "جی آیاں نوں لنک",
  wa1Body:
    "نویں گاہک نوں اِک لنک ملدا اے، اوہ اپݨا ولا، گڈیاں تے دھلائی دے دن آپ بھردا اے — تے شیڈول آپے بݨ جاندا اے۔ تہانوں کجھ ٹائپ نئیں کرنا پیندا۔",
  wa2Title: "گڈی صاف ہو گئی",
  wa2Body:
    "جِویں ای کلینر واش مکمل درج کردا اے، مالک نوں پتہ لگ جاندا اے۔ “اَج میری گڈی ہوئی کہ نئیں؟” والے فون مُک گئے۔",
  wa3Title: "ادائیگی دی یاد",
  wa3Body: "مقررہ تریخ توں پہلاں اِک نمّی جیہی یاد — رقم تے تریخ نال۔",
  wa4Title: "نرم تقاضا",
  wa4Body:
    "تریخ لنگھ جاوے تے فالو اپ آپے چلا جاندا اے، کِنّے دن رہ گئے نیں اوہدے نال۔ کسے نوں سخت بݨن دی لوڑ نئیں۔",
  wa5Title: "ادائیگی دی تصدیق",
  wa5Body: "نقد یا ٹرانسفر درج کرو، رسید اوسے ویلے گاہک دے فون تے اپڑ جاندی اے۔",
  waNote:
    "سرکاری واٹس ایپ بزنس پلیٹ فارم تے منظور شدہ ٹیمپلیٹس نال بھیجیا جاندا اے — تاں جو تہاڈا نمبر بھروسے والا رہوے تے ہر سنیہا سچ مُچ اپڑے۔",
  waChatMsg1: "السلام علیکم احمد 👋 تہاڈی لینڈ کروزر ہُݨے صاف ہوئی اے۔ تصویراں ایپ وچ نیں۔",
  waChatMsg2: "تہاڈی مہینے دی ادائیگی AED 450 تِن دن وچ دینی اے (پہلی اگست)۔",
  waChatMsg3: "AED 450 دی ادائیگی ٹرانسفر راہیں مل گئی۔ شکریہ! 🙏",

  screensEyebrow: "ایپ",
  screensTitle: "چار اسکریناں، سِکھݨ نوں کجھ نئیں",
  screensSub: "سارا دن کلینر دے انگوٹھے تھلے۔ سارا مہینہ اِک صفحے تے۔",
  scCalTitle: "کیلنڈر",
  scCalBody:
    "ہر دن تے حالت دا رنگین نشان۔ کسے دن تے ٹیپ کرو تے سارا راؤنڈ کمیونٹی دے حساب نال ویکھو۔",
  scClientsTitle: "گاہک",
  scClientsBody: "ولے، مالک، گڈیاں تے شیڈول — چالو، روکے ہوئے تے پرانے وکھو وکھ۔",
  scPayTitle: "ادائیگیاں",
  scPayBody: "باقی تے ادا ہوئیاں، دیر دے دن گِݨے ہوئے، نقد یا ٹرانسفر اِک ٹیپ وچ۔",

  featEyebrow: "خوبیاں",
  featTitle: "کم لئی جو کجھ چاہیدا، سب",
  featSub: "اِکو ای ایپ — میدان وچ کلینر لئی تے دفتر وچ مینیجر لئی۔",
  f1Title: "اَج دا راؤنڈ، تیار",
  f1Body:
    "کلینر ایپ کھولدے ای اَج دی لسٹ ویکھدا اے — کمیونٹی دے حساب نال، ولا، گڈی تے سروس پہلاں توں درج۔",
  f2Title: "ہر واش دی تصویر",
  f2Body:
    "پہلاں تے بعد دیاں تصویراں، فون توں ای، سکنٹاں وچ کمپریس ہو کے اپ لوڈ۔ بحث شروع ہوݨ توں پہلاں مُک جاندی اے۔",
  f3Title: "شیڈول جیہڑا آپے دہراندا اے",
  f3Body:
    "سبسکرپشن اِک وار سیٹ کرو — ہفتے وچ دو وار، ہر منگل، جو وی طے ہووے — بکنگ پہلاں توں بݨ جاندی اے۔",
  f4Title: "پیسہ صاف نظر آندا اے",
  f4Body: "ہر ولے دی مہینے دی رقم، کِنّا وصول ہویا، کِنّا باقی اے تے کِنّے دن دی دیر اے۔",
  f5Title: "دفتر دا نظارہ",
  f5Body:
    "اَج دے کم، ایس ہفتے دے کم کمیونٹی دے حساب نال، تے مہینے دی کمائی کمیونٹی تے کلینر دے حساب نال۔",
  f6Title: "ہر کلینر، اپݨا علاقہ",
  f6Body:
    "ہر کلینر نوں کمیونٹی سونپو — اوہنوں صرف اپݨے ولے، اپݨا راؤنڈ تے اپݨیاں ادائیگیاں نظر آندیاں نیں۔",

  strip1Title: "چھے زباناں، سجّے توں کھبّے سمیت",
  strip1Body:
    "English، हिन्दी، বাংলা، اردو، پنجابی تے తెలుగు — تہاڈی ٹیم اوسے زبان وچ ایپ چلاندی اے جِہدے وچ اوہ سوچدی اے۔",
  strip2Title: "کسے وی فون تے انسٹال",
  strip2Body: "اینڈرائیڈ یا آئی فون دی ہوم اسکرین تے لاؤ۔ نہ ایپ اسٹور، نہ ڈاؤن لوڈ، نہ آئی ٹی شعبہ۔",

  howEyebrow: "ایہہ کِویں کم کردا اے",
  howTitle: "ہفتے دے اخیر تک چالو",
  howSub: "چار قدم — تے زیادہ تر ٹائپنگ تہانوں نئیں کرنی۔",
  s1Title: "اپݨا علاقہ طے کرو",
  s1Body: "جِنّاں کمیونٹیاں وچ تُسی کم کردے او اوہ شامل کرو تے ہر کلینر نوں سونپ دیو۔ دس منٹ، اِک وار۔",
  s2Title: "گاہک نوں سَدّو",
  s2Body:
    "واٹس ایپ لنک بھیجو۔ مالک آپ اپݨا ولا، گڈیاں تے دھلائی دے دن بھر دیندا اے۔",
  s3Title: "شیڈول آپے",
  s3Body:
    "ہر سبسکرپشن توں بکنگ بݨدی اے تے ٹھیک کلینر دے دن وچ اپڑ جاندی اے، ہر ہفتے۔",
  s4Title: "دھوؤ، دسّو، وصول کرو",
  s4Body:
    "تصویراں چڑھدیاں نیں، مالک نوں واٹس ایپ جاندا اے، ادائیگی درج ہندی اے — تے ڈیش بورڈ سب جوڑ دیندا اے۔",

  ctaTitle: "اپݨے ای روٹ تے ویکھو",
  ctaSub:
    "دسّو تُسی کِنّاں کمیونٹیاں وچ کم کردے او، اَسی تہاڈے ولیاں نال اِک ڈیمو کمپنی بݨا دیاں گے — اصلی ناں، اصلی راؤنڈ۔",
  mOverview: "مجموعی جائزہ",
  mCommunities: "کمیونٹیاں",
  mVillas: "ولے",
  mEmployees: "ملازم",
  mJobsToday: "اَج دے کم",
  mThisWeek: "ایس ہفتے",
  mRevenueMonth: "ایس مہینے دی کمائی",
  mByCommunity: "کمیونٹی دے حساب نال",
  mByCleaner: "کلینر دے حساب نال",

  adminEyebrow: "دفتر لئی",
  adminTitle: "مالک نوں ساری کمپنی نظر آندی اے",
  adminSub:
    "کلینر نوں فون ملدا اے، ایڈمن نوں ڈیسک ٹاپ ڈیش بورڈ — ہر کمیونٹی، ہر ولا، ہر کلینر تے ہر درہم، بغیر کسے نوں فون کر کے پُچھے کہ دن کِویں لنگھیا۔",
  a1Title: "کمیونٹیاں",
  a1Body:
    "جِنّاں کمپاؤنڈاں وچ تُسی کم کردے او اوہ شامل کرو تے کلینر سونپ دیو۔ ایہو اِک سیٹنگ طے کردی اے کہ کِہدے نوں کیہڑے ولے نظر آؤݨگے — ہور کجھ سیٹ نئیں کرنا۔",
  a2Title: "ولے تے گاہک",
  a2Body:
    "کمپنی دا ہر ولا — مالک، گڈیاں تے سبسکرپشن سمیت — ساریاں کمیونٹیاں اِکو ویلے، اِک اِک راؤنڈ کر کے نئیں۔",
  a3Title: "کلینر",
  a3Body:
    "کلینر شامل کرو، اوہنوں اپݨے فون تے لاگ اِن مل جاندا اے۔ جو کجھ اوہ دھوندا اے، آپے اوہدے کھاتے وچ جُڑدا اے۔",
  a4Title: "ادائیگیاں تے کمائی",
  a4Body:
    "کمپنی دی ہر ادائیگی — وصول ہوئی، باقی، دیر والی — تے مہینے دی کمائی کمیونٹی تے کلینر دے حساب نال ونڈی ہوئی۔",

  ctaBtn: "واٹس ایپ تے سنیہا بھیجو",
  ctaWaMessage: "السلام علیکم Carwaj — میں اِک کار واش کمپنی چلاندا واں تے ڈیمو ویکھݨا چاہندا واں۔",
  footerTagline: "گڈی دی سنبھال، ترتیب نال۔",
  footerPlace: "دبئی، متحدہ عرب امارات",
};

const te: LandingCopy = {
  navFeatures: "ఫీచర్లు",
  navHow: "ఇది ఎలా పనిచేస్తుంది",
  navWhatsapp: "వాట్సాప్",
  navSignIn: "సైన్ ఇన్",

  heroBadge: "యూఏఈలోని కార్ వాష్ కంపెనీల కోసం రూపొందించబడింది",
  heroTitle: "ప్రతి వాష్‌ను నడపండి, {accent} లేకుండా.",
  heroAccent: "స్ప్రెడ్‌షీట్",
  heroSub:
    "Carwaj ఈరోజు రౌండ్ మొత్తాన్ని మీ క్లీనర్ జేబులో ఉంచుతుంది, ఖాతాదారులకు వాట్సాప్‌లో సమాచారం అందిస్తుంది, ప్రతి విల్లా నుంచి ఎంత ఆదాయమో ఆఫీసుకు చూపిస్తుంది.",
  heroCta1: "డెమో బుక్ చేయండి",
  heroCta2: "సైన్ ఇన్",
  heroNote: "కార్డ్ అవసరం లేదు · ఒక మధ్యాహ్నంలో సెటప్",

  mToday: "ఈరోజు",
  mCars: "6 కార్లు",
  mDone: "2 పూర్తి",
  mInProgress: "1 జరుగుతోంది",
  mLeft: "3 మిగిలాయి",
  mCalendar: "క్యాలెండర్",
  mClients: "ఖాతాదారులు",
  mPayments: "చెల్లింపులు",
  mPending: "పెండింగ్",
  mPaid: "చెల్లించారు",
  mOverdue: "3 రోజులు ఆలస్యం",
  mActive: "యాక్టివ్",
  mPaused: "నిలిపివేశారు",
  mDue: "ఆగస్టు 1 లోగా",
  mMarkPaid: "చెల్లింపు నమోదు",

  waEyebrow: "వాట్సాప్, లోపలే",
  waTitle: "మీ ఖాతాదారులు ఏదీ డౌన్‌లోడ్ చేయనవసరం లేదు",
  waSub:
    "ప్రతి అప్‌డేట్ యజమానికి వారు అప్పటికే ఉన్న చోటే చేరుతుంది. ఐదు సందేశాలు వాటంతట అవే వెళ్తాయి — మీ కంపెనీ వాట్సాప్ బిజినెస్ నంబర్ నుంచి.",
  wa1Title: "స్వాగత లింక్",
  wa1Body:
    "కొత్త ఖాతాదారుకు ఒక లింక్ వెళ్తుంది, వారి విల్లా, కార్లు, వాష్ రోజులు వారే నింపుతారు — షెడ్యూల్ దానంతట అదే తయారవుతుంది. మీరు ఏమీ టైప్ చేయనవసరం లేదు.",
  wa2Title: "కారు శుభ్రమైంది",
  wa2Body:
    "క్లీనర్ వాష్ పూర్తి అని గుర్తు పెట్టిన క్షణమే యజమానికి తెలుస్తుంది. “ఈరోజు నా కారు అయిందా?” అనే ఫోన్లు ఇక ఉండవు.",
  wa3Title: "చెల్లింపు గుర్తు",
  wa3Body: "గడువు తేదీకి ముందే మర్యాదపూర్వక గుర్తు — మొత్తం, తేదీతో సహా.",
  wa4Title: "మృదువైన గుర్తు చేయడం",
  wa4Body:
    "గడువు దాటితే ఫాలో-అప్ దానంతట అదే వెళ్తుంది, ఎన్ని రోజులు దాటిందో చెబుతూ. ఎవరూ కఠినంగా ఉండాల్సిన అవసరం లేదు.",
  wa5Title: "చెల్లింపు నిర్ధారణ",
  wa5Body: "నగదు లేదా బదిలీ అని గుర్తు పెట్టండి, రసీదు వెంటనే ఖాతాదారు ఫోన్‌కు చేరుతుంది.",
  waNote:
    "అధికారిక వాట్సాప్ బిజినెస్ ప్లాట్‌ఫారమ్, ఆమోదిత టెంప్లేట్ల ద్వారా పంపబడుతుంది — దీనివల్ల మీ నంబర్ నమ్మకంగా ఉంటుంది, ప్రతి సందేశం నిజంగా చేరుతుంది.",
  waChatMsg1: "హలో అహ్మద్ 👋 మీ ల్యాండ్ క్రూయిజర్ ఇప్పుడే శుభ్రం చేయబడింది. ఫోటోలు యాప్‌లో ఉన్నాయి.",
  waChatMsg2: "మీ నెలవారీ చెల్లింపు AED 450 మూడు రోజుల్లో చెల్లించాలి (ఆగస్టు 1).",
  waChatMsg3: "AED 450 చెల్లింపు బదిలీ ద్వారా అందింది. ధన్యవాదాలు! 🙏",

  screensEyebrow: "యాప్",
  screensTitle: "నాలుగు స్క్రీన్లు, నేర్చుకోవడానికి ఏమీ లేదు",
  screensSub: "రోజు మొత్తం క్లీనర్ బొటనవేలి కింద. నెల మొత్తం ఒకే పేజీలో.",
  scCalTitle: "క్యాలెండర్",
  scCalBody:
    "ప్రతి రోజుకూ స్థితిని చూపే రంగు చుక్క. ఒక రోజుపై నొక్కితే కమ్యూనిటీల వారీగా మొత్తం రౌండ్ కనిపిస్తుంది.",
  scClientsTitle: "ఖాతాదారులు",
  scClientsBody: "విల్లాలు, యజమానులు, కార్లు, షెడ్యూళ్లు — యాక్టివ్, నిలిపివేసినవి, పాతవి వేర్వేరుగా.",
  scPayTitle: "చెల్లింపులు",
  scPayBody: "పెండింగ్, చెల్లించినవి, ఆలస్య రోజుల లెక్క, నగదు లేదా బదిలీ ఒకే నొక్కులో.",

  featEyebrow: "ఫీచర్లు",
  featTitle: "పనికి కావాల్సినవన్నీ",
  featSub: "ఒకే యాప్ — క్షేత్రంలో క్లీనర్‌కు, ఆఫీసులో మేనేజర్‌కు.",
  f1Title: "ఈరోజు రౌండ్, సిద్ధం",
  f1Body:
    "క్లీనర్ యాప్ తెరవగానే ఈరోజు జాబితా — కమ్యూనిటీల వారీగా, విల్లా, కారు, సర్వీస్ ముందే నమోదై.",
  f2Title: "ప్రతి వాష్‌కూ ఫోటోలు",
  f2Body:
    "ముందు, తరువాత ఫోటోలు ఫోన్‌లోనే తీసి, సెకన్లలో కుదించి అప్‌లోడ్. వాదనలు మొదలవ్వకముందే ముగుస్తాయి.",
  f3Title: "తనంతట తానే పునరావృతమయ్యే షెడ్యూల్",
  f3Body:
    "సబ్‌స్క్రిప్షన్ ఒకసారి పెట్టండి — వారానికి రెండుసార్లు, ప్రతి మంగళవారం, ఏది ఒప్పుకున్నా — బుకింగ్‌లు ముందుగానే తయారవుతాయి.",
  f4Title: "కనిపించే డబ్బు",
  f4Body: "ప్రతి విల్లా నెలవారీ మొత్తం, ఎంత వసూలైంది, ఎంత బాకీ, ఎన్ని రోజుల ఆలస్యం.",
  f5Title: "ఆఫీసు దృష్టి",
  f5Body:
    "ఈరోజు పనులు, ఈ వారం పనులు కమ్యూనిటీల వారీగా, నెలవారీ ఆదాయం కమ్యూనిటీ, క్లీనర్ వారీగా.",
  f6Title: "ప్రతి క్లీనర్‌కు తన ప్రాంతం",
  f6Body:
    "ప్రతి క్లీనర్‌కు కమ్యూనిటీలు కేటాయించండి — వారికి వారి విల్లాలు, వారి రౌండ్, వారి చెల్లింపులే కనిపిస్తాయి.",

  strip1Title: "ఆరు భాషలు, కుడి-నుంచి-ఎడమతో సహా",
  strip1Body:
    "English, हिन्दी, বাংলা, اردو, پنجابی మరియు తెలుగు — మీ బృందం ఏ భాషలో ఆలోచిస్తుందో ఆ భాషలోనే యాప్ వాడుతుంది.",
  strip2Title: "ఏ ఫోన్‌లోనైనా ఇన్‌స్టాల్",
  strip2Body: "ఆండ్రాయిడ్ లేదా ఐఫోన్ హోమ్ స్క్రీన్‌కు జోడించండి. యాప్ స్టోర్ లేదు, డౌన్‌లోడ్ లేదు, ఐటీ విభాగం అవసరం లేదు.",

  howEyebrow: "ఇది ఎలా పనిచేస్తుంది",
  howTitle: "వారాంతానికి పని మొదలు",
  howSub: "నాలుగు అడుగులు — టైపింగ్‌లో ఎక్కువ భాగం మీది కాదు.",
  s1Title: "మీ ప్రాంతాన్ని నిర్ణయించండి",
  s1Body: "మీరు పనిచేసే కమ్యూనిటీలను జోడించి ప్రతి క్లీనర్‌కు కేటాయించండి. పది నిమిషాలు, ఒక్కసారే.",
  s2Title: "ఖాతాదారును ఆహ్వానించండి",
  s2Body:
    "వాట్సాప్ లింక్ పంపండి. యజమానే తన విల్లా, కార్లు, వాష్ కావాల్సిన రోజులు నింపుతారు.",
  s3Title: "షెడ్యూల్ దానంతట అదే",
  s3Body:
    "ప్రతి సబ్‌స్క్రిప్షన్ నుంచి బుకింగ్‌లు తయారై సరైన క్లీనర్ రోజులో చేరతాయి, వారం తర్వాత వారం.",
  s4Title: "కడగండి, తెలియజేయండి, వసూలు చేయండి",
  s4Body:
    "ఫోటోలు ఎక్కుతాయి, యజమానికి వాట్సాప్ వెళ్తుంది, చెల్లింపు నమోదవుతుంది — డాష్‌బోర్డ్ అన్నీ కూడి చూపిస్తుంది.",

  ctaTitle: "మీ సొంత రూట్లలోనే చూడండి",
  ctaSub:
    "మీరు పనిచేసే కమ్యూనిటీలు చెప్పండి, మీ విల్లాలతో ఒక డెమో కంపెనీ ఏర్పాటు చేస్తాం — నిజమైన పేర్లు, నిజమైన రౌండ్లు.",
  mOverview: "సమగ్ర వీక్షణ",
  mCommunities: "కమ్యూనిటీలు",
  mVillas: "విల్లాలు",
  mEmployees: "ఉద్యోగులు",
  mJobsToday: "ఈరోజు పనులు",
  mThisWeek: "ఈ వారం",
  mRevenueMonth: "ఈ నెల ఆదాయం",
  mByCommunity: "కమ్యూనిటీల వారీగా",
  mByCleaner: "క్లీనర్ల వారీగా",

  adminEyebrow: "ఆఫీసు కోసం",
  adminTitle: "యజమానికి కంపెనీ మొత్తం కనిపిస్తుంది",
  adminSub:
    "క్లీనర్‌కు ఫోన్, అడ్మిన్‌కు డెస్క్‌టాప్ డాష్‌బోర్డ్ — ప్రతి కమ్యూనిటీ, ప్రతి విల్లా, ప్రతి క్లీనర్, ప్రతి దిర్హామ్. రోజు ఎలా గడిచిందో అడగడానికి ఎవరికీ ఫోన్ చేయనవసరం లేదు.",
  a1Title: "కమ్యూనిటీలు",
  a1Body:
    "మీరు పనిచేసే కాంపౌండ్లను జోడించి క్లీనర్లకు కేటాయించండి. ఎవరికి ఏ విల్లాలు కనిపించాలో ఆ ఒక్క కేటాయింపే నిర్ణయిస్తుంది — ఇంకేమీ సెట్ చేయనవసరం లేదు.",
  a2Title: "విల్లాలు, ఖాతాదారులు",
  a2Body:
    "కంపెనీలోని ప్రతి విల్లా — యజమాని, కార్లు, సబ్‌స్క్రిప్షన్‌తో సహా — అన్ని కమ్యూనిటీలూ ఒకేసారి, ఒక్కో రౌండ్ చొప్పున కాదు.",
  a3Title: "క్లీనర్లు",
  a3Body:
    "క్లీనర్‌ను జోడించండి, వారి సొంత ఫోన్‌లో లాగిన్ వస్తుంది. వారు కడిగినదంతా వారి ఖాతాలోకే వెళ్తుంది.",
  a4Title: "చెల్లింపులు, ఆదాయం",
  a4Body:
    "కంపెనీలోని ప్రతి చెల్లింపు — వసూలైనవి, పెండింగ్, ఆలస్యమైనవి — నెలవారీ ఆదాయం కమ్యూనిటీ, క్లీనర్ వారీగా విభజించి.",

  ctaBtn: "వాట్సాప్‌లో సందేశం పంపండి",
  ctaWaMessage: "హలో Carwaj — నేను ఒక కార్ వాష్ కంపెనీ నడుపుతున్నాను, డెమో చూడాలనుకుంటున్నాను.",
  footerTagline: "కారు సంరక్షణ, ఒక క్రమంలో.",
  footerPlace: "దుబాయ్, యూఏఈ",
};

export const LANDING: Record<Lang, LandingCopy> = { en, hi, bn, ur, pa, te };
