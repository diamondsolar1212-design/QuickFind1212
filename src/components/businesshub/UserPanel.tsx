'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Store, Edit3, Trash2, Star, MapPin, Eye, Crown, ShieldCheck, Save,
  User as UserIcon, Phone, Mail, Lock, Calendar, TrendingUp, Plus, X
} from 'lucide-react'
import { useApp, type Business, type User } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { toast } from 'sonner'

interface Props {
  onClose: () => void
}

export function UserPanel({ onClose }: Props) {
  const { user, setUser, setShowListModal, setSelectedBusinessId } = useApp()
  const { t } = useI18n()
  const [tab, setTab] = useState<'overview' | 'businesses' | 'profile'>('overview')

  const [myBusinesses, setMyBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const fetchMyBusinesses = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/user/businesses?userId=${user.id}`)
      const data = await res.json()
      setMyBusinesses(data.businesses || [])
    } catch {
      setMyBusinesses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => fetchMyBusinesses(), 0)
      return () => clearTimeout(t)
    }
  }, [user])

  const handleDeleteBusiness = async (businessId: string) => {
    if (!user) return
    if (!confirm('Are you sure? This will permanently delete this business listing.')) return
    try {
      const res = await fetch('/api/user/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, businessId, action: 'delete' })
      })
      if (res.ok) {
        toast.success('Business deleted')
        window.dispatchEvent(new CustomEvent('business-changed'))
        fetchMyBusinesses()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleSaveBusiness = async () => {
    if (!user || !editingBusiness) return
    try {
      const res = await fetch('/api/user/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          businessId: editingBusiness.id,
          action: 'update',
          updates: editingBusiness
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Business updated!')
        window.dispatchEvent(new CustomEvent('business-changed'))
        setEditingBusiness(null)
        fetchMyBusinesses()
      } else {
        toast.error(data?.error || 'Failed to update')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, updates: profileForm })
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        toast.success('Profile updated!')
        setProfileForm({ ...profileForm, currentPassword: '', newPassword: '' })
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Network error')
    }
    setSavingProfile(false)
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-navy text-navy-foreground shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-lg">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-base leading-tight">
                {user.name || user.email.split('@')[0]}
              </div>
              <div className="text-[11px] text-navy-foreground/70 flex items-center gap-1.5">
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-navy-foreground/40 text-navy-foreground font-semibold">
                  {user.role === 'BUSINESS_OWNER' ? 'BUSINESS OWNER' : 'CUSTOMER'}
                </Badge>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-navy-foreground hover:bg-navy-foreground/10">
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
        </div>
        {/* Tab strip */}
        <div className="border-t border-navy-foreground/10">
          <div className="max-w-[1600px] mx-auto px-4 flex">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'businesses', label: 'My Businesses', icon: Store },
              { id: 'profile', label: 'Profile Settings', icon: UserIcon }
            ].map((tabItem) => {
              const Icon = tabItem.icon
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    tab === tabItem.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-navy-foreground/70 hover:text-navy-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tabItem.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* ===== Overview Tab ===== */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy mb-1">Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h2>
              <p className="text-sm text-muted-foreground">Manage your businesses, profile, and account settings.</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'My Businesses', value: myBusinesses.length, icon: Store, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Premium Listings', value: myBusinesses.filter(b => b.premium).length, icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Verified', value: myBusinesses.filter(b => b.verified).length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Total Reviews', value: myBusinesses.reduce((s, b) => s + b.reviewCount, 0), icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <Card key={i} className="border-border/60 shadow-sm">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold text-navy">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick actions */}
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-navy mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowListModal(true)}
                    className="h-12 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold justify-start"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    List New Business
                  </Button>
                  <Button
                    onClick={() => setTab('businesses')}
                    variant="outline"
                    className="h-12 border-blue-500/30 text-blue-700 hover:bg-blue-50 font-semibold justify-start"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    Manage My Businesses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent businesses preview */}
            {myBusinesses.length > 0 && (
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-navy">Recent Businesses</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab('businesses')} className="text-blue-700 text-xs font-semibold">
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {myBusinesses.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: `${b.imageColor}15` }}
                        >
                          {b.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-navy truncate flex items-center gap-1.5">
                            {b.name}
                            {b.verified && <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                            {b.premium && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-brand text-brand" />
                            {b.rating.toFixed(1)} · {b.reviewCount} reviews · {b.city}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedBusinessId(b.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== My Businesses Tab ===== */}
        {tab === 'businesses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">My Businesses</h2>
                <p className="text-sm text-muted-foreground">{myBusinesses.length} {myBusinesses.length === 1 ? 'business' : 'businesses'} · Manage your listings</p>
              </div>
              <Button onClick={() => setShowListModal(true)} className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-9">
                <Plus className="w-4 h-4 mr-1" />
                Add Business
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myBusinesses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Store className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <h3 className="font-bold text-navy mb-1">No businesses yet</h3>
                  <p className="text-sm text-muted-foreground mb-3">List your first business to get started.</p>
                  <Button onClick={() => setShowListModal(true)} className="bg-brand hover:bg-brand/90 text-brand-foreground">
                    <Plus className="w-4 h-4 mr-1" />
                    List Your Business
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myBusinesses.map((b) => (
                  <Card key={b.id} className="border-border/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${b.imageColor} 0%, ${b.imageColor}dd 100%)` }}
                        >
                          {b.profileImage ? (
                            <img src={b.profileImage} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            b.emoji
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-navy flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="truncate">{b.name}</span>
                              {b.verified && <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                              {b.premium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="View"
                                onClick={() => setSelectedBusinessId(b.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-700 hover:bg-blue-50"
                                title="Edit"
                                onClick={() => setEditingBusiness({ ...b })}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                title="Delete"
                                onClick={() => handleDeleteBusiness(b.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs mb-1.5 flex-wrap">
                            <span className="flex items-center gap-0.5 bg-brand-soft text-foreground font-bold px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-brand text-brand" />
                              {b.rating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">({b.reviewCount} reviews)</span>
                            <span className="text-blue-700 font-semibold">{b.category}</span>
                            <span className="text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {b.city}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{b.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== Profile Settings Tab ===== */}
        {tab === 'profile' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h2 className="text-xl font-bold text-navy">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your account information</p>
            </div>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-brand" />
                  Personal Information
                </h3>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-3 h-3" />
                    Email Address
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="mt-1 bg-muted text-muted-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs">
                    <UserIcon className="w-3 h-3" />
                    Full Name
                  </Label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-1"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-3 h-3" />
                    Phone Number
                  </Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand" />
                  Change Password
                </h3>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Lock className="w-3 h-3" />
                    Current Password
                  </Label>
                  <Input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="mt-1"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs">
                    <Lock className="w-3 h-3" />
                    New Password
                  </Label>
                  <Input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="mt-1"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !profileForm.currentPassword || !profileForm.newPassword}
                  variant="outline"
                  className="border-blue-500/30 text-blue-700 hover:bg-blue-50"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-navy flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-brand" />
                  Account Info
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type</span>
                    <span className="font-semibold text-navy">{user.role === 'BUSINESS_OWNER' ? 'Business Owner' : 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{user.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ===== Edit Business Modal ===== */}
      {editingBusiness && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/60 px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand" />
                Edit Business
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingBusiness(null)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label className="text-xs">Business Name</Label>
                <Input
                  value={editingBusiness.name}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <textarea
                  value={editingBusiness.description}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                  className="mt-1 w-full min-h-[80px] px-3 py-2 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={editingBusiness.phone}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">WhatsApp</Label>
                  <Input
                    value={editingBusiness.whatsapp || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={editingBusiness.email || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Website</Label>
                  <Input
                    value={editingBusiness.website || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, website: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Input
                  value={editingBusiness.address}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input
                    value={editingBusiness.city}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">State</Label>
                  <Input
                    value={editingBusiness.state}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, state: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Pincode</Label>
                  <Input
                    value={editingBusiness.pincode || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, pincode: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  onClick={handleSaveBusiness}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingBusiness(null)}
                  className="border-border"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
