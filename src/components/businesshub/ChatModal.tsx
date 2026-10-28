'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, ImagePlus, Send, MessageCircle, X, Check, CheckCheck, LogIn } from 'lucide-react'
import { useApp } from '@/store/app'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  senderId: string
  senderRole: string
  body: string
  imageUrl: string
  seenByCustomer: boolean
  seenByBusiness: boolean
  createdAt: string
}

interface Props {
  open: boolean
  onClose: () => void
  businessId?: string | null
  businessName?: string
  conversationId?: string | null
  onRequireAuth?: () => void
}

function timeLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function ChatModal({ open, onClose, businessId, businessName, conversationId, onRequireAuth }: Props) {
  const { user } = useApp()
  const [activeId, setActiveId] = useState<string | null>(conversationId || null)
  const [role, setRole] = useState<'customer' | 'business'>('customer')
  const [title, setTitle] = useState(businessName || 'Live chat')
  const [image, setImage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [starting, setStarting] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [])

  // Open the thread (reusing an existing conversation when there is one).
  useEffect(() => {
    if (!open) return
    if (conversationId) {
      setActiveId(conversationId)
      return
    }
    if (!user || !businessId) {
      setActiveId(null)
      return
    }
    let cancelled = false
    setStarting(true)
    fetch('/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, customerId: user.id })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not start chat')
        return data
      })
      .then((data) => {
        if (cancelled) return
        setActiveId(data.conversation?.id || null)
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Could not start chat')
      })
      .finally(() => {
        if (!cancelled) setStarting(false)
      })
    return () => { cancelled = true }
  }, [open, conversationId, businessId, user])

  // Poll the thread while the modal is open.
  useEffect(() => {
    if (!open || !activeId || !user) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const load = async (initial: boolean) => {
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${encodeURIComponent(activeId)}&userId=${encodeURIComponent(user.id)}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not load messages')
        if (cancelled) return
        setMessages(data.messages || [])
        if (data.role) setRole(data.role)
        if (data.conversation?.businessName) setTitle(data.conversation.businessName)
        if (data.conversation?.businessImage !== undefined) setImage(data.conversation.businessImage || '')
        if (initial) requestAnimationFrame(scrollToBottom)
      } catch (err: any) {
        if (!cancelled && initial) toast.error(err.message || 'Could not load messages')
      } finally {
        if (!cancelled) {
          setLoading(false)
          timer = setTimeout(() => load(false), 3000)
        }
      }
    }

    setLoading(messages.length === 0)
    load(true)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeId, user?.id])

  useEffect(() => {
    if (messages.length) requestAnimationFrame(scrollToBottom)
  }, [messages.length, scrollToBottom])

  const sendMessage = async (body: string, imageUrl = '') => {
    if (!activeId || !user) return
    if (!body.trim() && !imageUrl) return
    setSending(true)
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, senderId: user.id, body, imageUrl })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not send message')
      setText('')
      setMessages((prev) => [...prev, data.message])
      requestAnimationFrame(scrollToBottom)
    } catch (err: any) {
      toast.error(err.message || 'Could not send message')
    }
    setSending(false)
  }

  const handleUpload = async (file: File) => {
    if (!user) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      if (activeId) await sendMessage('', data.url)
      else toast.error('Chat is still opening — try again in a moment')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const participantName = role === 'business' ? 'You' : title

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose() }}>
      <DialogContent className="max-w-md w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Chat with {title}</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-navy text-navy-foreground">
          <Avatar className="h-9 w-9 border border-white/20">
            {image ? <AvatarImage src={image} alt={title} /> : null}
            <AvatarFallback className="bg-brand text-brand-foreground text-xs font-bold">
              {title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">{title}</p>
            <p className="text-[11px] text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              In-app chat · replies usually within a few minutes
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-navy-foreground/70 hover:text-white hover:bg-white/10"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!user ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand/10 mx-auto flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-brand" />
            </div>
            <p className="font-semibold text-navy mb-1">Sign in to start chatting</p>
            <p className="text-xs text-muted-foreground mb-4">Your chats are private between you and the business.</p>
            <Button onClick={() => { onClose(); onRequireAuth?.() }} className="bg-brand text-brand-foreground">
              <LogIn className="w-4 h-4 mr-2" /> Sign in
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="h-[380px] overflow-y-auto bg-muted/30 px-3 py-4 space-y-2">
              {starting || (loading && messages.length === 0) ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening chat…
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <MessageCircle className="w-9 h-9 text-brand/40 mb-2" />
                  <p className="text-sm font-semibold text-navy">Say hello to {title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask about pricing, availability or share a photo of what you need.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const mine = message.senderRole === role
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          mine
                            ? 'bg-brand text-brand-foreground rounded-br-sm'
                            : 'bg-card text-foreground border border-border/60 rounded-bl-sm'
                        }`}
                      >
                        {message.imageUrl && (
                          <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-1.5">
                            <img
                              src={message.imageUrl}
                              alt="Shared image"
                              className="rounded-lg max-h-56 w-auto object-cover"
                              loading="lazy"
                            />
                          </a>
                        )}
                        {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
                        <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${mine ? 'text-brand-foreground/70 justify-end' : 'text-muted-foreground'}`}>
                          <span>{timeLabel(message.createdAt)}</span>
                          {mine && (
                            message.senderRole === 'business'
                              ? message.seenByCustomer ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                              : message.seenByBusiness ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border/60 bg-card px-3 py-2.5">
              <div className="flex items-end gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) handleUpload(file)
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || sending || !activeId}
                  title="Send a photo"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                </Button>
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={`Message ${participantName}…`}
                  className="min-h-9 max-h-28 py-2 text-sm resize-none"
                  rows={1}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      if (!sending && text.trim()) sendMessage(text)
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 bg-brand text-brand-foreground"
                  disabled={sending || !text.trim() || !activeId}
                  onClick={() => sendMessage(text)}
                  title="Send"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 px-1">
                Photos up to 5MB · Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
