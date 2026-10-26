'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, Store, Users, Star, MapPin, Crown, ShieldCheck, Trash2,
  Edit3, Eye, X, Search, TrendingUp, CheckCircle2, AlertCircle, Lock,
  Mail, Phone, Calendar, Building2, PieChart, Database
} from 'lucide-react'
import { useApp, type Business, type User } from '@/store/app'
import { toast } from 'sonner'

interface Props {
  onClose: () => void
}

interface AdminStats {
  totalBusinesses: number
  totalUsers: number
  totalReviews: number
  verifiedCount: number
  premiumCount: number
  pendingVerification: number
  nonPremiumCount: number
  recentBusinesses: any[]
  businessesByCity: { city: string; count: number }[]
  businessesByCategory: { category: string; count: number }[]
}

export function AdminPanel({ onClose }: Props) {
  const { user } = useApp()
  const [tab, setTab] = useState<'dashboard' | 'businesses' | 'users'>('dashboard')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [businessesLoading, setBusinessesLoading] = useState(true)
  const [businessSearch, setBusinessSearch] = useState('')
  const [businessFilter, setBusinessFilter] = useState<'all' | 'verified' | 'premium' | 'pending'>('all')
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)

  const [users, setUsers] = useState<(User & { _count?: { businesses: number } })[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')

  const fetchStats = async () => {
    if (!user) return
    setStatsLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?adminId=${user.id}`)
      const data = await res.json()
      if (res.ok) setStats(data.stats)
    } catch {}
    setStatsLoading(false)
  }

  const fetchBusinesses = async () => {
    if (!user) return
    setBusinessesLoading(true)
    try {
      const params = new URLSearchParams({ adminId: user.id })
      if (businessSearch) params.set('q', businessSearch)
      if (businessFilter === 'verified') params.set('verified', 'true')
      if (businessFilter === 'premium') params.set('premium', 'true')
      const res = await fetch(`/api/admin/businesses?${params.toString()}`)
      const data = await res.json()
      let list = data.businesses || []
      if (businessFilter === 'pending') list = list.filter((b: Business) => !b.verified)
      setBusinesses(list)
    } catch {}
    setBusinessesLoading(false)
  }

  const fetchUsers = async () => {
    if (!user) return
    setUsersLoading(true)
    try {
      const res = await fetch(`/api/admin/users?adminId=${user.id}`)
      const data = await res.json()
      let list = data.users || []
      if (userSearch) {
        const q = userSearch.toLowerCase()
        list = list.filter((u: any) =>
          u.email.toLowerCase().includes(q) ||
          (u.name || '').toLowerCase().includes(q) ||
          (u.phone || '').includes(q)
        )
      }
      setUsers(list)
    } catch {}
    setUsersLoading(false)
  }

  useEffect(() => {
    if (user?.isAdmin) {
      const t = setTimeout(() => fetchStats(), 0)
      return () => clearTimeout(t)
    }
  }, [user])

  useEffect(() => {
    if (user?.isAdmin && tab === 'businesses') {
      const t = setTimeout(() => fetchBusinesses(), 0)
      return () => clearTimeout(t)
    }
  }, [user, tab, businessFilter])

  useEffect(() => {
    if (user?.isAdmin && tab === 'users') {
      const t = setTimeout(() => fetchUsers(), 0)
      return () => clearTimeout(t)
    }
  }, [user, tab])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === 'businesses' && user?.isAdmin) fetchBusinesses()
    }, 250)
    return () => clearTimeout(t)
  }, [businessSearch])

  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === 'users' && user?.isAdmin) fetchUsers()
    }, 250)
    return () => clearTimeout(t)
  }, [userSearch])

  const handleToggleVerified = async (business: Business) => {
    if (!user) return
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          businessId: business.id,
          action: 'update',
          updates: { verified: !business.verified }
        })
      })
      if (res.ok) {
        toast.success(`Business ${!business.verified ? 'verified' : 'unverified'}`)
        fetchBusinesses()
        fetchStats()
      }
    } catch {}
  }

  const handleTogglePremium = async (business: Business) => {
    if (!user) return
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          businessId: business.id,
          action: 'update',
          updates: { premium: !business.premium }
        })
      })
      if (res.ok) {
        toast.success(`Premium ${!business.premium ? 'enabled' : 'disabled'}`)
        fetchBusinesses()
        fetchStats()
      }
    } catch {}
  }

  const handleDeleteBusiness = async (businessId: string, name: string) => {
    if (!user) return
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, businessId, action: 'delete' })
      })
      if (res.ok) {
        toast.success('Business deleted')
        fetchBusinesses()
        fetchStats()
      }
    } catch {}
  }

  const handleSaveBusiness = async () => {
    if (!user || !editingBusiness) return
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          businessId: editingBusiness.id,
          action: 'update',
          updates: editingBusiness
        })
      })
      if (res.ok) {
        toast.success('Business updated')
        setEditingBusiness(null)
        fetchBusinesses()
      }
    } catch {}
  }

  const handleToggleUserRole = async (targetUser: User & { _count?: { businesses: number } }) => {
    if (!user) return
    const newRole = targetUser.role === 'BUSINESS_OWNER' ? 'CUSTOMER' : 'BUSINESS_OWNER'
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          userId: targetUser.id,
          action: 'update',
          updates: { role: newRole }
        })
      })
      if (res.ok) {
        toast.success(`Role changed to ${newRole === 'BUSINESS_OWNER' ? 'Business Owner' : 'Customer'}`)
        fetchUsers()
      }
    } catch {}
  }

  const handleToggleAdmin = async (targetUser: User & { _count?: { businesses: number } }) => {
    if (!user) return
    if (targetUser.id === user.id) {
      toast.error('Cannot modify your own admin status')
      return
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          userId: targetUser.id,
          action: 'update',
          updates: { isAdmin: !targetUser.isAdmin }
        })
      })
      if (res.ok) {
        toast.success(`Admin access ${!targetUser.isAdmin ? 'granted' : 'revoked'}`)
        fetchUsers()
      }
    } catch {}
  }

  const handleDeleteUser = async (targetUser: User & { _count?: { businesses: number } }) => {
    if (!user) return
    if (targetUser.id === user.id) {
      toast.error('Cannot delete your own account')
      return
    }
    if (!confirm(`Delete user "${targetUser.name || targetUser.email}"? Their businesses will also be deleted.`)) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id, userId: targetUser.id, action: 'delete' })
      })
      if (res.ok) {
        toast.success('User deleted')
        fetchUsers()
        fetchStats()
      }
    } catch {}
  }

  if (!user?.isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <Card className="border-red-200 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-navy mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You need admin privileges to access this panel.
            </p>
            <Button onClick={onClose} className="bg-navy hover:bg-navy/90 text-navy-foreground">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-navy to-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight flex items-center gap-2">
                Admin Panel
                <Badge className="bg-red-500 text-white hover:bg-red-500 text-[9px] py-0 px-1.5 font-bold">ADMIN</Badge>
              </div>
              <div className="text-[11px] text-white/70">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-4 h-4 mr-1" />
            Exit Admin
          </Button>
        </div>
        {/* Tab strip */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'businesses', label: 'Businesses', icon: Store },
              { id: 'users', label: 'Users', icon: Users }
            ].map((tabItem) => {
              const Icon = tabItem.icon
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    tab === tabItem.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-white/70 hover:text-white'
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ===== Dashboard Tab ===== */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-navy mb-1">Platform Overview</h2>
              <p className="text-sm text-muted-foreground">Real-time platform statistics and metrics</p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <Card key={i}><CardContent className="p-4"><div className="w-10 h-10 rounded-lg bg-muted animate-pulse mb-2" /><div className="h-7 bg-muted animate-pulse rounded w-1/2 mb-1" /><div className="h-3 bg-muted animate-pulse rounded w-3/4" /></CardContent></Card>
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Businesses', value: stats.totalBusinesses, icon: Store, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-700', bg: 'bg-purple-50' },
                    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Verified', value: stats.verifiedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Premium', value: stats.premiumCount, icon: Crown, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Pending Verification', value: stats.pendingVerification, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Non-Premium', value: stats.nonPremiumCount, icon: Store, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Avg Reviews/Biz', value: stats.totalBusinesses > 0 ? Math.round(stats.totalReviews / stats.totalBusinesses * 10) / 10 : 0, icon: TrendingUp, color: 'text-cyan-700', bg: 'bg-cyan-50' }
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

                {/* Two-column: City breakdown + Category breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-700" />
                        Businesses by City
                      </h3>
                      <div className="space-y-2">
                        {stats.businessesByCity.map((c, i) => {
                          const max = stats.businessesByCity[0]?.count || 1
                          return (
                            <div key={c.city} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-navy">{c.city}</span>
                                <span className="text-muted-foreground">{c.count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                                  style={{ width: `${(c.count / max) * 100}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-purple-700" />
                        Businesses by Category
                      </h3>
                      <div className="space-y-2 max-h-[280px] overflow-y-auto">
                        {stats.businessesByCategory.map((c, i) => {
                          const max = stats.businessesByCategory[0]?.count || 1
                          return (
                            <div key={c.category} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-navy truncate">{c.category}</span>
                                <span className="text-muted-foreground ml-2">{c.count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                                  style={{ width: `${(c.count / max) * 100}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent businesses */}
                <Card className="border-border/60 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-navy flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Recent Business Listings
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setTab('businesses')} className="text-blue-700 text-xs font-semibold">
                        View All →
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {stats.recentBusinesses.map((b) => (
                        <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                          <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center text-xl flex-shrink-0">
                            🏪
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-navy truncate flex items-center gap-1">
                              {b.name}
                              {b.verified && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                              {b.premium && <Crown className="w-3 h-3 text-amber-500" />}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {b.category} · {b.city} · Added {new Date(b.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {!b.verified && (
                            <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-700 bg-amber-50 font-semibold">
                              PENDING
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        )}

        {/* ===== Businesses Tab ===== */}
        {tab === 'businesses' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-navy">Business Management</h2>
              <p className="text-sm text-muted-foreground">Verify, feature, edit, or delete business listings</p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  placeholder="Search by name, city, category..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'verified', label: 'Verified' },
                  { id: 'premium', label: 'Premium' }
                ].map((f) => (
                  <Button
                    key={f.id}
                    size="sm"
                    variant={businessFilter === f.id ? 'default' : 'outline'}
                    onClick={() => setBusinessFilter(f.id as any)}
                    className={`h-9 text-xs ${businessFilter === f.id ? 'bg-brand text-brand-foreground' : ''}`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {businessesLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Card key={i}><CardContent className="p-4"><div className="flex gap-3"><div className="w-12 h-12 rounded-lg bg-muted animate-pulse" /><div className="flex-1 space-y-2"><div className="h-4 bg-muted animate-pulse rounded w-1/3" /><div className="h-3 bg-muted animate-pulse rounded w-1/2" /></div></div></CardContent></Card>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Store className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No businesses match your search</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  Showing {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
                </div>
                <div className="space-y-3">
                  {businesses.map((b: any) => (
                    <Card key={b.id} className="border-border/60 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div
                            className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden"
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
                              <h3 className="font-bold text-navy flex items-center gap-1.5 flex-wrap">
                                <span className="truncate">{b.name}</span>
                                {b.verified && <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                {b.premium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                                {b.isB2B && <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-blue-500/30 text-blue-700">B2B</Badge>}
                                {b.isB2C && <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-blue-500/30 text-blue-700">B2C</Badge>}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant={b.verified ? 'default' : 'outline'}
                                  onClick={() => handleToggleVerified(b)}
                                  className={`h-7 text-[11px] ${b.verified ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-500/40 text-emerald-700'}`}
                                  title={b.verified ? 'Unverify' : 'Verify business'}
                                >
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  {b.verified ? 'Verified' : 'Verify'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={b.premium ? 'default' : 'outline'}
                                  onClick={() => handleTogglePremium(b)}
                                  className={`h-7 text-[11px] ${b.premium ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'border-amber-500/40 text-amber-700'}`}
                                  title={b.premium ? 'Remove premium' : 'Make premium'}
                                >
                                  <Crown className="w-3 h-3 mr-1" />
                                  {b.premium ? 'Premium' : 'Feature'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-blue-700 hover:bg-blue-50"
                                  title="Edit"
                                  onClick={() => setEditingBusiness({ ...b })}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                  title="Delete"
                                  onClick={() => handleDeleteBusiness(b.id, b.name)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
                              <span className="font-bold text-blue-700">{b.category}</span>
                              {b.subcategory && <span className="text-muted-foreground">· {b.subcategory}</span>}
                              <span className="text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {b.city}, {b.state}
                              </span>
                              <span className="text-muted-foreground">·</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-brand text-brand" />
                                {b.rating.toFixed(1)} ({b.reviewCount})
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{b.description}</p>
                            {b.owner && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                                <Users className="w-3 h-3" />
                                Owner: <span className="font-semibold text-foreground/80">{b.owner.name}</span> ({b.owner.email})
                                {b.owner.phone && <span>· {b.owner.phone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== Users Tab ===== */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-navy">User Management</h2>
              <p className="text-sm text-muted-foreground">Manage user roles, admin access, and accounts</p>
            </div>

            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="pl-9"
              />
            </div>

            {usersLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Card key={i}><CardContent className="p-4"><div className="flex gap-3"><div className="w-12 h-12 rounded-full bg-muted animate-pulse" /><div className="flex-1 space-y-2"><div className="h-4 bg-muted animate-pulse rounded w-1/3" /><div className="h-3 bg-muted animate-pulse rounded w-1/2" /></div></div></CardContent></Card>
                ))}
              </div>
            ) : users.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No users match your search</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  Showing {users.length} {users.length === 1 ? 'user' : 'users'}
                </div>
                <div className="space-y-3">
                  {users.map((u: any) => (
                    <Card key={u.id} className="border-border/60 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {u.name?.[0] || u.email[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-navy flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{u.name || 'Unnamed User'}</span>
                                  {u.isAdmin && <Badge className="bg-red-500 hover:bg-red-500 text-white text-[9px] py-0 px-1.5 font-bold">ADMIN</Badge>}
                                  <Badge variant="outline" className={`text-[9px] py-0 px-1.5 font-semibold ${u.role === 'BUSINESS_OWNER' ? 'border-blue-500/40 text-blue-700 bg-blue-50' : 'border-slate-400/40 text-slate-600 bg-slate-50'}`}>
                                    {u.role === 'BUSINESS_OWNER' ? 'OWNER' : 'CUSTOMER'}
                                  </Badge>
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {u.email}
                                  </span>
                                  {u.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {u.phone}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Joined {new Date(u.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Store className="w-3 h-3" />
                                    {u._count?.businesses || 0} businesses
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleUserRole(u)}
                                  className="h-7 text-[11px] border-blue-500/30 text-blue-700 hover:bg-blue-50"
                                  title="Toggle role"
                                >
                                  Make {u.role === 'BUSINESS_OWNER' ? 'Customer' : 'Owner'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={u.isAdmin ? 'default' : 'outline'}
                                  onClick={() => handleToggleAdmin(u)}
                                  className={`h-7 text-[11px] ${u.isAdmin ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-red-500/30 text-red-700 hover:bg-red-50'}`}
                                  title="Toggle admin"
                                  disabled={u.id === user.id}
                                >
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  {u.isAdmin ? 'Admin' : 'Make Admin'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                  title="Delete user"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={u.id === user.id}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== Edit Business Modal (admin) ===== */}
      {editingBusiness && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/60 px-5 py-3 flex items-center justify-between">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand" />
                Admin Edit: {editingBusiness.name}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingBusiness(null)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Business Name</Label>
                  <Input value={editingBusiness.name} onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input value={editingBusiness.category} onChange={(e) => setEditingBusiness({ ...editingBusiness, category: e.target.value })} className="mt-1" />
                </div>
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
                  <Input value={editingBusiness.phone} onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">WhatsApp</Label>
                  <Input value={editingBusiness.whatsapp || ''} onChange={(e) => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={editingBusiness.email || ''} onChange={(e) => setEditingBusiness({ ...editingBusiness, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Website</Label>
                  <Input value={editingBusiness.website || ''} onChange={(e) => setEditingBusiness({ ...editingBusiness, website: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input value={editingBusiness.city} onChange={(e) => setEditingBusiness({ ...editingBusiness, city: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">State</Label>
                  <Input value={editingBusiness.state} onChange={(e) => setEditingBusiness({ ...editingBusiness, state: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Pincode</Label>
                  <Input value={editingBusiness.pincode || ''} onChange={(e) => setEditingBusiness({ ...editingBusiness, pincode: e.target.value })} className="mt-1" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button onClick={handleSaveBusiness} className="bg-brand hover:bg-brand/90 text-brand-foreground flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingBusiness(null)} className="border-border">
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
