import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Check, 
  Save, 
  RotateCcw, 
  Sliders, 
  Percent, 
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { InventoryItem, calculateShortage } from '../../types/inventory';

interface PresetStockSetupTabProps {
  items: InventoryItem[];
  onUpdateMinStock: (sku: string, newMin: number) => void;
  onBatchAdjustMinStock: (percentage: number, categoryFilter?: string) => void;
  onOpenAddSku: () => void;
  onOpenEditSku: (item: InventoryItem) => void;
  onResetDefaults: () => void;
}

export const PresetStockSetupTab: React.FC<PresetStockSetupTabProps> = ({
  items,
  onUpdateMinStock,
  onBatchAdjustMinStock,
  onOpenAddSku,
  onOpenEditSku,
  onResetDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [tempMin, setTempMin] = useState<number>(0);
  const [successSku, setSuccessSku] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchPercent, setBatchPercent] = useState<number>(10);
  const [batchCategory, setBatchCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(items.map(i => i.category))).sort();

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const handleStartInlineEdit = (item: InventoryItem) => {
    setEditingSku(item.sku);
    setTempMin(item.presetMinStock);
  };

  const handleSaveInline = (sku: string) => {
    if (tempMin < 0) return;
    onUpdateMinStock(sku, tempMin);
    setEditingSku(null);
    setSuccessSku(sku);
    setTimeout(() => setSuccessSku(null), 2000);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBatchAdjustMinStock(batchPercent, batchCategory === 'ALL' ? undefined : batchCategory);
    setShowBatchModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100">
                Preset Minimum Required Stock Setup
              </h3>
              <p className="text-xs text-slate-300">
                Safety stock thresholds preset in the system. When physical stock + extra PO falls below these benchmarks, LogiFlow triggers automated supplier requisition orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Percent className="h-3.5 w-3.5" />
              <span>Batch Multiplier</span>
            </button>

            <button
              onClick={onOpenAddSku}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register New SKU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search preset safety thresholds by SKU or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={onResetDefaults}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 shrink-0 px-2 py-1 cursor-pointer"
          title="Restore factory default preset thresholds"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Factory Defaults</span>
        </button>
      </div>

      {/* Thresholds Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5">Item Name & Category</th>
                <th className="p-3.5 text-right bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 font-bold">
                  Preset Minimum Required Stock
                </th>
                <th className="p-3.5 text-right">Current Balance</th>
                <th className="p-3.5 text-right">Extra PO</th>
                <th className="p-3.5 text-center">Deficit Status</th>
                <th className="p-3.5 text-right">Threshold Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => {
                const isEditing = editingSku === item.sku;
                const calc = calculateShortage(item);
                const isSuccess = successSku === item.sku;

                return (
                  <tr key={item.sku} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* SKU */}
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {item.sku}
                    </td>

                    {/* Name */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.category} · {item.supplier}
                      </div>
                    </td>

                    {/* Preset Min Stock (Inline Editable) */}
                    <td className="p-3.5 text-right bg-amber-50/20 dark:bg-amber-950/10">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            value={tempMin}
                            onChange={e => setTempMin(Math.max(0, parseInt(e.target.value) || 0))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInline(item.sku);
                              if (e.key === 'Escape') setEditingSku(null);
                            }}
                            className="w-20 text-right font-mono font-bold text-sm bg-white dark:bg-slate-900 border border-amber-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleSaveInline(item.sku)}
                            className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400"
                            title="Save threshold"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 group">
                          <span className="font-mono font-bold text-base text-amber-600 dark:text-amber-400">
                            {item.presetMinStock} {item.unit}
                          </span>
                          <button
                            onClick={() => handleStartInlineEdit(item)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-500 rounded transition-opacity"
                            title="Quick edit threshold"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {isSuccess && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                          Saved!
                        </span>
                      )}
                    </td>

                    {/* Stock balance */}
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {item.stockBalance} {item.unit}
                    </td>

                    {/* Extra PO */}
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                      {item.extraPoStock} {item.unit}
                    </td>

                    {/* Resulting status */}
                    <td className="p-3.5 text-center">
                      {calc.isDeficit ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> Shortage: {calc.shortageQty}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> Safe
                        </span>
                      )}
                    </td>

                    {/* Full Edit Modal button */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onOpenEditSku(item)}
                        className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Full Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Adjust Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Batch Safety Stock Multiplier
                </h4>
                <p className="text-xs text-slate-500">
                  Adjust minimum required stock levels uniformly (e.g. for peak season buffer)
                </p>
              </div>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Category
                </label>
                <select
                  value={batchCategory}
                  onChange={e => setBatchCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="ALL">All Categories ({items.length} SKUs)</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Percentage (%): e.g. +10% or -10%
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 20, -10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBatchPercent(val)}
                      className={`py-1 text-xs font-mono font-medium rounded-lg border ${
                        batchPercent === val 
                          ? 'bg-amber-500 text-slate-950 border-amber-500' 
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {val > 0 ? `+${val}%` : `${val}%`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={batchPercent}
                  onChange={e => setBatchPercent(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
                >
                  Apply Batch Multiplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
