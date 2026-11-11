'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { categoryVisual } from '@/lib/category-visuals'

interface Props {
  categories: { name: string; emoji: string; count: number; subcategories: string[] }[]
  onPick: (cat: string) => void
}

export function CategoriesGrid({ categories, onPick }: Props) {
  const { t } = useI18n()
  const { setSelectedCategory } = useApp()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((cat, i) => {
        const visual = categoryVisual(cat.name)
        const Icon = visual.icon
        return (
          <Card
            key={cat.name}
            className="group cursor-pointer border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg animate-fadeInUp"
            style={{ animationDelay: `${i * 30}ms` }}
            onClick={() => {
              setSelectedCategory(cat.name)
              onPick(cat.name)
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ background: visual.soft }}
              >
                <Icon className="h-8 w-8" style={{ color: visual.color }} />
              </div>
              <div className="mb-1 text-sm font-bold leading-tight text-navy">{cat.name}</div>
              <Badge variant="outline" className="border-brand/30 bg-brand-soft/30 text-[10px] font-medium text-brand">
                {cat.count === 1 ? t('cat_businesses_one') : t('cat_businesses', { count: cat.count })}
              </Badge>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
