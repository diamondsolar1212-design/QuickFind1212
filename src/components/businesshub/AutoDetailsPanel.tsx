'use client'

import { Check, Globe, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { BusinessDetailSuggestions } from '@/lib/business-details-suggestions'

interface Props {
  suggestions: BusinessDetailSuggestions
  category: string
  subcategory: string
  tags: string
  description: string
  submitting: boolean
  onCategory: (value: string) => void
  onSubcategory: (value: string) => void
  onToggleTag: (value: string) => void
  onDescription: (value: string) => void
  onContinue: () => void
  onPublish: () => void
  onClose: () => void
}

const chipBase =
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors'
const chipActive = 'border-brand bg-brand text-brand-foreground'
const chipIdle = 'border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand-soft/30'

export function AutoDetailsPanel({
  suggestions,
  category,
  subcategory,
  tags,
  description,
  submitting,
  onCategory,
  onSubcategory,
  onToggleTag,
  onDescription,
  onContinue,
  onPublish,
  onClose
}: Props) {
  const selectedTags = tags
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="w-8 h-8 rounded-full bg-brand text-brand-foreground flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="text-sm font-semibold">Auto-created details</div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Choose what fits your business. The live preview on the right updates as you select.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close auto-created details"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wide">Category</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {suggestions.categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategory(item)}
                className={`${chipBase} ${item === category ? chipActive : chipIdle}`}
              >
                {item}
                {item === category && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wide">Subcategory</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {suggestions.subcategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSubcategory(item)}
                className={`${chipBase} ${item === subcategory ? chipActive : chipIdle}`}
              >
                {item}
                {item === subcategory && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wide">Tags / keywords</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {suggestions.tags.map((tag) => {
              const active = selectedTags.includes(tag.toLowerCase())
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`${chipBase} ${active ? chipActive : chipIdle}`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wide">Description</Label>
          <div className="space-y-2 mt-1.5">
            {suggestions.descriptions.map((text, index) => {
              const active = description.trim() === text
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onDescription(text)}
                  className={`w-full text-left rounded-lg border-2 p-2.5 transition-all ${
                    active ? 'border-brand bg-brand-soft/20' : 'border-border hover:border-brand/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-brand' : 'text-muted-foreground'}`}>
                      Option {index + 1}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 text-brand ml-auto" />}
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground/90">{text}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/60">
        <Button size="sm" onClick={onContinue} className="bg-brand hover:bg-brand/90 text-brand-foreground h-8">
          <Check className="w-3.5 h-3.5 mr-1" />
          Use these details
        </Button>
        <Button size="sm" variant="outline" onClick={onPublish} disabled={submitting} className="h-8">
          {submitting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1" />}
          Auto-create &amp; publish
        </Button>
        <span className="text-[10px] text-muted-foreground">You can edit everything after.</span>
      </div>
    </div>
  )
}
