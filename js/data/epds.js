/**
 * Edinburgh Postnatal Depression Scale (EPDS)
 * Reference: Cox, J.L., Holden, J.M., and Sagovsky, R. (1987).
 * "Detection of postnatal depression: Development of the 10-item Edinburgh Postnatal Depression Scale."
 * British Journal of Psychiatry, 150:782-786.
 *
 * Scoring:
 * Total score: 0 to 30.
 * Score >= 13: RED triage (probable depression; nurse call within 24h & clinical referral).
 * Score 10 - 12: AMBER triage (possible depression; supportive counselling & nurse call).
 * Score < 10: GREEN triage (routine care).
 * Item 10 > 0: IMMEDIATE RED triage & visible emergency helpline instruction.
 */
const EPDS_CONFIG = {
  citation: "Cox, Holden & Sagovsky, 1987. Edinburgh Postnatal Depression Scale (EPDS).",
  timing: "Administered around 2 weeks (Day 14) and 6 weeks (Day 42) postpartum.",
  instructions: {
    en: "Please choose the response that best describes how you have felt in the past 7 days, not just how you feel today.",
    hi: "कृपया वह विकल्प चुनें जो पिछले 7 दिनों में आपकी भावनाओं को सबसे अच्छी तरह दर्शाता है, केवल आज की भावना नहीं।",
    bn: "দয়া করে সেই উত্তরটি বাছুন যা গত ৭ দিনে আপনি কেমন অনুভব করেছেন তা সবচেয়ে ভালোভাবে বর্ণনা করে।"
  },
  helplineInfo: {
    primary: "Tele-MANAS (Govt. of India 24x7 Mental Health Helpline): 14416 / 1800-891-4416 (Toll-Free)",
    secondary: "Kiran National Mental Health Helpline: 1800-599-0019",
    emergency: "National Emergency Ambulance: 108 / 112",
    message: {
      en: "You are not alone and support is available right now. Please talk to a family member, call the 24/7 free helpline, or visit the hospital emergency department.",
      hi: "आप अकेली नहीं हैं और इस समय तुरंत सहायता उपलब्ध है। कृपया परिवार के किसी सदस्य से बात करें, निःशुल्क हेल्पलाइन पर कॉल करें, या नजदीकी अस्पताल जाएं।",
      bn: "আপনি একা নন এবং এই মুহূর্তে সহায়তা পাওয়া সম্ভব। দয়া করে পরিবারের কারো সাথে কথা বলুন, ২৪/৭ টোল-ফ্রি হেল্পলাইনে ফোন করুন বা হাসপাতালে যান।"
    }
  },
  questions: [
    {
      index: 1,
      id: "epds_1",
      prompt: {
        en: "1. I have been able to laugh and see the funny side of things:",
        hi: "1. मैं हंसने और बातों के मज़ाकिया पहलू को देखने में सक्षम रही हूँ:",
        bn: "১. আমি হাসতে এবং কোনো বিষয়ের মজার দিকগুলো উপভোগ করতে পেরেছি:"
      },
      options: [
        { points: 0, text: { en: "As much as I always could", hi: "उतना ही जितना मैं हमेशा कर पाती थी", bn: "সবসময়ের মতোই পুরোপুরি" } },
        { points: 1, text: { en: "Not quite so much now", hi: "अब उतना ज्यादा नहीं", bn: "এখন কিছুটা কম" } },
        { points: 2, text: { en: "Definitely not so much now", hi: "अब निश्चित रूप से बहुत कम", bn: "এখন নিশ্চিতভাবেই অনেক কম" } },
        { points: 3, text: { en: "Not at all", hi: "बिल्कुल भी नहीं", bn: "একদমই না" } }
      ]
    },
    {
      index: 2,
      id: "epds_2",
      prompt: {
        en: "2. I have looked forward with enjoyment to things:",
        hi: "2. मैंने आने वाली चीजों का खुशी से इंतज़ार किया है:",
        bn: "২. আমি আনন্দের সাথে কোনো কাজের জন্য অপেক্ষা করেছি:"
      },
      options: [
        { points: 0, text: { en: "As much as I ever did", hi: "उतना ही जितना मैं हमेशा करती थी", bn: "সবসময়ের মতোই যেমন করতাম" } },
        { points: 1, text: { en: "Rather less than I used to", hi: "पहले से कुछ कम", bn: "আগের চেয়ে কিছুটা কম" } },
        { points: 2, text: { en: "Definitely less than I used to", hi: "निश्चित रूप से पहले से बहुत कम", bn: "আগের চেয়ে নিশ্চিতভাবেই অনেক কম" } },
        { points: 3, text: { en: "Hardly at all", hi: "शायद ही कभी / बिल्कुल नहीं", bn: "কখনোই প্রায় না" } }
      ]
    },
    {
      index: 3,
      id: "epds_3",
      prompt: {
        en: "3. I have blamed myself unnecessarily when things went wrong:",
        hi: "3. जब चीजें गलत हुईं, तो मैंने बेवजह खुद को दोषी ठहराया है:",
        bn: "৩. কোনো কিছু ভুল হলে আমি অকারণে নিজেকে দোষারোপ করেছি:"
      },
      options: [
        { points: 3, text: { en: "Yes, most of the time", hi: "हाँ, ज्यादातर समय", bn: "হ্যাঁ, বেশিরভাগ সময়" } },
        { points: 2, text: { en: "Yes, some of the time", hi: "हाँ, कुछ समय", bn: "হ্যাঁ, মাঝে মাঝে" } },
        { points: 1, text: { en: "Not very often", hi: "बहुत ज्यादा नहीं", bn: "খুব বেশি নয়" } },
        { points: 0, text: { en: "No, never", hi: "नहीं, कभी नहीं", bn: "না, কখনোই না" } }
      ]
    },
    {
      index: 4,
      id: "epds_4",
      prompt: {
        en: "4. I have been anxious or worried for no good reason:",
        hi: "4. मैं बिना किसी ठोस कारण के चिंतित या परेशान रही हूँ:",
        bn: "৪. কোনো কারণ ছাড়াই আমি অযথা উদ্বিগ্ন বা চিন্তিত থেকেছি:"
      },
      options: [
        { points: 0, text: { en: "No, not at all", hi: "नहीं, बिल्कुल नहीं", bn: "না, একদমই না" } },
        { points: 1, text: { en: "Hardly ever", hi: "शायद ही कभी", bn: "খুব কম সময়ই" } },
        { points: 2, text: { en: "Yes, sometimes", hi: "हाँ, कभी-कभी", bn: "হ্যাঁ, মাঝে মাঝে" } },
        { points: 3, text: { en: "Yes, very often", hi: "हाँ, बहुत बार", bn: "হ্যাঁ, খুব ঘনঘন" } }
      ]
    },
    {
      index: 5,
      id: "epds_5",
      prompt: {
        en: "5. I have felt scared or panicky for no very good reason:",
        hi: "5. मुझे बिना किसी ठोस कारण के डर या घबराहट महसूस हुई है:",
        bn: "৫. কোনো কারণ ছাড়াই আমি আতঙ্কিত বা ভীত অনুভব করেছি:"
      },
      options: [
        { points: 3, text: { en: "Yes, quite a lot", hi: "हाँ, बहुत ज्यादा", bn: "হ্যাঁ, বেশ অনেকবার" } },
        { points: 2, text: { en: "Yes, sometimes", hi: "हाँ, कभी-कभी", bn: "হ্যাঁ, মাঝে মাঝে" } },
        { points: 1, text: { en: "No, not much", hi: "नहीं, ज्यादा नहीं", bn: "না, খুব একটা না" } },
        { points: 0, text: { en: "No, not at all", hi: "नहीं, बिल्कुल नहीं", bn: "না, একেবারেই না" } }
      ]
    },
    {
      index: 6,
      id: "epds_6",
      prompt: {
        en: "6. Things have been getting on top of me (feeling unable to cope):",
        hi: "6. चीजें मेरे काबू से बाहर हो रही हैं (स्थिति संभालने में असमर्थ महसूस होना):",
        bn: "৬. সবকিছু আমার সামর্থ্যের বাইরে চলে যাচ্ছে (পরিস্থিতি সামলাতে পারছি না):"
      },
      options: [
        { points: 3, text: { en: "Yes, most of the time I haven't been able to cope at all", hi: "हाँ, ज्यादातर समय मैं बिल्कुल नहीं संभाल पा रही हूँ", bn: "হ্যাঁ, বেশিরভাগ সময় আমি একদমই সামলাতে পারিনি" } },
        { points: 2, text: { en: "Yes, sometimes I haven't been coping as well as usual", hi: "हाँ, कभी-कभी मैं पहले जितना अच्छा नहीं संभाल पा रही", bn: "হ্যাঁ, মাঝে মাঝে আগের মতো সামলাতে পারছি না" } },
        { points: 1, text: { en: "No, most of the time I have coped quite well", hi: "नहीं, ज्यादातर समय मैंने काफी अच्छा संभाला है", bn: "না, বেশিরভাগ সময় ভালোভাবেই সামলেছি" } },
        { points: 0, text: { en: "No, I have been coping as well as ever", hi: "नहीं, मैं हमेशा की तरह अच्छी तरह संभाल रही हूँ", bn: "না, আমি সবসময়ের মতোই ভালোভাবে সামলাচ্ছি" } }
      ]
    },
    {
      index: 7,
      id: "epds_7",
      prompt: {
        en: "7. I have been so unhappy that I have had difficulty sleeping:",
        hi: "7. मैं इतनी दुखी रही हूँ कि मुझे सोने में परेशानी हुई है:",
        bn: "৭. আমি এতটাই কষ্টে ছিলাম যে ঘুমাতে কষ্ট হয়েছে:"
      },
      options: [
        { points: 3, text: { en: "Yes, most of the time", hi: "हाँ, ज्यादातर समय", bn: "হ্যাঁ, বেশিরভাগ সময়" } },
        { points: 2, text: { en: "Yes, sometimes", hi: "हाँ, कभी-कभी", bn: "হ্যাঁ, মাঝে মাঝে" } },
        { points: 1, text: { en: "Not very often", hi: "बहुत ज्यादा नहीं", bn: "খুব বেশি নয়" } },
        { points: 0, text: { en: "No, not at all", hi: "नहीं, बिल्कुल नहीं", bn: "না, একদমই না" } }
      ]
    },
    {
      index: 8,
      id: "epds_8",
      prompt: {
        en: "8. I have felt sad or miserable:",
        hi: "8. मैंने उदास या बहुत दुखी महसूस किया है:",
        bn: "৮. আমি বিষণ্ণ বা অত্যন্ত দুঃখী অনুভব করেছি:"
      },
      options: [
        { points: 3, text: { en: "Yes, most of the time", hi: "हाँ, ज्यादातर समय", bn: "হ্যাঁ, বেশিরভাগ সময়" } },
        { points: 2, text: { en: "Yes, quite often", hi: "हाँ, बहुत बार", bn: "হ্যাঁ, খুব ঘনঘন" } },
        { points: 1, text: { en: "Not very often", hi: "बहुत ज्यादा नहीं", bn: "খুব বেশি নয়" } },
        { points: 0, text: { en: "No, not at all", hi: "नहीं, बिल्कुल नहीं", bn: "না, একদমই না" } }
      ]
    },
    {
      index: 9,
      id: "epds_9",
      prompt: {
        en: "9. I have been so unhappy that I have been crying:",
        hi: "9. मैं इतनी दुखी रही हूँ कि मुझे रोना आया है:",
        bn: "৯. আমি এতটাই কষ্টে ছিলাম যে কেঁদে ফেলেছি:"
      },
      options: [
        { points: 3, text: { en: "Yes, most of the time", hi: "हाँ, ज्यादातर समय", bn: "হ্যাঁ, বেশিরভাগ সময়" } },
        { points: 2, text: { en: "Yes, quite often", hi: "हाँ, काफी बार", bn: "হ্যাঁ, অনেকবার" } },
        { points: 1, text: { en: "Only occasionally", hi: "केवल कभी-कभार", bn: "মাঝে মধ্যে মাত্র" } },
        { points: 0, text: { en: "No, never", hi: "नहीं, कभी नहीं", bn: "না, কখনোই না" } }
      ]
    },
    {
      index: 10,
      id: "epds_10",
      prompt: {
        en: "10. The thought of harming myself has occurred to me:",
        hi: "10. मुझे खुद को नुकसान पहुँचाने का विचार आया है:",
        bn: "১০. নিজের কোনো ক্ষতি করার কথা আমার মনে এসেছে:"
      },
      isSelfHarmItem: true,
      options: [
        { points: 3, text: { en: "Yes, quite often", hi: "हाँ, बहुत बार", bn: "হ্যাঁ, প্রায়শই" } },
        { points: 2, text: { en: "Sometimes", hi: "कभी-कभी", bn: "মাঝে মাঝে" } },
        { points: 1, text: { en: "Hardly ever", hi: "शायद ही कभी", bn: "খুব কম সময়ে" } },
        { points: 0, text: { en: "Never", hi: "कभी नहीं", bn: "কখনোই না" } }
      ]
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = EPDS_CONFIG;
} else {
  window.EPDS_CONFIG = EPDS_CONFIG;
}
