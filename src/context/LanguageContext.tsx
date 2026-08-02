import { createContext, useContext, useState, type ReactNode } from 'react'

type Lang = 'en' | 'bn'

const dict = {
  en: {
    tagline: "Paste any message or link. Know in one second if it's a scam.",
    placeholder: 'Paste the suspicious message or link here...',
    checkNow: 'Check now',
    tryExample: 'Try an example',
    clear: 'Clear',
    checker: 'Checker',
    history: 'My history',
    report: 'Report',
    signOut: 'Sign out',
    signIn: 'Sign in',
    whyFlagged: 'Why we flagged this',
    riskScore: 'Risk score',
    empty: 'Nothing to check yet.',
    reportPrompt: 'Seen a scam we missed? Help others by reporting it.',
    reportPlaceholder: 'Paste the scam message you received...',
    submitReport: 'Submit report',
    noHistory: "You haven't checked anything yet.",
  },
  bn: {
    tagline: 'যেকোনো মেসেজ বা লিংক পেস্ট করুন। এক সেকেন্ডে জেনে নিন এটা স্ক্যাম কিনা।',
    placeholder: 'সন্দেহজনক মেসেজ বা লিংক এখানে পেস্ট করুন...',
    checkNow: 'চেক করুন',
    tryExample: 'উদাহরণ দেখুন',
    clear: 'মুছে ফেলুন',
    checker: 'চেকার',
    history: 'আমার হিস্টোরি',
    report: 'রিপোর্ট',
    signOut: 'সাইন আউট',
    signIn: 'সাইন ইন',
    whyFlagged: 'কেন এটা ফ্ল্যাগ করা হলো',
    riskScore: 'ঝুঁকির মাত্রা',
    empty: 'এখনো কিছু চেক করা হয়নি।',
    reportPrompt: 'এমন কোনো স্ক্যাম দেখেছেন যা আমরা মিস করেছি? রিপোর্ট করে অন্যদের সাহায্য করুন।',
    reportPlaceholder: 'আপনি যে স্ক্যাম মেসেজ পেয়েছেন সেটা পেস্ট করুন...',
    submitReport: 'রিপোর্ট জমা দিন',
    noHistory: 'আপনি এখনো কিছু চেক করেননি।',
  },
} as const

type DictKey = keyof typeof dict.en

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: DictKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = (key: DictKey) => dict[lang][key]
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
