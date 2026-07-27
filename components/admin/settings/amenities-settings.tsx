'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Plus, Trash2, Loader2,
  Trees, Flame, Wifi, Ship, Bath, Utensils, Car, Waves, Wind, Coffee,
  Dumbbell, Star, Home, Bed, Check, Sun, Snowflake, Music, Camera,
  Anchor, Fish, Bike, MapPin, Dog, Baby, Tv, ChefHat,
  Thermometer, Droplets, type LucideIcon,
} from 'lucide-react'
import type { Amenity } from '@/lib/types'

const ICONS: { key: string; Icon: LucideIcon; label: string }[] = [
  { key: 'check',           Icon: Check,          label: 'Галочка'     },
  { key: 'trees',           Icon: Trees,          label: 'Деревья'     },
  { key: 'flame',           Icon: Flame,          label: 'Огонь'       },
  { key: 'wifi',            Icon: Wifi,           label: 'Wi-Fi'       },
  { key: 'ship',            Icon: Ship,           label: 'Лодка'       },
  { key: 'bath',            Icon: Bath,           label: 'Баня'        },
  { key: 'utensils',        Icon: Utensils,       label: 'Кухня'       },
  { key: 'car',             Icon: Car,            label: 'Авто'        },
  { key: 'waves',           Icon: Waves,          label: 'Вода'        },
  { key: 'wind',            Icon: Wind,           label: 'Ветер'       },
  { key: 'coffee',          Icon: Coffee,         label: 'Кофе'        },
  { key: 'dumbbell',        Icon: Dumbbell,       label: 'Спорт'       },
  { key: 'star',            Icon: Star,           label: 'Звезда'      },
  { key: 'home',            Icon: Home,           label: 'Дом'         },
  { key: 'bed',             Icon: Bed,            label: 'Кровать'     },
  { key: 'sun',             Icon: Sun,            label: 'Солнце'      },
  { key: 'snowflake',       Icon: Snowflake,      label: 'Зима'        },
  { key: 'music',           Icon: Music,          label: 'Музыка'      },
  { key: 'camera',          Icon: Camera,         label: 'Фото'        },
  { key: 'anchor',          Icon: Anchor,         label: 'Якорь'       },
  { key: 'fish',            Icon: Fish,           label: 'Рыбалка'     },
  { key: 'bike',            Icon: Bike,           label: 'Велосипед'   },
  { key: 'mappin',          Icon: MapPin,         label: 'Место'       },
  { key: 'dog',             Icon: Dog,            label: 'Животные'    },
  { key: 'baby',            Icon: Baby,           label: 'Дети'        },
  { key: 'tv',              Icon: Tv,             label: 'ТВ'          },
  { key: 'chefhat',         Icon: ChefHat,        label: 'Повар'       },
  { key: 'thermometer',     Icon: Thermometer,    label: 'Тепло'       },
  { key: 'droplets',        Icon: Droplets,       label: 'Вода'        },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AmenitiesSettings() {
  const { data, mutate } = useSWR('/api/admin/amenities', fetcher)
  const items: Amenity[] = data?.data ?? []

  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('check')
  const [adding, setAdding] = useState(false)

  async function addItem() {
    if (!label.trim()) return
    setAdding(true)
    try {
      await fetch('/api/admin/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), icon, sort_order: items.length }),
      })
      setLabel('')
      setIcon('check')
      mutate()
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id: string) {
    await fetch('/api/admin/amenities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutate()
  }

  const selectedMeta = ICONS.find((i) => i.key === icon)
  const SelectedIcon = selectedMeta?.Icon ?? Check

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Удобства</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Отображаются в блоке «Об усадьбе» на главной странице
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Добавить удобство</h2>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && addItem()}
              placeholder="Название (напр. Баня и чан)"
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={addItem}
              disabled={adding || !label.trim()}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Добавить
            </button>
          </div>

          {/* Icon picker */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Иконка</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(({ key, Icon, label: iconLabel }) => (
                <button
                  key={key}
                  type="button"
                  title={iconLabel}
                  onClick={() => setIcon(key)}
                  className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${
                    icon === key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-ring hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              Выбрана: <SelectedIcon className="size-3.5" /> <span>{selectedMeta?.label ?? icon}</span>
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">Икон.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Список пуст — добавьте первое удобство
                </td>
              </tr>
            )}
            {items.map((item) => {
              const meta = ICONS.find((i) => i.key === item.icon?.toLowerCase())
              const ItemIcon = meta?.Icon ?? Check
              return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ItemIcon className="size-4" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{item.label}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Удалить"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
