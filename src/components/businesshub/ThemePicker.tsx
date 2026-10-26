'use client'

import { useApp, type DesignTheme } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Check, X, Palette, Sparkles, Moon, Leaf, Newspaper, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ThemeOption {
  id: DesignTheme
  name: string
  description: string
  icon: any
  preview: {
    bg: string
    card: string
    accent: string
    text: string
  }
}

const THEMES: ThemeOption[] = [
  {
    id: 'justdial',
    name: 'JustDial Classic',
    description: 'White + green + orange. List-style rows with big CALL button.',
    icon: Sparkles,
    preview: {
      bg: '#f5fbf5',
      card: '#ffffff',
      accent: '#0a8754',
      text: '#0f1729'
    }
  },
  {
    id: 'dark-gold',
    name: 'Premium Dark Gold',
    description: 'Navy + gold glassmorphism. Luxury feel for premium showcases.',
    icon: Moon,
    preview: {
      bg: '#0f1729',
      card: '#1e293b',
      accent: '#fbbf24',
      text: '#f8fafc'
    }
  },
  {
    id: 'mint',
    name: 'Modern Mint Pastel',
    description: 'Soft mint + coral. Friendly rounded cards with gentle shadows.',
    icon: Leaf,
    preview: {
      bg: '#f0fdf9',
      card: '#ffffff',
      accent: '#14b8a6',
      text: '#1f2937'
    }
  },
  {
    id: 'editorial',
    name: 'Editorial Bold',
    description: 'Black/white/red magazine style with serif headlines.',
    icon: Newspaper,
    preview: {
      bg: '#ffffff',
      card: '#ffffff',
      accent: '#dc2626',
      text: '#000000'
    }
  }
]

export function ThemePicker() {
  const { theme, setTheme, showThemePicker, setShowThemePicker } = useApp()
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  if (!showThemePicker) {
    return (
      <button
        onClick={() => setShowThemePicker(true)}
        className="fixed bottom-4 left-4 z-[200] bg-card border border-border shadow-lg rounded-full h-11 w-11 flex items-center justify-center hover:shadow-xl transition-shadow"
        title="Open design picker"
      >
        <Palette className="w-5 h-5 text-brand" />
      </button>
    )
  }

  const current = THEMES.find((th) => th.id === theme) || THEMES[0]

  return (
    <div className="fixed bottom-4 left-4 z-[200] bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-w-sm w-[calc(100vw-2rem)] sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand text-brand-foreground">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span className="font-bold text-sm">Choose Design</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowThemePicker(false)}
            className="p-1 hover:bg-brand-foreground/15 rounded"
            title="Hide picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current theme banner */}
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Currently Active</div>
        <div className="flex items-center gap-2">
          <current.icon className="w-4 h-4 text-brand" />
          <span className="font-bold text-sm">{current.name}</span>
          <Check className="w-4 h-4 text-verified ml-auto" />
        </div>
      </div>

      {/* Theme options */}
      <div className="max-h-[60vh] overflow-y-auto">
        {THEMES.map((opt) => {
          const Icon = opt.icon
          const isActive = theme === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`w-full flex items-stretch gap-3 p-3 text-left transition-colors border-b border-border/40 last:border-b-0 ${
                isActive ? 'bg-brand-soft/40' : 'hover:bg-muted/40'
              }`}
            >
              {/* Mini preview */}
              <div
                className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-border"
                style={{ background: opt.preview.bg }}
              >
                <div className="h-full p-1.5 flex flex-col gap-1">
                  <div
                    className="h-1.5 rounded-sm"
                    style={{ background: opt.preview.accent, width: '60%' }}
                  />
                  <div
                    className="flex-1 rounded-sm flex items-end p-1"
                    style={{ background: opt.preview.card, border: `1px solid ${opt.preview.text}20` }}
                  >
                    <div
                      className="w-3 h-1 rounded-sm"
                      style={{ background: opt.preview.accent }}
                    />
                  </div>
                  <div
                    className="h-1 rounded-sm"
                    style={{ background: opt.preview.text, opacity: 0.6, width: '80%' }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  <span className="font-bold text-sm">{opt.name}</span>
                  {isActive && (
                    <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] bg-verified text-white px-1.5 py-0.5 rounded font-semibold">
                      <Check className="w-2.5 h-2.5" />
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                  {opt.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border">
        <div className="text-[10px] text-muted-foreground text-center">
          Tap any option to preview live · Your choice is saved automatically
        </div>
      </div>
    </div>
  )
}
