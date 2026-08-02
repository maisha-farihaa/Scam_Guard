import { ShieldCheck } from 'lucide-react'

export default function LoadingCard() {
  return (
    <div className="animate-fadeIn rounded-2xl border border-border bg-bg-card p-7 flex items-center gap-4">
      <ShieldCheck className="text-brand animate-pulse" size={28} strokeWidth={2} />
      <div className="flex-1">
        <div className="h-3.5 w-40 bg-bg-input rounded-full animate-pulse mb-2" />
        <div className="h-2.5 w-24 bg-bg-input rounded-full animate-pulse" />
      </div>
    </div>
  )
}
