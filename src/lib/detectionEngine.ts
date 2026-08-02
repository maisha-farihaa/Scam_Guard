export type RiskLevel = 'red' | 'yellow' | 'green'

export interface Reason {
  id: string
  title: string
  detail: string
  weight: number
  icon: 'clock' | 'lock' | 'link' | 'gift' | 'user-x' | 'alert-triangle'
}

export interface DetectionResult {
  score: number
  level: RiskLevel
  label: string
  reasons: Reason[]
}

// --- Keyword banks (Bangla + English) -------------------------------------

const URGENCY_WORDS = [
  'জরুরি', 'এখনই', 'দ্রুত', 'সাথে সাথে', 'নাহলে বন্ধ', 'শেষ সুযোগ',
  'urgent', 'immediately', 'right now', 'act now', 'final warning', 'expire',
]

const SECRET_CODE_WORDS = [
  'otp', 'ওটিপি', 'পিন', 'pin code', 'পাসওয়ার্ড', 'password', 'verification code',
  'সিকিউরিটি কোড', 'security code',
]

const IMPERSONATION_WORDS = [
  'bkash', 'বিকাশ', 'nagad', 'নগদ', 'rocket', 'রকেট', 'agent', 'এজেন্ট',
  'customer care', 'কাস্টমার কেয়ার', 'হেড অফিস', 'head office', 'support team',
]

const PRIZE_WORDS = [
  'লটারি', 'lottery', 'পুরস্কার', 'prize', 'জিতেছেন', 'won', 'gift', 'উপহার',
  'free', 'ফ্রি', 'congratulations', 'অভিনন্দন', 'cash back', 'ক্যাশব্যাক',
]

const ACCOUNT_THREAT_WORDS = [
  'বন্ধ হয়ে যাবে', 'account blocked', 'suspended', 'ব্লক', 'lock',
  'বাতিল হবে', 'verify your account', 'ভেরিফাই করুন',
]

const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'cutt.ly', 'shorte.st', 'ow.ly', 'buff.ly',
]

// Domains that are the real, legitimate ones — anything *resembling* these
// but not exactly matching is treated as suspicious impersonation.
const PROTECTED_BRANDS: Record<string, string[]> = {
  bkash: ['bkash.com'],
  nagad: ['nagad.com.bd'],
  rocket: ['rocket.com.bd'],
}

function extractUrls(text: string): string[] {
  const regex = /(https?:\/\/[^\s]+)|(\bwww\.[^\s]+)/gi
  return text.match(regex) || []
}

function getDomain(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `http://${url}`
    return new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function containsAny(text: string, words: string[]): string[] {
  const lower = text.toLowerCase()
  return words.filter((w) => lower.includes(w.toLowerCase()))
}

export function analyzeMessage(rawText: string): DetectionResult {
  const text = rawText.trim()
  const reasons: Reason[] = []
  let score = 0

  if (!text) {
    return { score: 0, level: 'green', label: 'Nothing to check yet', reasons: [] }
  }

  // 1. Urgency pressure
  const urgencyHits = containsAny(text, URGENCY_WORDS)
  if (urgencyHits.length) {
    score += 20
    reasons.push({
      id: 'urgency',
      title: 'Urgency pressure detected',
      detail: `"${urgencyHits[0]}" — scammers rush you so you don't think twice.`,
      weight: 20,
      icon: 'clock',
    })
  }

  // 2. Secret code / OTP / PIN request
  const secretHits = containsAny(text, SECRET_CODE_WORDS)
  if (secretHits.length) {
    score += 30
    reasons.push({
      id: 'secret-code',
      title: 'Asks for a secret code or password',
      detail: `"${secretHits[0]}" — no real company ever asks for your OTP or PIN.`,
      weight: 30,
      icon: 'lock',
    })
  }

  // 3. Brand impersonation
  const brandHits = containsAny(text, IMPERSONATION_WORDS)
  if (brandHits.length) {
    score += 15
    reasons.push({
      id: 'impersonation',
      title: 'Claims to be a bank/wallet agent',
      detail: `Mentions "${brandHits[0]}" — impersonating an agent is the most common local scam pattern.`,
      weight: 15,
      icon: 'user-x',
    })
  }

  // 4. Prize / lottery bait
  const prizeHits = containsAny(text, PRIZE_WORDS)
  if (prizeHits.length) {
    score += 20
    reasons.push({
      id: 'prize',
      title: 'Prize or lottery bait',
      detail: `"${prizeHits[0]}" — you can't win something you never entered.`,
      weight: 20,
      icon: 'gift',
    })
  }

  // 5. Account threat
  const threatHits = containsAny(text, ACCOUNT_THREAT_WORDS)
  if (threatHits.length) {
    score += 15
    reasons.push({
      id: 'threat',
      title: 'Threatens to block your account',
      detail: `"${threatHits[0]}" — fear tactics push you to act without checking.`,
      weight: 15,
      icon: 'alert-triangle',
    })
  }

  // 6. URL analysis
  const urls = extractUrls(text)
  for (const url of urls) {
    const domain = getDomain(url)

    if (SHORTENER_DOMAINS.some((s) => domain.includes(s))) {
      score += 15
      reasons.push({
        id: `shortener-${domain}`,
        title: 'Shortened link detected',
        detail: `"${domain}" hides the real destination — scammers use this to disguise fake sites.`,
        weight: 15,
        icon: 'link',
      })
    }

    for (const [brand, officialDomains] of Object.entries(PROTECTED_BRANDS)) {
      const mentionsBrand = text.toLowerCase().includes(brand)
      const isOfficial = officialDomains.some((d) => domain === d)
      const looksLikeBrand = domain.includes(brand) && !isOfficial

      if ((mentionsBrand || looksLikeBrand) && !isOfficial && domain.includes(brand)) {
        score += 30
        reasons.push({
          id: `fake-domain-${domain}`,
          title: 'Fake look-alike domain',
          detail: `"${domain}" is not an official ${brand} domain — this is typosquatting.`,
          weight: 30,
          icon: 'link',
        })
      }
    }
  }

  score = Math.min(100, score)

  let level: RiskLevel = 'green'
  let label = 'Looks safe'
  if (score >= 66) {
    level = 'red'
    label = 'High risk — do not respond'
  } else if (score >= 31) {
    level = 'yellow'
    label = 'Caution — some red flags'
  }

  // Sort reasons by weight, most severe first
  reasons.sort((a, b) => b.weight - a.weight)

  return { score, level, label, reasons }
}

export const EXAMPLE_MESSAGES = [
  'প্রিয় গ্রাহক, আপনার bKash একাউন্ট বন্ধ হয়ে যাবে। জরুরি ভিত্তিতে আপনার OTP পাঠান এবং এখানে ক্লিক করুন: http://bkash-verify.xyz/win',
  'অভিনন্দন! আপনি গ্র্যামীণফোন লটারিতে ৫০,০০০ টাকা জিতেছেন। এখনই claim করুন: bit.ly/claim-prize',
  'হ্যালো, কাল বিকেল ৫টায় আমাদের মিটিং আছে, ভুলে যেও না।',
]
