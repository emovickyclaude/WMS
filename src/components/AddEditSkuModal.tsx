import React, { useState } from 'react';
import { X, ShieldCheck, BookOpen } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface AddEditSkuModalProps {
  isOpen: boolean;
  itemToEdit?: InventoryItem | null;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export const AddEditSkuModal: React.FC<AddEditSkuModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = !!itemToEdit;

  const [isbn, setIsbn] = useState<string>(itemToEdit?.isbn || '');
  const [title, setTitle] = useState<string>(itemToEdit?.title || '');
  const [category, setCategory] = useState<string>(itemToEdit?.category || 'Computer Science & Software');
  const [presetMinStock, setPresetMinStock] = useState<number>(itemToEdit?.presetMinStock ?? 50);
  const [stockBalance, setStockBalance] = useState<number>(itemToEdit?.stockBalance ?? 0);
  const [extraPoStock, setExtraPoStock] = useState<number>(itemToEdit?.extraPoStock ?? 0);
  const [supplier, setSupplier] = useState<string>(itemToEdit?.supplier || 'Pearson Education Publishing');
  const [unit, setUnit] = useState<string>(itemToEdit?.unit || 'copies');
  const [unitCost, setUnitCost] = useState<number>(itemToEdit?.unitCost ?? 35.0);
  const [location, setLocation] = useState<string>(itemToEdit?.location || 'Aisle B - Shelf 01');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbn.trim() || !title.trim()) return;

    const newItem: InventoryItem = {
      isbn: isbn.trim(),
      title: title.trim(),
      category: category.trim(),
      presetMinStock: Math.max(0, presetMinStock),
      stockBalance: Math.max(0, stockBalance),
      extraPoStock: Math.max(0, extraPoStock),
      supplier: supplier.trim(),
      unit: unit.trim(),
      unitCost: Math.max(0, unitCost),
      location: location.trim(),
      lastUpdated: new Date().toISOString(),
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isEditing ? `Edit Book: ${itemToEdit.isbn}` : 'Register New Book Title (ISBN)'}
              </h3>
              <p className="text-xs text-slate-300">
                Preset minimum required safety stock threshold from Minimum Qty.xlsx
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                ISBN-13 *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                placeholder="e.g. 978-0-13-468599-1"
                value={isbn}
                onChange={e => setIsbn(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science & Software">Computer Science & Software</option>
                <option value="Academic & Algorithms">Academic & Algorithms</option>
                <option value="Programming & Data">Programming & Data</option>
                <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                <option value="Finance & Business">Finance & Business</option>
                <option value="Non-Fiction & Science">Non-Fiction & Science</option>
                <option value="Psychology & Economics">Psychology & Economics</option>
                <option value="Literature & Fiction">Literature & Fiction</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Designing Data-Intensive Applications"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Preset Minimum Required Stock Highlight */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Preset Minimum Required Stock (from Minimum Qty.xlsx) *
              </label>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                System Preset
              </span>
            </div>
            <input
              type="number"
              min="0"
              required
              value={presetMinStock}
              onChange={e => setPresetMinStock(parseInt(e.target.value) || 0)}
              className="w-full text-base font-mono font-bold p-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1">
              Safety threshold established for this ISBN. When physical stock + extra PO falls below this quantity, the system flags "Qty Not Sufficient".
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Stock Balance
              </label>
              <input
                type="number"
                min="0"
                value={stockBalance}
                onChange={e => setStockBalance(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Extra PO Stock (Inbound)
              </label>
              <input
                type="number"
                min="0"
                value={extraPoStock}
                onChange={e => setExtraPoStock(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Publisher / Supplier
              </label>
              <input
                type="text"
                placeholder="Publisher Name"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit (copies)
              </label>
              <input
                type="text"
                placeholder="copies"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit Cost (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Warehouse Shelf Location
              </label>
              <input
                type="text"
                placeholder="Aisle B - Shelf 01"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Register Book Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
