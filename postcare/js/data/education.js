/**
 * PostCare Contextual Education & Audio Companion
 * Provides short, evidence-based postnatal tips in English, Hindi, and Bengali,
 * along with a family danger-sign guide and Web Speech API audio narration.
 */
const EDUCATION_DATA = {
  tipsByCategory: {
    bleeding_red: {
      category: "Emergency Care (Bleeding)",
      icon: "🚨",
      tip: {
        en: "Soaking a pad in an hour or passing large clots is a sign of postpartum hemorrhage. Lie flat, keep warm, call 108 immediately, and bring your baby and hospital discharge summary.",
        hi: "1 घंटे में 1 पैड भीगना या बड़े थक्के आना प्रसवोत्तर रक्तस्राव का संकेत है। तुरंत सीधी लेट जाएं, 108 पर कॉल करें और अस्पताल का डिस्चार्ज पेपर साथ रखें।",
        bn: "১ ঘণ্টায় ১টি প্যাড ভিজে যাওয়া বা বড় রক্তের চাকা বের হওয়া প্রসবোত্তর রক্তক্ষরণের লক্ষণ। সোজা হয়ে শুয়ে থাকুন, তৎক্ষণাৎ ১০৮ নম্বরে ফোন করুন এবং হাসপাতালের কাগজ সাথে রাখুন।"
      }
    },
    infection_amber: {
      category: "Infection Care (Fever / Wound)",
      icon: "🌡️",
      tip: {
        en: "A temperature of 38.0°C (100.4°F) or above needs medical review. Drink plenty of clean water, rest, wash your hands thoroughly before touching your stitches, and call your nurse today.",
        hi: "38.0°C (100.4°F) या उससे अधिक बुखार पर डॉक्टर को दिखाना जरूरी है। खूब पानी पिएं, आराम करें, टांकों को छूने से पहले हाथ साबुन से धोएं और आज ही नर्स से संपर्क करें।",
        bn: "৩৮.০°C (১০০.৪°F) বা তার বেশি তাপমাত্রা হলে ডাক্তারের পরামর্শ নেওয়া জরুরি। প্রচুর জল পান করুন, বিশ্রাম নিন, সেলাই স্পর্শ করার আগে সাবান দিয়ে হাত ধুয়ে নিন এবং নার্সকে জানান।"
      }
    },
    hypertension_red: {
      category: "Blood Pressure Warning (Pre-eclampsia)",
      icon: "⚠️",
      tip: {
        en: "Severe headaches with blurred vision or spots can be a sign of postpartum pre-eclampsia (high blood pressure). Go to the maternity emergency room immediately.",
        hi: "धुंधली दृष्टि या धब्बों के साथ तेज सिरदर्द प्रसवोत्तर उच्च रक्तचाप (प्री-एक्लेमप्सिया) का लक्षण हो सकता है। तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।",
        bn: "ঝাপসা দৃষ্টি বা চোখের সামনে দাগ পড়ার সাথে তীব্র মাথাব্যথা প্রসবোত্তর উচ্চ রক্তচাপের লক্ষণ হতে পারে। অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান।"
      }
    },
    mental_health_support: {
      category: "Emotional Well-being",
      icon: "💙",
      tip: {
        en: "Postpartum emotional changes are common (affecting 1 in 5 Indian mothers) and treatable. It is not your fault. Reach out to Tele-MANAS helpline 14416 (free 24/7) or tell your family how you feel.",
        hi: "प्रसव के बाद भावनात्मक बदलाव आम हैं (भारत में हर 5 में से 1 मां को प्रभावित करते हैं) और इनका उपचार संभव है। टेली-मानस हेल्पलाइन 14416 पर निःशुल्क बात करें या परिवार से साझा करें।",
        bn: "প্রসবোত্তর মানসিক পরিবর্তন খুবই সাধারণ (ভারতে প্রতি ৫ জনের মধ্যে ১ জন মা এতে ভোগেন) এবং এর চিকিৎসা সম্ভব। টেলি-মানস হেল্পলাইন ১৪৪১৬ নম্বরে ফোন করুন বা পরিবারের সাথে কথা বলুন।"
      }
    },
    general_green: {
      category: "Healthy Postnatal Recovery",
      icon: "🌱",
      tip: {
        en: "Great job! Keep resting when the baby sleeps, drink 2-3 liters of fluids daily, eat iron and protein-rich meals, and continue exclusive breastfeeding.",
        hi: "बहुत बढ़िया! जब शिशु सोए तब आप भी आराम करें, दिन में 2-3 लीटर पानी पिएं, पौष्टिक भोजन लें और केवल स्तनपान जारी रखें।",
        bn: "দারুণ! শিশু ঘুমানোর সময় নিজেও বিশ্রাম নিন, দিনে ২-৩ লিটার জল পান করুন, পুষ্টিকর খাবার খান এবং শুধুমাত্র বুকের দুধ খাওয়ানো চালিয়ে যান।"
      }
    },
    trend_worse_amber: {
      category: "Symptom Trend Notice",
      icon: "📈",
      tip: {
        en: "Your pain or symptom was noted as worse than last week. Normal healing should feel better over time, not worse. Your nurse has been alerted to review this with you.",
        hi: "आपके पिछले चेक-इन की तुलना में यह लक्षण बढ़ गया है। सामान्य सुधार में दर्द कम होना चाहिए। आपकी नर्स को सूचना भेज दी गई है ताकि वे आपसे बात कर सकें।",
        bn: "আপনার আগের চেক-ইনের তুলনায় এই লক্ষণটি বেড়েছে। স্বাভাবিকভাবে সুস্থ হওয়ার সময় ব্যথা কমে যাওয়ার কথা। আপনার নার্সকে বিষয়টি জানানো হয়েছে যাতে তিনি যোগাযোগ করতে পারেন।"
      }
    }
  },

  familyGuide: {
    title: {
      en: "Family Postnatal Safety & Warning-Sign Guide",
      hi: "परिवार के लिए प्रसवोत्तर सुरक्षा और खतरे के लक्षण गाइड",
      bn: "পরিবারের জন্য প্রসবোত্তর সুরক্ষা ও বিপদের লক্ষণ নির্দেশিকা"
    },
    subtitle: {
      en: "A guide for husbands, mothers, mothers-in-law, and family companions. You are the first line of defense in protecting the mother and newborn.",
      hi: "पति, सास, मां और परिजनों के लिए गाइड। आप मां और नवजात की सुरक्षा की पहली ढाल हैं।",
      bn: "স্বামী, শাশুড়ি, মা ও পরিবারের সদস্যদের নির্দেশিকা। মা ও নবজাতকের সুরক্ষায় আপনিই প্রথম ভরসা।"
    },
    dangerSigns: [
      {
        title: { en: "1. Severe Bleeding", hi: "1. अत्यधिक रक्तस्राव", bn: "১. অতিরিক্ত রক্তক্ষরণ" },
        text: {
          en: "Soaking more than one pad in an hour or passing large blood clots. This is a medical emergency — transport to hospital immediately.",
          hi: "1 घंटे में एक से अधिक पैड भीगना या बड़े खून के थक्के आना। तुरंत अस्पताल ले जाएं।",
          bn: "১ ঘণ্টায় ১টির বেশি প্যাড ভিজে যাওয়া বা বড় রক্তের চাকা বের হওয়া। অবিলম্বে হাসপাতালে নিন।"
        },
        urgency: "RED"
      },
      {
        title: { en: "2. High Fever or Chills", hi: "2. तेज बुखार या कंपकंपी", bn: "২. তীব্র জ্বর বা কাঁপুনি" },
        text: {
          en: "Temperature 38°C (100.4°F) or above, or foul-smelling lochia discharge. Indicates an internal infection.",
          hi: "38°C (100.4°F) या अधिक बुखार, या दुर्गंधयुक्त स्राव। आंतरिक संक्रमण का संकेत है।",
          bn: "৩৮°C (১০০.৪°F) বা তার বেশি জ্বর, বা দুর্গন্ধযুক্ত স্রাব। ভেতরের সংক্রমণের ইঙ্গিত।"
        },
        urgency: "AMBER"
      },
      {
        title: { en: "3. Severe Headache & Blurred Vision", hi: "3. तेज सिरदर्द और धुंधलापन", bn: "৩. তীব্র মাথাব্যথা ও ঝাপসা দৃষ্টি" },
        text: {
          en: "Could be sudden dangerous high blood pressure (postpartum eclampsia). Requires emergency care to prevent seizures.",
          hi: "अचानक खतरनाक रूप से बढ़ा हुआ रक्तचाप हो सकता है। दौरे रोकने के लिए आपातकालीन देखभाल जरूरी है।",
          bn: "হঠাৎ বিপজ্জনক উচ্চ রক্তচাপের লক্ষণ হতে পারে। খিঁচুনি রোধে জরুরি চিকিৎসা প্রয়োজন।"
        },
        urgency: "RED"
      },
      {
        title: { en: "4. Chest Pain & Severe Breathlessness", hi: "4. सीने में दर्द और सांस फूलना", bn: "৪. বুকে ব্যথা ও প্রচণ্ড শ্বাসকষ্ট" },
        text: {
          en: "Difficulty breathing, coughing blood, or chest tightness can indicate a blood clot in lungs (pulmonary embolism).",
          hi: "सांस लेने में भारी कठिनाई या सीने में जकड़न। तुरंत 108 पर कॉल करें।",
          bn: "শ্বাস নিতে প্রচণ্ড কষ্ট বা বুকে চাপ। দ্রুত ১০৮ নম্বরে ফোন করুন।"
        },
        urgency: "RED"
      },
      {
        title: { en: "5. Deep Emotional Distress or Isolation", hi: "5. अत्यधिक मानसिक तनाव या उदासी", bn: "৫. গভীর মানসিক কষ্ট বা নিজেকে গুটিয়ে নেওয়া" },
        text: {
          en: "Crying inconsolably, feeling unable to care for baby, or expressing self-harm thoughts. Listen without judgment, never blame her, and contact support.",
          hi: "लगातार रोना, बच्चे को न संभाल पाना, या खुद को नुकसान पहुंचाने की बात कहना। बिना डांटे बात सुनें और मदद लें।",
          bn: "টানা কান্না, শিশুর যত্ন নিতে অক্ষম বোধ করা, বা নিজেকে আঘাতের কথা বলা। সহানুভূতি দিয়ে শুনুন এবং সহায়তা নিন।"
        },
        urgency: "RED"
      }
    ],
    supportiveTips: [
      {
        en: "Ensure the mother rests horizontally for at least 8 hours a day.",
        hi: "मां को दिन में कम से कम 8 घंटे आराम करने दें और घरेलू काम का बोझ न डालें।",
        bn: "মাকে দিনে অন্তত ৮ ঘণ্টা বিশ্রাম নিতে দিন এবং ঘরের কাজের চাপ দেবেন না।"
      },
      {
        en: "Encourage frequent fluids, nutritious dal, green vegetables, milk, and eggs/protein.",
        hi: "मां को भरपूर पानी, दाल, हरी सब्जियां, दूध और पौष्टिक आहार दें।",
        bn: "মাকে পর্যাপ্ত জল, ডাল, শাকসবজি, দুধ ও পুষ্টিকর খাবার দিন।"
      },
      {
        en: "Remind and accompany her to all 4 WHO postnatal check-up visits.",
        hi: "विश्व स्वास्थ्य संगठन (WHO) द्वारा तय चारों प्रसवोत्तर जांचों में साथ जाएं।",
        bn: "বিশ্ব স্বাস্থ্য সংস্থার ৪টি প্রসবোত্তর চেক-আপের প্রতিটিতে মায়ের সাথে যান।"
      }
    ]
  }
};

/**
 * Text-to-speech engine using Web Speech API
 */
const AudioCompanion = {
  isSupported: () => "speechSynthesis" in window,
  isPlaying: false,

  speak: function(text, lang = "en", onStart = null, onEnd = null) {
    if (!this.isSupported()) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice or language code
    const langCodes = {
      en: "en-IN",
      hi: "hi-IN",
      bn: "bn-IN"
    };
    utterance.lang = langCodes[lang] || "en-US";
    utterance.rate = 0.9; // slightly slower for clear healthcare comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isPlaying = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.isPlaying = false;
      console.warn("Speech synthesis notice:", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stop: function() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.isPlaying = false;
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EDUCATION_DATA, AudioCompanion };
} else {
  window.EDUCATION_DATA = EDUCATION_DATA;
  window.AudioCompanion = AudioCompanion;
}
