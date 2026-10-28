'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, MessageCircle, X, LogIn, Store, User as UserIcon, ImageIcon } from 'lucide-react'
import { useApp } from '@/store/app'
import { ChatModal } from '@/components/businesshub/ChatModal'

interface Thread {
  id: string
  businessId: string
  customerId: string
  business?: { id: string; name: string; profileImage?: string | null; city?: string | null; phone?: string | null }
  customer?: { id: string; name?: string | null; email?: string | null }
  updatedAt: string
  lastMessage?: { body: string; imageUrl: string; senderRole: string; createdAt: string } | null
  unread: number
}

interface Props {
  open: boolean
  onClose: () => void
  onRequireAuth?: () => void
}

function relativeTime(value: string): string {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return ''
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function ChatInbox({ open, onClose, onRequireAuth }: Props) {
  const { user } = useApp()
  const [role, setRole] = useState<'customer' | 'business'>('customer')
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(false)
  const [activeThread, setActiveThread] = useState<Thread | null>(null)

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const load = async (initial: boolean) => {
      if (initial) setLoading(true)
      try {
        const res = await fetch(`/api/chat/conversations?userId=${encodeURIComponent(user.id)}&role=${role}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not load chats')
        if (!cancelled) setThreads(data.conversations || [])
      } catch {
        if (!cancelled && initial) setThreads([])
      } finally {
        if (!cancelled) {
          setLoading(false)
          timer = setTimeout(() => load(false), 8000)
        }
      }
    }

    load(true)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [open, user?.id, role])

  const partnerName = (thread: Thread) => {
    if (role === 'business') return thread.customer?.name || thread.customer?.email || 'Customer'
    return thread.business?.name || 'Business'
  }

  const partnerImage = (thread: Thread) => {
    return role === 'business' ? '' : thread.business?.profileImage || ''
  }

  return (
    <>
      <Dialog open={open && !activeThread} onOpenChange={(value) => { if (!value) onClose() }}>
        <DialogContent className="max-w-md w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Your chats</DialogTitle>
          <div className="flex items-center gap-2 px-4 py-3 bg-navy text-navy-foreground">
            <MessageCircle className="w-5 h-5 text-brand" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Messages</p>
              <p className="text-[11px] text-navy-foreground/70">Live chat with photos</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-navy-foreground/70 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!user ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-brand/10 mx-auto flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-brand" />
              </div>
              <p className="font-semibold text-navy mb-1">Sign in to see your chats</p>
              <p className="text-xs text-muted-foreground mb-4">Messages stay in sync between you and businesses.</p>
              <Button onClick={() => { onClose(); onRequireAuth?.() }} className="bg-brand text-brand-foreground">
                <LogIn className="w-4 h-4 mr-2" /> Sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-1 px-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${
                    role === 'customer' ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" /> As customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('business')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${
                    role === 'business' ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> As business
                </button>
              </div>

              <div className="max-h-[420px] min-h-[240px] overflow-y-auto p-2">
                {loading && threads.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading chats…
                  </div>
                ) : threads.length === 0 ? (
                  <div className="h-52 flex flex-col items-center justify-center text-center px-8">
                    <MessageCircle className="w-9 h-9 text-brand/40 mb-2" />
                    <p className="text-sm font-semibold text-navy">No chats yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role === 'customer'
                        ? 'Tap “Live Chat” on any business card to start talking.'
                        : 'Customer messages to your listings will appear here.'}
                    </p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setActiveThread(thread)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {partnerImage(thread) ? <AvatarImage src={partnerImage(thread)} alt={partnerName(thread)} /> : null}
                        <AvatarFallback className="bg-brand/15 text-brand text-xs font-bold">
                          {partnerName(thread).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-navy truncate">{partnerName(thread)}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{relativeTime(thread.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {thread.lastMessage?.imageUrl && !thread.lastMessage?.body ? (
                            <><ImageIcon className="w-3 h-3" /> Photo</>
                          ) : thread.lastMessage?.body ? (
                            <>{thread.lastMessage.senderRole === role ? 'You: ' : ''}{thread.lastMessage.body}</>
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                      </div>
                      {thread.unread > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {thread.unread > 9 ? '9+' : thread.unread}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ChatModal
        open={open && !!activeThread}
        onClose={() => setActiveThread(null)}
        conversationId={activeThread?.id || null}
        businessName={activeThread ? partnerName(activeThread) : ''}
        businessId={activeThread?.businessId || null}
        onRequireAuth={onRequireAuth}
      />
    </>
  )
}
