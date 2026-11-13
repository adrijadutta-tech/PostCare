/**
 * PostCare - Adaptive Weekly Check-In Questions Configuration
 * Branching structure stored in JSON/JS config format.
 * Healthy mothers answer No to core questions and finish in under 1 minute.
 */
const CHECKIN_CONFIG = {
  version: "1.0.0",
  title: "Weekly Postnatal Health Check-In",
  estimatedTime: "Under 1 minute",
  coreQuestions: [
    {
      id: "bleeding",
      category: "bleeding",
      text: {
        en: "Are you having heavy, unusual, or worsening vaginal bleeding?",
        hi: "क्या आपको बहुत अधिक, असामान्य या बढ़ता हुआ रक्तस्राव (Bleeding) हो रहा है?",
        bn: "আপনার কি অতিরিক্ত, অস্বাভাবিক বা রক্তক্ষরণ বাড়ছে?"
      },
      helpText: {
        en: "Bleeding should normally lighten over time (turning pinkish, then yellowish-white).",
        hi: "प्रसव के बाद रक्तस्राव धीरे-धीरे कम होना चाहिए (गुलाबी, फिर हल्का पीला-सफेद)।",
        bn: "প্রসবের পর রক্তক্ষরণ সাধারণত সময়ের সাথে কমে আসার কথা (গোলাপি, তারপর হালকা হলুদ-সাদা)।"
      },
      type: "yes_no",
      followUpsOnYes: [
        {
          id: "bleeding_pad_rate",
          text: {
            en: "How quickly are you soaking through sanitary pads?",
            hi: "आप कितने समय में सैनिटरी पैड पूरी तरह भीगता हुआ देख रही हैं?",
            bn: "আপনি কত তাড়াতাড়ি স্যানিটারি প্যাড সম্পূর্ণ ভিজে যেতে দেখছেন?"
          },
          type: "single_choice",
          options: [
            {
              value: "soaking_hour",
              label: {
                en: "Soaking 1 or more pads completely in an hour",
                hi: "1 घंटे में 1 या अधिक पैड पूरी तरह भीग जाता है",
                bn: "১ ঘণ্টায় ১ বা তার বেশি প্যাড সম্পূর্ণ ভিজে যাচ্ছে"
              },
              triggersRule: "R2",
              severity: "RED"
            },
            {
              value: "heavier_than_period",
              label: {
                en: "Heavier than a normal period, but less than 1 pad/hr",
                hi: "सामान्य माहवारी से ज्यादा, लेकिन 1 घंटे में 1 पैड से कम",
                bn: "সাধারণ মাসিকের চেয়ে বেশি, তবে ঘণ্টায় ১ প্যাডের চেয়ে কম"
              },
              triggersRule: "R7",
              severity: "AMBER"
            },
            {
              value: "normal_flow",
              label: {
                en: "Moderate flow, manageable with regular changes",
                hi: "मध्यम प्रवाह, नियमित बदलने योग्य",
                bn: "মাঝারি স্রাব, স্বাভাবিক পরিবর্তনযোগ্য"
              },
              severity: "GREEN"
            }
          ]
        },
        {
          id: "bleeding_clots",
          text: {
            en: "Are you passing large blood clots (larger than a ₹5 coin or lemon)?",
            hi: "क्या आपको बड़े खून के थक्के (सिक्के या नींबू जितने बड़े) निकल रहे हैं?",
            bn: "আপনার কি বড় রক্তের চাকা বের হচ্ছে (মুদ্রা বা লেবুর সমান বা তার বড়)?"
          },
          type: "single_choice",
          options: [
            {
              value: "yes_large_clots",
              label: {
                en: "Yes, passing large clots",
                hi: "हाँ, बड़े खून के थक्के आ रहे हैं",
                bn: "হ্যাঁ, বড় রক্তের চাকা আসছে"
              },
              triggersRule: "R2",
              severity: "RED"
            },
            {
              value: "no_clots",
              label: {
                en: "No large clots",
                hi: "नहीं, छोटे या कोई थक्के नहीं हैं",
                bn: "না, বড় রক্তের চাকা নেই"
              },
              severity: "GREEN"
            }
          ]
        },
        {
          id: "bleeding_odor",
          text: {
            en: "Does the vaginal discharge have a foul or bad smell?",
            hi: "क्या रक्तस्राव या स्राव से दुर्गंध आ रही है?",
            bn: "স্রাব থেকে কি কোনো দুর্গন্ধ বের হচ্ছে?"
          },
          type: "single_choice",
          options: [
            {
              value: "foul_smell",
              label: {
                en: "Yes, noticeable unpleasant or foul odor",
                hi: "हाँ, तेज दुर्गंध आ रही है",
                bn: "হ্যাঁ, তীব্র দুর্গন্ধ আসছে"
              },
              triggersRule: "R7",
              severity: "AMBER"
            },
            {
              value: "normal_smell",
              label: {
                en: "No foul smell",
                hi: "नहीं, कोई दुर्गंध नहीं है",
                bn: "না, কোনো দুর্গন্ধ নেই"
              },
              severity: "GREEN"
            }
          ]
        }
      ]
    },
    {
      id: "fever",
      category: "infection",
      text: {
        en: "Do you have a fever, chills, or severe body shivering?",
        hi: "क्या आपको बुखार, कंपकंपी या तेज ठंड लग रही है?",
        bn: "আপনার কি জ্বর, কাঁপুনি বা খুব বেশি শীত লাগছে?"
      },
      helpText: {
        en: "Fever after childbirth can be an early sign of uterine, breast, or wound infection.",
        hi: "प्रसव के बाद बुखार गर्भाशय, स्तन या घाव के संक्रमण का संकेत हो सकता है।",
        bn: "প্রসবের পর জ্বর জরায়ু, স্তন বা ক্ষতের সংক্রমণের লক্ষণ হতে পারে।"
      },
      type: "yes_no",
      followUpsOnYes: [
        {
          id: "fever_temperature",
          text: {
            en: "What is your measured body temperature?",
            hi: "आपका मापा गया शरीर का तापमान कितना है?",
            bn: "আপনার শরীরের তাপমাত্রা মেপেছেন কি?"
          },
          type: "single_choice",
          options: [
            {
              value: "high_fever",
              label: {
                en: "38.0°C (100.4°F) or higher",
                hi: "38.0°C (100.4°F) या उससे अधिक",
                bn: "৩৮.০°C (১০০.৪°F) বা তার বেশি"
              },
              triggersRule: "R6",
              severity: "AMBER"
            },
            {
              value: "mild_temp",
              label: {
                en: "Between 37.5°C and 37.9°C (mild warmth)",
                hi: "37.5°C से 37.9°C के बीच (हल्की गर्माहट)",
                bn: "৩৭.৫°C থেকে ৩৭.৯°C এর মধ্যে (সামান্য গরম)"
              },
              severity: "GREEN"
            },
            {
              value: "hot_no_thermometer",
              label: {
                en: "No thermometer, but forehead/body feels burning hot with chills",
                hi: "थर्मामीटर नहीं है, लेकिन शरीर बहुत गर्म है और कंपकंपी है",
                bn: "থার্মোমিটার নেই, কিন্তু শরীর প্রচণ্ড গরম ও কাঁপুনি আছে"
              },
              triggersRule: "R6",
              severity: "AMBER"
            }
          ]
        }
      ]
    },
    {
      id: "headache_vision",
      category: "hypertension",
      text: {
        en: "Do you have a severe headache, blurred vision, or seeing spots?",
        hi: "क्या आपको तेज सिरदर्द, धुंधला दिखाई देना या आंखों के सामने धब्बे दिख रहे हैं?",
        bn: "আপনার কি প্রচণ্ড মাথাব্যথা, ঝাপসা দৃষ্টি বা চোখের সামনে দাগ দেখা যাচ্ছে?"
      },
      helpText: {
        en: "Severe headaches with vision changes can indicate high blood pressure (postpartum pre-eclampsia).",
        hi: "दृष्टि में बदलाव के साथ तेज सिरदर्द उच्च रक्तचाप (प्री-एक्लेमप्सिया) का लक्षण हो सकता है।",
        bn: "দৃষ্টির পরিবর্তনের সাথে তীব্র মাথাব্যথা উচ্চ রক্তচাপের (প্রি-এক্লাম্পসিয়া) লক্ষণ হতে পারে।"
      },
      type: "yes_no",
      followUpsOnYes: [
        {
          id: "headache_type",
          text: {
            en: "Which description best matches what you are experiencing?",
            hi: "इनमें से कौन सा आपकी स्थिति से सबसे अधिक मेल खाता है?",
            bn: "কোন বিবরণটি আপনার সমস্যার সাথে সবচেয়ে বেশি মেলে?"
          },
          type: "single_choice",
          options: [
            {
              value: "severe_with_vision",
              label: {
                en: "Severe throbbing headache with blurred vision, spots, or flashing lights",
                hi: "तेज सिरदर्द के साथ धुंधलापन, आंखों के आगे चमक या धब्बे",
                bn: "তীব্র মাথাব্যথার সাথে ঝাপসা দেখা, চোখের সামনে আলো বা দাগ"
              },
              triggersRule: "R3",
              severity: "RED"
            },
            {
              value: "persistent_dull_headache",
              label: {
                en: "Persistent dull headache that won't go away after rest or fluids",
                hi: "लगातार बना रहने वाला सिरदर्द जो आराम या पानी पीने से ठीक नहीं हो रहा",
                bn: "টানা মাথাব্যথা যা বিশ্রাম বা জল খাওয়ার পরও কমছে না"
              },
              triggersRule: "R8",
              severity: "AMBER"
            },
            {
              value: "mild_tiredness_headache",
              label: {
                en: "Mild headache from lack of sleep, goes away with rest",
                hi: "नींद की कमी से हल्का सिरदर्द, जो आराम से कम होता है",
                bn: "ঘুমের অভাবে হালকা মাথাব্যথা, যা বিশ্রামে কমে"
              },
              severity: "GREEN"
            }
          ]
        }
      ]
    },
    {
      id: "breathing_chest",
      category: "cardiorespiratory",
      text: {
        en: "Do you have chest pain, trouble breathing, or fainting spells?",
        hi: "क्या आपको सीने में दर्द, सांस लेने में तकलीफ या चक्कर/बेहोशी आ रही है?",
        bn: "আপনার কি বুকে ব্যথা, শ্বাস নিতে কষ্ট বা মাথা ঘুরে অজ্ঞান হওয়ার অনুভূতি হচ্ছে?"
      },
      helpText: {
        en: "Chest pain or sudden breathlessness requires immediate emergency attention.",
        hi: "सीने में दर्द या अचानक सांस फूलने पर तुरंत आपातकालीन चिकित्सा की आवश्यकता होती है।",
        bn: "বুকে ব্যথা বা হঠাৎ শ্বাসকষ্টের জন্য জরুরি চিকিৎসার প্রয়োজন।"
      },
      type: "yes_no",
      followUpsOnYes: [
        {
          id: "breathing_details",
          text: {
            en: "Select what you are feeling:",
            hi: "चुनें कि आप क्या महसूस कर रही हैं:",
            bn: "বেছে নিন আপনি কী অনুভব করছেন:"
          },
          type: "single_choice",
          options: [
            {
              value: "chest_pain_severe_dyspnea",
              label: {
                en: "Chest tightness/pain, gasping for breath, or fainted/seizure",
                hi: "सीने में दबाव/दर्द, सांस फूलना, या बेहोश होना/दौरे पड़ना",
                bn: "বুকে চাপ বা ব্যথা, দম আটকে আসা, অথবা অজ্ঞান হওয়া/খিঁচুনি"
              },
              triggersRule: "R1",
              severity: "RED"
            },
            {
              value: "mild_breathless_exertion",
              label: {
                en: "Slight shortness of breath only when walking or climbing stairs",
                hi: "केवल चलने या सीढ़ियां चढ़ने पर हल्की सांस फूलना",
                bn: "শুধুমাত্র হাঁটাচলা বা সিঁড়ি দিয়ে ওঠার সময় সামান্য শ্বাসকষ্ট"
              },
              triggersRule: "R8",
              severity: "AMBER"
            }
          ]
        }
      ]
    },
    {
      id: "wound_pain",
      category: "wound_dvt",
      text: {
        en: "Do you have wound pain/swelling (C-section or stitches) or one-sided leg pain?",
        hi: "क्या आपके घाव (सिजेरियन चीरा या टांके) में दर्द/सूजन या एक पैर में तेज दर्द है?",
        bn: "আপনার কি ক্ষতের জায়গায় (সিজারিয়ান বা সেলাই) ব্যথা/ফোলা বা এক পায়ে টান ধরা ব্যথা আছে?"
      },
      helpText: {
        en: "Wounds should gradually heal and pain should decrease week by week.",
        hi: "घाव धीरे-धीरे ठीक होना चाहिए और हर सप्ताह दर्द कम होना चाहिए।",
        bn: "ক্ষত আস্তে আস্তে শুকানো উচিত এবং প্রতি সপ্তাহে ব্যথা কমে আসা উচিত।"
      },
      type: "yes_no",
      followUpsOnYes: [
        {
          id: "wound_signs",
          text: {
            en: "What symptoms are present around your stitches or legs?",
            hi: "आपके टांकों या पैरों में क्या लक्षण दिख रहे हैं?",
            bn: "আপনার সেলাই বা পায়ে কী ধরণের লক্ষণ দেখা যাচ্ছে?"
          },
          type: "single_choice",
          options: [
            {
              value: "infection_signs",
              label: {
                en: "Spreading redness, foul pus/discharge, or gaping open edges",
                hi: "घाव में लाली फैलना, मवाद/स्राव निकलना या घाव खुलना",
                bn: "লাল ভাব ছড়িয়ে পড়া, পুঁজ/পানি পড়া বা সেলাই খুলে যাওয়া"
              },
              triggersRule: "R9",
              severity: "AMBER"
            },
            {
              value: "leg_dvt_signs",
              label: {
                en: "Severe swelling, redness, or tenderness in one calf or thigh",
                hi: "एक पिंडली या जांघ में अत्यधिक सूजन, लाली या तेज दर्द",
                bn: "একটি পায়ের গোড়ালি বা ঊরুতে অতিরিক্ত ফোলা, লাল হওয়া বা তীব্র ব্যথা"
              },
              triggersRule: "R8",
              severity: "AMBER"
            },
            {
              value: "healing_tenderness",
              label: {
                en: "Mild surgical soreness without discharge or spreading redness",
                hi: "हल्का सामान्य खिंचाव या दर्द, बिना मवाद या लाली के",
                bn: "হালকা স্বাভাবিক অস্বস্তি বা ব্যথা, কোনো পুঁজ বা লাল ভাব ছাড়া"
              },
              severity: "GREEN"
            }
          ]
        },
        {
          id: "wound_pain_trend",
          text: {
            en: "Compared to your last check-in, is the wound pain:",
            hi: "पिछले चेक-इन की तुलना में, घाव का दर्द कैसा है?",
            bn: "আগের চেক-ইনের তুলনায় ক্ষতের ব্যথা কেমন?"
          },
          type: "single_choice",
          options: [
            {
              value: "worse_than_last_week",
              label: {
                en: "Worse than last check-in (pain has increased)",
                hi: "पहले से ज्यादा खराब (दर्द बढ़ गया है)",
                bn: "আগের চেয়ে খারাপ (ব্যথা বৃদ্ধি পেয়েছে)"
              },
              triggersRule: "R10",
              severity: "AMBER"
            },
            {
              value: "same_as_last_week",
              label: {
                en: "About the same as before",
                hi: "पहले जैसा ही है",
                bn: "আগের মতোই আছে"
              },
              severity: "GREEN"
            },
            {
              value: "better_healing",
              label: {
                en: "Better than before (healing well)",
                hi: "पहले से बेहतर (दर्द कम हो रहा है)",
                bn: "আগের চেয়ে ভালো (ব্যথা কমছে)"
              },
              severity: "GREEN"
            }
          ]
        }
      ]
    }
  ],
  babyAndMoodQuestions: [
    {
      id: "baby_feeding",
      category: "baby",
      text: {
        en: "Is your baby feeding well (8-12 feeds/day, active sucking, wet diapers)?",
        hi: "क्या आपका शिशु ठीक से स्तनपान कर रहा है (दिन में 8-12 बार, सक्रिय रूप से, गीले लंगोट)?",
        bn: "আপনার শিশু কি ঠিকমতো দুধ খাচ্ছে (দিনে ৮-১২ বার, সক্রিয়ভাবে, পর্যাপ্ত ভেজা ডায়াপার)?"
      },
      type: "single_choice",
      options: [
        {
          value: "feeding_well",
          label: {
            en: "Yes, feeding well, alert and producing wet nappies",
            hi: "हाँ, शिशु ठीक से दूध पी रहा है और सक्रिय है",
            bn: "হ্যাঁ, শিশু ঠিকমতো দুধ খাচ্ছে এবং সতেজ রয়েছে"
          },
          severity: "GREEN"
        },
        {
          value: "struggling_feeding",
          label: {
            en: "No, baby refuses feeds, has poor latch, or is excessively lethargic",
            hi: "नहीं, शिशु दूध नहीं पी पा रहा, बहुत सुस्त है या रोता नहीं",
            bn: "না, শিশু দুধ খেতে পারছে না, খুব নিস্তেজ বা খেতে চাইছে না"
          },
          triggersRule: "R7",
          severity: "AMBER"
        }
      ]
    },
    {
      id: "general_mood",
      category: "mood",
      text: {
        en: "How have you been feeling emotionally over the past few days?",
        hi: "पिछले कुछ दिनों में आपका मानसिक और भावनात्मक स्वास्थ्य कैसा रहा है?",
        bn: "গত কয়েকদিনে আপনার মানসিক অবস্থা কেমন ছিল?"
      },
      type: "single_choice",
      options: [
        {
          value: "mood_good",
          label: {
            en: "Coping well, bonding with baby, feeling supported",
            hi: "अच्छा महसूस कर रही हूँ, परिवार का सहयोग मिल रहा है",
            bn: "ভালো অনুভব করছি, পরিবারের সহায়তা পাচ্ছি"
          },
          severity: "GREEN"
        },
        {
          value: "mood_anxious_tearful",
          label: {
            en: "Tearful, anxious, or tired, but managing day-to-day",
            hi: "हल्की घबराहट, थकान या कभी-कभार रोना आता है",
            bn: "সামান্য উদ্বেগ, ক্লান্তি বা মাঝে মাঝে কান্না পাচ্ছে"
          },
          severity: "GREEN"
        },
        {
          value: "mood_overwhelmed",
          label: {
            en: "Extremely overwhelmed, hopeless, or constant deep sadness",
            hi: "बहुत अधिक उदास, निराश, या बिल्कुल भी संभाल नहीं पा रही हूँ",
            bn: "অত্যধিক হতাশ, অসহায় বা সবসময় গভীর বিষণ্ণতা অনুভব করছি"
          },
          triggersEpdsRecommendation: true,
          severity: "AMBER"
        }
      ]
    }
  ]
};

// Expose for Node.js / browser environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = CHECKIN_CONFIG;
} else {
  window.CHECKIN_CONFIG = CHECKIN_CONFIG;
}
