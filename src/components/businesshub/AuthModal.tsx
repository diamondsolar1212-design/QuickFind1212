'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Mail, Lock, User, Phone, ShoppingBag, Store, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
  defaultRole?: 'CUSTOMER' | 'BUSINESS_OWNER'
}

export function AuthModal({ open, onClose, defaultRole }: Props) {
  const { t } = useI18n()
  const { setUser, setShowListModal } = useApp()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'CUSTOMER' | 'BUSINESS_OWNER'>(defaultRole || 'CUSTOMER')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('raj@businesshub.in')
  const [password, setPassword] = useState('demo123')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Default role passed in by parent (e.g. owner signup CTA)
  if (defaultRole && role !== defaultRole) setRole(defaultRole)

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Email and password required')
      return
    }
    if (mode === 'signup' && !name) {
      toast.error('Name required for signup')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined, phone: phone || undefined, role })
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        toast.success(mode === 'login' ? `Welcome back, ${data.user.name || email}!` : 'Account created!')
        onClose()
        // If business owner signed up, auto-open list modal
        if (mode === 'signup' && role === 'BUSINESS_OWNER') {
          setTimeout(() => setShowListModal(true), 300)
        }
      } else {
        toast.error(data.error || 'Authentication failed')
      }
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand to-brand/85 px-6 py-7 text-brand-foreground">
          <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t('login_title')}
          </DialogTitle>
          <DialogDescription className="text-brand-foreground/80 mt-1">
            {t('login_subtitle')}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-5">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRole('CUSTOMER')}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                role === 'CUSTOMER' ? 'border-brand bg-brand-soft/30' : 'border-border bg-card hover:border-brand/40'
              }`}
            >
              <ShoppingBag className={`w-5 h-5 mb-1 ${role === 'CUSTOMER' ? 'text-brand' : 'text-muted-foreground'}`} />
              <div className="font-semibold text-sm">{t('login_roleCustomer')}</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{t('login_roleCustomerDesc')}</div>
            </button>
            <button
              onClick={() => setRole('BUSINESS_OWNER')}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                role === 'BUSINESS_OWNER' ? 'border-brand bg-brand-soft/30' : 'border-border bg-card hover:border-brand/40'
              }`}
            >
              <Store className={`w-5 h-5 mb-1 ${role === 'BUSINESS_OWNER' ? 'text-brand' : 'text-muted-foreground'}`} />
              <div className="font-semibold text-sm">{t('login_roleOwner')}</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{t('login_roleOwnerDesc')}</div>
            </button>
          </div>

          <Separator />

          <div className="space-y-3">
            {mode === 'signup' && (
              <div>
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {t('login_name')}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Raj Kumar"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {t('login_email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {t('login_password')}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            {mode === 'signup' && (
              <div>
                <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {t('login_phone')}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 bg-brand hover:bg-brand/90 text-brand-foreground font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            {mode === 'login' ? t('login_signin') : t('login_signup')}
          </Button>

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setEmail('')
              setPassword('')
              setName('')
              setPhone('')
            }}
            className="w-full text-center text-sm text-brand hover:underline"
          >
            {mode === 'login' ? t('login_switchSignup') : t('login_switchSignin')}
          </button>

          {mode === 'login' && (
            <div className="text-xs text-center text-muted-foreground p-2 rounded-md bg-muted/30">
              {t('login_demo')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
