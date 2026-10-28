'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'

interface Props {
  categories: { name: string; emoji: string; count: number; subcategories: string[] }[]
  onPick: (cat: string) => void
}

export function CategoriesGrid({ categories, onPick }: Props) {
  const { t } = useI18n()
  const { setSelectedCategory } = useApp()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((cat, i) => (
        <Card
          key={cat.name}
          className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group border-border/60 bg-card animate-fadeInUp"
          style={{ animationDelay: `${i * 30}ms` }}
          onClick={() => {
            setSelectedCategory(cat.name)
            onPick(cat.name)
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-soft/40 group-hover:bg-brand-soft transition-colors flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-transform">
              {cat.emoji}
            </div>
            <div className="font-serif font-semibold text-sm leading-tight mb-1">{cat.name}</div>
            <Badge variant="outline" className="text-[10px] border-brand/30 text-brand bg-brand-soft/30 font-medium">
              {cat.count === 1 ? t('cat_businesses_one') : t('cat_businesses', { count: cat.count })}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
