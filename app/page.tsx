'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface ChecklistItem {
  id: string
  name: string
  type: string
  value: 'checked' | ''
  doctype: string
  mandatory: string
  [key: string]: string
}

const DEFAULT_CHECKLISTS: ChecklistItem[][] = [[], [], []]

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [inputs, setInputs] = useState<string[]>(['', '', ''])
  const [checklists, setChecklists] = useState<ChecklistItem[][]>(DEFAULT_CHECKLISTS)
  const [errors, setErrors] = useState<(string | null)[]>([null, null, null])

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    setIsDark(!isDark)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
  }

  const parseJSON = (value: string): { data: ChecklistItem[]; error: string | null } => {
    if (!value || !value.trim()) {
      return { data: [], error: null }
    }

    try {
      const parsed = JSON.parse(value)

      if (!Array.isArray(parsed)) {
        return { data: [], error: 'JSON must be an array' }
      }

      return { data: parsed, error: null }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Invalid JSON'

      return { data: [], error: errorMsg }
    }
  }

  const handleInputChange = (index: number, value: string) => {
    setInputs((prev) => {
      const updated = [...prev]
      updated[index] = value

      return updated
    })

    const { data, error } = parseJSON(value)

    setChecklists((prev) => {
      const updated = [...prev]
      updated[index] = data

      return updated
    })

    setErrors((prev) => {
      const updated = [...prev]
      updated[index] = error

      return updated
    })
  }

  const handleToggleItem = (listIndex: number, itemIndex: number) => {
    setChecklists((prev) => {
      const updated = [...prev]
      const newValue = updated[listIndex][itemIndex].value === 'checked' ? '' : 'checked'

      updated[listIndex][itemIndex] = {
        ...updated[listIndex][itemIndex],
        value: newValue,
      }

      setInputs((prevInputs) => {
        const updatedInputs = [...prevInputs]
        updatedInputs[listIndex] = JSON.stringify(updated[listIndex], null, 2)

        return updatedInputs
      })

      return updated
    })
  }

  const handleCopyJSON = (checklist: ChecklistItem[]) => {
    navigator.clipboard.writeText(JSON.stringify(checklist))
    toast.success('Checklist JSON Copied!')
  }

  const maxLength = Math.max(checklists[0].length, checklists[1].length, checklists[2].length)

  return (
    <main className="min-h-screen bg-background p-8 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">SDA Checklist Manager</h1>

            <p className="text-muted-foreground">
              Paste JSON checklist data, toggle items, and see real-time output
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="rounded bg-muted px-4 py-2 text-foreground transition-colors hover:bg-muted/80"
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-foreground">Checklist {index + 1} Input</h2>

              <textarea
                value={inputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`min-h-32 flex-1 resize-none rounded border bg-background p-3 font-mono text-sm text-foreground focus:ring-2 focus:outline-none ${
                  errors[index]
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
                placeholder="Paste JSON array here..."
              />

              {errors[index] && (
                <p className="font-mono text-xs text-destructive">{errors[index]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Checklist Items</h2>

          <div className="overflow-hidden rounded border border-border">
            <div className="grid grid-cols-3">
              <div className="border-r border-border bg-muted/50 p-4 font-semibold text-foreground">
                Checklist 1
              </div>

              <div className="border-r border-border bg-muted/50 p-4 font-semibold text-foreground">
                Checklist 2
              </div>

              <div className="bg-muted/50 p-4 font-semibold text-foreground">Checklist 3</div>
            </div>

            {Array.from({ length: maxLength }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 border-t border-border">
                {checklists.map((checklist, colIndex) => {
                  const item = checklist[rowIndex]

                  return (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      className={`flex items-center gap-3 p-4 ${colIndex < 2 ? 'border-r border-border' : ''}`}
                    >
                      {item ? (
                        <>
                          <input
                            type="checkbox"
                            id={`item-${colIndex}-${item.id}`}
                            checked={item.value === 'checked'}
                            onChange={() => handleToggleItem(colIndex, rowIndex)}
                            className="h-5 w-5 cursor-pointer rounded border-border"
                          />

                          <label
                            htmlFor={`item-${colIndex}-${item.id}`}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-foreground"
                          >
                            <span className="truncate">{item.name}</span>
                            {!!item.mandatory?.trim() && (
                              <span className="rounded bg-destructive px-2 py-1 text-xs text-white">
                                Required
                              </span>
                            )}
                          </label>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">-</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">JSON Output</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {checklists.map((checklist, listIndex) => (
              <Card key={`output-${listIndex}`} className="gap-3 bg-muted/30 p-6">
                <h3 className="text-sm font-semibold text-foreground">
                  Checklist {listIndex + 1} Output
                </h3>

                <pre className="max-h-48 overflow-auto rounded border border-border bg-background p-3 font-mono text-xs text-foreground">
                  {JSON.stringify(checklist)}
                </pre>

                <button
                  onClick={() => handleCopyJSON(checklist)}
                  className="w-full rounded bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Copy JSON
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
