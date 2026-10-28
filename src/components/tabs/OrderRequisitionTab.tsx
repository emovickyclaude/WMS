import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Package, 
  Truck, 
  Copy, 
  Check, 
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { InventoryItem, calculateShortage } from '../../types/inventory';
import { exportRequisitionsCsv } from '../../utils/csvUtils';

import { UserPermissions } from '../../types/auth';

interface OrderRequisitionTabProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem | null) => void;
  onOpenUpload: (type: 'stock_balance' | 'extra_po') => void;
  onOrderSingleItem: (item: InventoryItem) => void;
  onOrderAllDeficits: () => void;
  onEditItem: (item: InventoryItem) => void;
  permissions?: UserPermissions;
}

export const OrderRequisitionTab: React.FC<OrderRequisitionTabProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onOpenUpload,
  onOrderSingleItem,
  onOrderAllDeficits,
  onEditItem,
  permissions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DEFICIT' | 'SUFFICIENT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedIsbn, setCopiedIsbn] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'shortage' | 'isbn' | 'title' | 'minStock'>('shortage');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.category));
    return Array.from(set).sort();
  }, [items]);

  // Compute shortage analysis for each item
  const analyzedItems = useMemo(() => {
    return items.map(item => ({
      item,
      analysis: calculateShortage(item),
    }));
  }, [items]);

  // Counts
  const totalCount = items.length;
  const deficitCount = analyzedItems.filter(i => i.analysis.isDeficit).length;
  const sufficientCount = totalCount - deficitCount;
  const totalUnitsToOrder = analyzedItems.reduce((acc, curr) => acc + curr.analysis.orderQtyNeeded, 0);

  // Filtered & sorted
  const filteredItems = useMemo(() => {
    return analyzedItems
      .filter(({ item, analysis }) => {
        // Status filter
        if (statusFilter === 'DEFICIT' && !analysis.isDeficit) return false;
        if (statusFilter === 'SUFFICIENT' && analysis.isDeficit) return false;

        // Category filter
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchIsbn = item.isbn.toLowerCase().includes(q);
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchSupplier = item.supplier.toLowerCase().includes(q);
          const matchLoc = (item.location || '').toLowerCase().includes(q);
          return matchIsbn || matchTitle || matchSupplier || matchLoc;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'shortage') {
          diff = a.analysis.shortageQty - b.analysis.shortageQty;
        } else if (sortField === 'isbn') {
          diff = a.item.isbn.localeCompare(b.item.isbn);
        } else if (sortField === 'title') {
          diff = a.item.title.localeCompare(b.item.title);
        } else if (sortField === 'minStock') {
          diff = a.item.presetMinStock - b.item.presetMinStock;
        }
        return sortAsc ? diff : -diff;
      });
  }, [analyzedItems, statusFilter, categoryFilter, searchQuery, sortField, sortAsc]);

  const handleCopyIsbn = (isbn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(isbn);
    setCopiedIsbn(isbn);
    setTimeout(() => setCopiedIsbn(null), 2000);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Titles ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('DEFICIT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'DEFICIT'
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Qty Not Sufficient ({deficitCount})
            </button>
            <button
              onClick={() => setStatusFilter('SUFFICIENT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'SUFFICIENT'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sufficient ({sufficientCount})
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {deficitCount > 0 && (
              <button
                disabled={permissions && !permissions.canCreatePo}
                onClick={onOrderAllDeficits}
                className={`px-3.5 py-2 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
                  permissions && !permissions.canCreatePo
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 cursor-pointer'
                }`}
                title={permissions && !permissions.canCreatePo ? 'Ordering restricted by Admin' : 'Order all deficit titles'}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Order All {deficitCount} Deficits ({totalUnitsToOrder} copies)</span>
              </button>
            )}

            <button
              disabled={permissions && !permissions.canExportData}
              onClick={() => exportRequisitionsCsv(items, statusFilter === 'DEFICIT')}
              className={`px-3 py-2 border text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                permissions && !permissions.canExportData
                  ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer'
              }`}
              title={permissions && !permissions.canExportData ? 'Export restricted by Admin' : 'Download filtered items to CSV'}
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Direct 2 icon quick triggers */}
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

            <button
              disabled={permissions && !permissions.canUploadStockBalance}
              onClick={() => onOpenUpload('stock_balance')}
              className={`px-3 py-2 border text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                permissions && !permissions.canUploadStockBalance
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60 cursor-pointer'
              }`}
              title={permissions && !permissions.canUploadStockBalance ? 'Stock balance upload option restricted by Admin' : 'Upload Stock Balance CSV'}
            >
              <Package className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Upload Stock Balance</span>
            </button>

            <button
              disabled={permissions && !permissions.canUploadExtraPo}
              onClick={() => onOpenUpload('extra_po')}
              className={`px-3 py-2 border text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ${
                permissions && !permissions.canUploadExtraPo
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 cursor-pointer'
              }`}
              title={permissions && !permissions.canUploadExtraPo ? 'Extra PO upload option restricted by Admin' : 'Upload Extra PO Stock CSV'}
            >
              <Truck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Upload Extra PO</span>
            </button>
          </div>
        </div>

        {/* Search and Category Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ISBN-13, book title, publisher, or shelf location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th 
                  onClick={() => handleSort('isbn')}
                  className="p-3.5 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ISBN-13</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('title')}
                  className="p-3.5 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Book Title & Publisher</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('minStock')}
                  className="p-3.5 text-right font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white bg-amber-50/40 dark:bg-amber-950/20"
                >
                  <div className="flex items-center justify-end gap-1 text-amber-700 dark:text-amber-400">
                    <span>Preset Min Stock</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-3.5 text-right font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50/40 dark:bg-cyan-950/20">
                  Stock Balance
                </th>
                <th className="p-3.5 text-right font-semibold text-purple-700 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20">
                  Extra PO Stock
                </th>
                <th 
                  onClick={() => handleSort('shortage')}
                  className="p-3.5 text-right font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Shortage Qty</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-3.5 text-center font-semibold">
                  Status Rule
                </th>
                <th className="p-3.5 text-right font-semibold">
                  Supplier Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No book titles matched the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ item, analysis }) => {
                  const isSelected = selectedItem?.isbn === item.isbn;
                  return (
                    <tr
                      key={item.isbn}
                      onClick={() => onSelectItem(isSelected ? null : item)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/30' 
                          : analysis.isDeficit 
                            ? 'bg-rose-50/20 dark:bg-rose-950/10' 
                            : ''
                      }`}
                    >
                      {/* ISBN */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            {item.isbn}
                          </span>
                          <button
                            onClick={e => handleCopyIsbn(item.isbn, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                            title="Copy ISBN"
                          >
                            {copiedIsbn === item.isbn ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {item.location && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            Shelf: {item.location}
                          </div>
                        )}
                      </td>

                      {/* Title & Category */}
                      <td className="p-3.5 max-w-[240px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                            {item.supplier}
                          </span>
                        </div>
                      </td>

                      {/* Preset Min Stock (from Minimum Qty.xlsx) */}
                      <td className="p-3.5 text-right font-mono bg-amber-50/20 dark:bg-amber-950/10">
                        <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                          {item.presetMinStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {item.unit}
                        </span>
                      </td>

                      {/* Stock Balance */}
                      <td className="p-3.5 text-right font-mono bg-cyan-50/20 dark:bg-cyan-950/10">
                        <span className="font-bold text-cyan-700 dark:text-cyan-400 text-sm">
                          {item.stockBalance}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {item.unit}
                        </span>
                      </td>

                      {/* Extra PO Stock */}
                      <td className="p-3.5 text-right font-mono bg-purple-50/20 dark:bg-purple-950/10">
                        <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">
                          {item.extraPoStock}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {item.unit}
                        </span>
                      </td>

                      {/* Shortage Qty Result */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className={`font-black text-sm sm:text-base ${
                              analysis.isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {analysis.shortageQty > 0 ? `+${analysis.shortageQty}` : analysis.shortageQty}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {analysis.isDeficit ? 'Deficit' : 'Surplus'}
                        </span>
                      </td>

                      {/* Status Rule Badge */}
                      <td className="p-3.5 text-center">
                        {analysis.isDeficit ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Qty Not Sufficient
                            </span>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                              Need to order {analysis.orderQtyNeeded} {item.unit}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              Sufficient Stock
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Buffer: {Math.abs(analysis.shortageQty)} {item.unit}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {analysis.isDeficit ? (
                            <button
                              disabled={permissions && !permissions.canCreatePo}
                              onClick={() => onOrderSingleItem(item)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all ${
                                permissions && !permissions.canCreatePo
                                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                              }`}
                              title={permissions && !permissions.canCreatePo ? 'Ordering restricted by Admin' : `Create purchase order for ${analysis.orderQtyNeeded} ${item.unit}`}
                            >
                              <ShoppingCart className="h-3 w-3" />
                              <span>Order +{analysis.orderQtyNeeded}</span>
                            </button>
                          ) : (
                            <button
                              disabled={permissions && !permissions.canEditPresetMinStock}
                              onClick={() => onEditItem(item)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                permissions && !permissions.canEditPresetMinStock
                                  ? 'text-slate-400 cursor-not-allowed opacity-50'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                              }`}
                              title={permissions && !permissions.canEditPresetMinStock ? 'Preset editing restricted by Admin' : 'Configure preset'}
                            >
                              Preset Setup
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span>Formula: <code>Preset Min (Minimum Qty.xlsx) − Stock Balance − Extra PO = Shortage</code></span>
            <span>· Click any row to preview calculation</span>
          </div>
          <div>
            Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> Book Titles
          </div>
        </div>
      </div>
    </div>
  );
};
