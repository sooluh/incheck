"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

interface ChecklistItem {
  id: string;
  name: string;
  type: string;
  value: "checked" | "";
  doctype: string;
  mandatory: string;
  [key: string]: string;
}

const DEFAULT_CHECKLISTS: ChecklistItem[][] = [[], [], []];

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [inputs, setInputs] = useState<string[]>(["", "", ""]);
  const [checklists, setChecklists] =
    useState<ChecklistItem[][]>(DEFAULT_CHECKLISTS);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setIsDark(!isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  const handleInputChange = (index: number, value: string) => {
    setInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

    try {
      const parsed = JSON.parse(value) as ChecklistItem[];
      setChecklists((prev) => {
        const updated = [...prev];
        updated[index] = parsed;
        return updated;
      });
    } catch (e) {}
  };

  const handleToggleItem = (listIndex: number, itemIndex: number) => {
    setChecklists((prev) => {
      const updated = [...prev];
      const newValue =
        updated[listIndex][itemIndex].value === "checked" ? "" : "checked";
      updated[listIndex][itemIndex] = {
        ...updated[listIndex][itemIndex],
        value: newValue,
      };

      setInputs((prevInputs) => {
        const updatedInputs = [...prevInputs];
        updatedInputs[listIndex] = JSON.stringify(updated[listIndex], null, 2);
        return updatedInputs;
      });

      return updated;
    });
  };

  const handleCopyJSON = (checklist: ChecklistItem[]) => {
    navigator.clipboard.writeText(JSON.stringify(checklist));
    toast.success("Checklist Copied!");
  };

  const maxLength = Math.max(
    checklists[0].length,
    checklists[1].length,
    checklists[2].length,
  );

  return (
    <main className="min-h-screen bg-background p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              SDA Checklist Manager
            </h1>
            <p className="text-muted-foreground">
              Paste JSON checklist data, toggle items, and see real-time output
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Checklist 1 Input
            </h2>

            <textarea
              value={inputs[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              className="flex-1 p-3 bg-background border border-border rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-32 text-foreground"
              placeholder="Paste JSON array here..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Checklist 2 Input
            </h2>

            <textarea
              value={inputs[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              className="flex-1 p-3 bg-background border border-border rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-32 text-foreground"
              placeholder="Paste JSON array here..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Checklist 3 Input
            </h2>

            <textarea
              value={inputs[2]}
              onChange={(e) => handleInputChange(2, e.target.value)}
              className="flex-1 p-3 bg-background border border-border rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-32 text-foreground"
              placeholder="Paste JSON array here..."
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Checklist Items
          </h2>

          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-3">
              <div className="bg-muted/50 p-4 border-r border-border font-semibold text-foreground">
                Checklist 1
              </div>
              <div className="bg-muted/50 p-4 border-r border-border font-semibold text-foreground">
                Checklist 2
              </div>
              <div className="bg-muted/50 p-4 font-semibold text-foreground">
                Checklist 3
              </div>
            </div>

            {Array.from({ length: maxLength }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-3 border-t border-border"
              >
                {checklists.map((checklist, colIndex) => {
                  const item = checklist[rowIndex];

                  return (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      className={`p-4 flex items-center gap-3 ${colIndex < 2 ? "border-r border-border" : ""}`}
                    >
                      {item ? (
                        <>
                          <input
                            type="checkbox"
                            id={`item-${colIndex}-${item.id}`}
                            checked={item.value === "checked"}
                            onChange={() =>
                              handleToggleItem(colIndex, rowIndex)
                            }
                            className="w-5 h-5 rounded border-border cursor-pointer"
                          />

                          <label
                            htmlFor={`item-${colIndex}-${item.id}`}
                            className="flex-1 text-foreground cursor-pointer flex items-center gap-2 min-w-0"
                          >
                            <span className="truncate">{item.name}</span>

                            {item.mandatory === "yes" && (
                              <span className="text-xs bg-destructive text-white px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </label>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">
                          -
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            JSON Output
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {checklists.map((checklist, listIndex) => (
              <Card
                key={`output-${listIndex}`}
                className="p-6 bg-muted/30 gap-3"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  Checklist {listIndex + 1} Output
                </h3>

                <pre className="bg-background p-3 rounded border border-border overflow-auto max-h-48 text-xs font-mono text-foreground">
                  {JSON.stringify(checklist)}
                </pre>

                <button
                  onClick={() => handleCopyJSON(checklist)}
                  className="w-full px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm cursor-pointer"
                >
                  Copy JSON
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
