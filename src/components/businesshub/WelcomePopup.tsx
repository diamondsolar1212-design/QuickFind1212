'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sparkles, Store, Crown, MapPin, Camera, Palette, Eye, X, ChevronRight,
  Star, ShieldCheck, Globe
} from 'lucide-react'

interface Props {
  onClose: () => void
  onStart: () => void  // Triggered when user clicks "Start Building"
}

export function WelcomePopup({ onClose, onStart }: Props) {
  const [step, setStep] = useState(0)

  const slides = [
    {
      title: 'Build Your Professional Business Website',
      subtitle: 'Free for all businesses · No coding required',
      emoji: '🎨',
      icon: Sparkles,
      gradient: 'from-brand to-amber-500',
      description: 'Create a stunning online presence for your business in minutes. Pick from beautiful templates, customize colors & fonts, upload images — your website is ready to share!',
      features: [
        { icon: Palette, text: '9 professional website templates for every business type' },
        { icon: Crown, text: 'Custom theme colors, fonts, and layout styles' },
        { icon: Camera, text: 'Upload profile image + up to 6 gallery photos' },
        { icon: Eye, text: 'Live preview as you customize' }
      ],
      cta: 'See How It Works'
    },
    {
      title: '9 Templates, 9 Distinct Looks',
      subtitle: 'Each template styles your gallery, products and sections differently',
      emoji: '🖼️',
      icon: Camera,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Pick the template that fits your business — your uploaded images and catalogue automatically adapt to that template\'s layout and colour palette.',
      features: [
        { icon: Sparkles, text: 'Calm Sage: soft editorial sand & sage tones' },
        { icon: Star, text: 'Jungle Gold: dark luxury monograph' },
        { icon: Crown, text: 'Athletic Bold: high-energy black & orange' },
        { icon: Globe, text: 'Tech Lime & Journalism Red: modern editorial styles' }
      ],
      cta: 'See Customization Options'
    },
    {
      title: 'Everything You Need to Get Online',
      subtitle: 'Free features included with every listing',
      emoji: '🚀',
      icon: Store,
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Your business gets a shareable website link, live map location, customer reviews, contact buttons — all in one place.',
      features: [
        { icon: Globe, text: 'Shareable website link (?biz=YOUR_ID)' },
        { icon: MapPin, text: 'Live map location + Get Directions' },
        { icon: ShieldCheck, text: 'Verified badge eligibility' },
        { icon: Star, text: 'Customer reviews & rating system' }
      ],
      cta: 'Start Building My Website'
    }
  ]

  const current = slides[step]
  const Icon = current.icon

  const handleCta = () => {
    if (step < slides.length - 1) {
      setStep(step + 1)
    } else {
      onStart()
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-br ${current.gradient} p-6 text-white rounded-t-2xl`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl flex-shrink-0">
              {current.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <Icon className="w-5 h-5 mb-1 opacity-90" />
              <h2 className="text-xl font-bold leading-tight">{current.title}</h2>
              <p className="text-xs opacity-90 mt-0.5">{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/85 leading-relaxed">
            {current.description}
          </p>

          {/* Features list */}
          <div className="space-y-2.5">
            {current.features.map((f, i) => {
              const FIcon = f.icon
              return (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <div className="w-8 h-8 rounded-md bg-brand-soft flex items-center justify-center flex-shrink-0">
                    <FIcon className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-xs text-foreground/85 pt-1.5 leading-relaxed">{f.text}</span>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-muted-foreground"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleCta}
              className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-bold h-11 group"
            >
              {current.cta}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

          {/* Skip link */}
          {step < slides.length - 1 && (
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-brand pt-1"
            >
              Skip introduction →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
