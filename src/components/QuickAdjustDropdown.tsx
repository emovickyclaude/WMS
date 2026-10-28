import React, { useState } from 'react';
import { InventoryItem, UploadType } from '../types/inventory';
import { Check, ArrowRight, Package, Truck, BookOpen } from 'lucide-react';

interface QuickAdjustDropdownProps {
  items: InventoryItem[];
  type: UploadType;
  onUpdate: (isbn: string, newValue: number) => void;
}

export const QuickAdjustDropdown: React.FC<QuickAdjustDropdownProps> = ({
  items,
  type,
  onUpdate,
}) => {
  const [selectedIsbn, setSelectedIsbn] = useState<string>(items[0]?.isbn || '');
  const [valueInput, setValueInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedItem = items.find(i => i.isbn === selectedIsbn);
  const isStockBalance = type === 'stock_balance';
  const currentValue = selectedItem ? (isStockBalance ? selectedItem.stockBalance : selectedItem.extraPoStock) : 0;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(valueInput, 10);
    if (isNaN(num) || num < 0) {
      setFeedback('Enter valid number');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }
    if (!selectedIsbn) return;

    onUpdate(selectedIsbn, num);
    setValueInput('');
    setFeedback(`Updated ${selectedIsbn} to ${num}!`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSelectIsbn = (isbn: string) => {
    setSelectedIsbn(isbn);
    const it = items.find(i => i.isbn === isbn);
    if (it) {
      setValueInput(String(isStockBalance ? it.stockBalance : it.extraPoStock));
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {isStockBalance ? (
          <Package className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        ) : (
          <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        )}
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Quick Single-Title Adjuster
        </h4>
      </div>

      <form onSubmit={handleApply} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Select Book Title (ISBN)
          </label>
          <select
            value={selectedIsbn}
            onChange={e => handleSelectIsbn(e.target.value)}
            className="w-full text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {items.map(item => (
              <option key={item.isbn} value={item.isbn}>
                {item.isbn} — {item.title.substring(0, 32)}... (Current: {isStockBalance ? item.stockBalance : item.extraPoStock})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              Current {isStockBalance ? 'Stock Balance' : 'Extra PO'}
            </label>
            <div className="text-sm font-mono font-semibold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentValue} {selectedItem?.unit || 'copies'}
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-1">
              New {isStockBalance ? 'Stock Balance' : 'Extra PO Stock'}
            </label>
            <input
              type="number"
              min="0"
              placeholder={String(currentValue)}
              value={valueInput}
              onChange={e => setValueInput(e.target.value)}
              className="w-full text-sm font-mono px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {feedback ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> {feedback}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Immediate update & recalculation
            </span>
          )}

          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
          >
            Apply <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
};
