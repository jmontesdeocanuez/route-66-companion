"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LUGGAGE_CATEGORIES } from "@/components/luggage-item-form-dialog";

const STORAGE_KEY = "equipaje-custom-categories";
const OTHER_VALUE = "__other__";

function loadCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveCustomCategory(name: string) {
  const existing = loadCustomCategories();
  if (!existing.includes(name)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, name]));
  }
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: Props) {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    setCustomCategories(loadCustomCategories());
  }, []);

  // If current value is not in the fixed list, it's a custom category
  const allFixed = [...LUGGAGE_CATEGORIES] as string[];
  const isCustomValue = value && !allFixed.includes(value) && value !== OTHER_VALUE;

  useEffect(() => {
    if (isCustomValue) {
      setShowCustomInput(true);
      setCustomInput(value);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const selectValue = isCustomValue ? OTHER_VALUE : (value || "");

  function handleSelectChange(selected: string) {
    if (selected === OTHER_VALUE) {
      setShowCustomInput(true);
      setCustomInput("");
      onChange("");
    } else {
      setShowCustomInput(false);
      setCustomInput("");
      onChange(selected);
    }
  }

  function handleCustomInputBlur() {
    const trimmed = customInput.trim();
    if (trimmed) {
      saveCustomCategory(trimmed);
      setCustomCategories(loadCustomCategories());
      onChange(trimmed);
    }
  }

  function handleCustomInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomInput(e.target.value);
    onChange(e.target.value);
  }

  const allCategories = [
    ...LUGGAGE_CATEGORIES,
    ...customCategories.filter((c) => !allFixed.includes(c)),
  ];

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSelectChange} value={selectValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una categoría" />
        </SelectTrigger>
        <SelectContent>
          {allCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Otra categoría…</SelectItem>
        </SelectContent>
      </Select>

      {showCustomInput && (
        <Input
          placeholder="Nombre de la nueva categoría"
          value={customInput}
          onChange={handleCustomInputChange}
          onBlur={handleCustomInputBlur}
          autoFocus
        />
      )}
    </div>
  );
}
