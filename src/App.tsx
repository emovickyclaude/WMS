import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  Layers, 
  ShieldCheck, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Boxes, 
  FileText, 
  ShoppingCart, 
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Warehouse
} from 'lucide-react';
import { 
  InventoryItem, 
  UploadType, 
  PurchaseOrderRecord, 
  calculateShortage 
} from './types/inventory';
import { INITIAL_INVENTORY } from './data/initialData';
import { FormulaBanner } from './components/FormulaBanner';
import { UploadModal } from './components/UploadModal';
import { SupplierPoModal } from './components/SupplierPoModal';
import { AddEditSkuModal } from './components/AddEditSkuModal';
import { OrderRequisitionTab } from './components/tabs/OrderRequisitionTab';
import { PresetStockSetupTab } from './components/tabs/PresetStockSetupTab';
import { DualUploadCenterTab } from './components/tabs/DualUploadCenterTab';
import { PoHistoryTab } from './components/tabs/PoHistoryTab';

const STORAGE_KEY_ITEMS = 'logiflow_wms_phase1_inventory_v1';
const STORAGE_KEY_POS = 'logiflow_wms_phase1_pos_v1';
const STORAGE_KEY_LOGS = 'logiflow_wms_phase1_upload_logs_v1';

export default function App() {
  // State for inventory items
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_INVENTORY;
  });

  // State for PO records
  const [poRecords, setPoRecords] = useState<PurchaseOrderRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // State for upload logs
  const [recentUploads, setRecentUploads] = useState<{
    id: string;
    type: UploadType;
    fileName: string;
    recordsCount: number;
    timestamp: string;
  }[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        type: 'stock_balance',
        fileName: 'Initial warehouse sync',
        recordsCount: 10,
        timestamp: new Date().toISOString(),
      }
    ];
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'requisition' | 'preset' | 'upload_center' | 'pos'>('requisition');

  // Currently focused/selected item for live formula breakdown
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Modal states
  const [uploadModalType, setUploadModalType] = useState<UploadType | null>(null);
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [itemsForPo, setItemsForPo] = useState<InventoryItem[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(poRecords));
  }, [poRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(recentUploads));
  }, [recentUploads]);

  // If selected item was modified, sync it
  useEffect(() => {
    if (selectedItem) {
      const refreshed = items.find(i => i.sku === selectedItem.sku);
      if (refreshed) setSelectedItem(refreshed);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalPresetMin = 0;
    let totalStockOnHand = 0;
    let totalExtraPo = 0;
    let totalDeficitUnits = 0;
    let deficitCount = 0;
    let sufficientCount = 0;

    items.forEach(item => {
      totalPresetMin += item.presetMinStock;
      totalStockOnHand += item.stockBalance;
      totalExtraPo += item.extraPoStock;
      const calc = calculateShortage(item);
      if (calc.isDeficit) {
        deficitCount++;
        totalDeficitUnits += calc.orderQtyNeeded;
      } else {
        sufficientCount++;
      }
    });

    return {
      totalSkus: items.length,
      deficitCount,
      sufficientCount,
      totalDeficitUnits,
      totalStockOnHand,
      totalExtraPo,
      totalPresetMin,
    };
  }, [items]);

  // Handler for uploading CSV updates
  const handleApplyUpload = (type: UploadType, updates: { sku: string; value: number }[]) => {
    const updateMap = new Map(updates.map(u => [u.sku.toUpperCase(), u.value]));
    let count = 0;

    setItems(prev =>
      prev.map(item => {
        const val = updateMap.get(item.sku.toUpperCase());
        if (val !== undefined) {
          count++;
          return {
            ...item,
            stockBalance: type === 'stock_balance' ? val : item.stockBalance,
            extraPoStock: type === 'extra_po' ? val : item.extraPoStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    // Record upload log
    const newLog = {
      id: `log-${Date.now()}`,
      type,
      fileName: type === 'stock_balance' ? 'stock_balance.csv' : 'extra_po.csv',
      recordsCount: count,
      timestamp: new Date().toISOString(),
    };
    setRecentUploads(prev => [newLog, ...prev.slice(0, 9)]);

    showToast(
      `Successfully updated ${count} SKUs with new ${
        type === 'stock_balance' ? 'Stock Balances' : 'Extra PO Stock'
      }!`
    );
  };

  // Quick single item adjuster
  const handleQuickUpdateItem = (sku: string, type: UploadType, value: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.sku === sku) {
          return {
            ...item,
            stockBalance: type === 'stock_balance' ? value : item.stockBalance,
            extraPoStock: type === 'extra_po' ? value : item.extraPoStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast(`Updated ${sku} ${type === 'stock_balance' ? 'Stock Balance' : 'Extra PO'} to ${value}`);
  };

  // Update preset minimum safety stock
  const handleUpdateMinStock = (sku: string, newMin: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.sku === sku) {
          return {
            ...item,
            presetMinStock: newMin,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast(`Updated Preset Min Stock for ${sku} to ${newMin}`);
  };

  // Batch adjust minimum safety stocks
  const handleBatchAdjustMinStock = (percentage: number, categoryFilter?: string) => {
    const factor = 1 + percentage / 100;
    let modified = 0;

    setItems(prev =>
      prev.map(item => {
        if (!categoryFilter || item.category === categoryFilter) {
          modified++;
          return {
            ...item,
            presetMinStock: Math.max(1, Math.round(item.presetMinStock * factor)),
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    showToast(`Adjusted Preset Safety Stock by ${percentage > 0 ? `+${percentage}` : percentage}% across ${modified} SKUs`);
  };

  // Add or edit SKU
  const handleSaveSku = (newItem: InventoryItem) => {
    setItems(prev => {
      const existsIndex = prev.findIndex(i => i.sku === newItem.sku);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });
    showToast(`Saved SKU ${newItem.sku} successfully`);
  };

  // Place PO handler
  const handleConfirmPo = (newPo: PurchaseOrderRecord, autoAddToExtraPo: boolean) => {
    setPoRecords(prev => [newPo, ...prev]);

    if (autoAddToExtraPo) {
      // Add ordered quantities to Extra PO Stock
      const orderMap = new Map(newPo.items.map(i => [i.sku, i.qtyToOrder]));
      setItems(prev =>
        prev.map(item => {
          const qty = orderMap.get(item.sku);
          if (qty && qty > 0) {
            return {
              ...item,
              extraPoStock: item.extraPoStock + qty,
              lastUpdated: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      showToast(`PO ${newPo.poNumber} dispatched! Inbound units added to Extra PO Stock.`);
    } else {
      showToast(`PO ${newPo.poNumber} created successfully!`);
    }
  };

  // Single item PO trigger
  const handleOrderSingleItem = (item: InventoryItem) => {
    setItemsForPo([item]);
    setIsPoModalOpen(true);
  };

  // Bulk all deficit PO trigger
  const handleOrderAllDeficits = () => {
    const deficitItems = items.filter(item => calculateShortage(item).isDeficit);
    if (deficitItems.length === 0) {
      showToast('No deficit items found. All stock is currently sufficient!');
      return;
    }
    setItemsForPo(deficitItems);
    setIsPoModalOpen(true);
  };

  // Reset demo data
  const handleResetDefaults = () => {
    if (window.confirm('Reset all inventory records and preset minimum safety stocks to factory demo values?')) {
      setItems(INITIAL_INVENTORY);
      setSelectedItem(null);
      showToast('Reset to default inventory data.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Warehouse className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    LogiFlow WMS
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Phase 1: Order Management
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Preset Safety Stock · Dual Ingestion · Supplier Deficit Calculation Engine
                </p>
              </div>
            </div>

            {/* DIRECT 2 UPLOAD ICONS (User Requirement #6) */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* ICON 1: Stock Balance Upload */}
              <button
                onClick={() => setUploadModalType('stock_balance')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50 transition-all cursor-pointer"
                title="Icon 1: Upload Stock Balance CSV (sku, stock_balance)"
              >
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold px-1 rounded bg-cyan-500/30 text-cyan-200">
                      Icon 1
                    </span>
                    <span className="text-xs font-semibold text-cyan-100">
                      Upload Stock Balance
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 block leading-tight font-mono">
                    sku, stock_balance
                  </span>
                </div>
              </button>

              {/* ICON 2: Extra PO Stock Upload */}
              <button
                onClick={() => setUploadModalType('extra_po')}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950/50 transition-all cursor-pointer"
                title="Icon 2: Upload Extra PO Stock CSV (sku, extra_po_stock)"
              >
                <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold px-1 rounded bg-purple-500/30 text-purple-200">
                      Icon 2
                    </span>
                    <span className="text-xs font-semibold text-purple-100">
                      Upload Extra PO Stock
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 block leading-tight font-mono">
                    sku, extra_po_stock
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 text-xs">
            <div className="flex items-center gap-6 shrink-0">
              {/* Deficit Alert */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-400">Qty Not Sufficient:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {stats.deficitCount} SKUs ({stats.totalDeficitUnits} units to order)
                </span>
              </div>

              {/* Sufficient */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Sufficient:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {stats.sufficientCount} SKUs
                </span>
              </div>

              {/* Physical Balance */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <Package className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-400">Physical Stock:</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {stats.totalStockOnHand.toLocaleString()}
                </span>
              </div>

              {/* Inbound PO */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <Truck className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-slate-400">Extra PO Stock:</span>
                <span className="font-mono font-semibold text-purple-300">
                  {stats.totalExtraPo.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                Formula: Min − Balance − PO = Shortage
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* INTERACTIVE FORMULA CALCULATION BANNER */}
        <FormulaBanner selectedItem={selectedItem} />

        {/* TABS NAVIGATION */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            {/* Tab 1 */}
            <button
              onClick={() => setActiveTab('requisition')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'requisition'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Order Requisition Engine</span>
              {stats.deficitCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {stats.deficitCount}
                </span>
              )}
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'preset'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Preset Minimum Stock Setup</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-mono">
                Safety Stock
              </span>
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => setActiveTab('upload_center')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upload_center'
                  ? 'border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Dual Upload & Update Center</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-mono">
                Icon 1 & 2
              </span>
            </button>

            {/* Tab 4 */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pos'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Supplier Requisitions History</span>
              {poRecords.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {poRecords.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* ACTIVE TAB CONTENT */}
        {activeTab === 'requisition' && (
          <OrderRequisitionTab
            items={items}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            onOpenUpload={type => setUploadModalType(type)}
            onOrderSingleItem={handleOrderSingleItem}
            onOrderAllDeficits={handleOrderAllDeficits}
            onEditItem={item => {
              setItemToEdit(item);
              setIsAddEditOpen(true);
            }}
          />
        )}

        {activeTab === 'preset' && (
          <PresetStockSetupTab
            items={items}
            onUpdateMinStock={handleUpdateMinStock}
            onBatchAdjustMinStock={handleBatchAdjustMinStock}
            onOpenAddSku={() => {
              setItemToEdit(null);
              setIsAddEditOpen(true);
            }}
            onOpenEditSku={item => {
              setItemToEdit(item);
              setIsAddEditOpen(true);
            }}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'upload_center' && (
          <DualUploadCenterTab
            items={items}
            onOpenUploadModal={type => setUploadModalType(type)}
            onQuickUpdateItem={handleQuickUpdateItem}
            recentUploads={recentUploads}
          />
        )}

        {activeTab === 'pos' && (
          <PoHistoryTab
            poRecords={poRecords}
            onOpenNewPo={() => {
              const deficits = items.filter(i => calculateShortage(i).isDeficit);
              setItemsForPo(deficits.length > 0 ? deficits : items.slice(0, 3));
              setIsPoModalOpen(true);
            }}
            onUpdatePoStatus={(id, status) => {
              setPoRecords(prev =>
                prev.map(p => (p.id === id ? { ...p, status } : p))
              );
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">LogiFlow WMS</span>
            <span>· Phase 1 Order Management & Deficit Requisitions</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Formula: <code>Shortage = Min − Balance − Extra PO</code></span>
            <span>· HTML5 LocalStorage Enabled</span>
            <button
              onClick={handleResetDefaults}
              className="hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {uploadModalType && (
        <UploadModal
          isOpen={true}
          type={uploadModalType}
          items={items}
          onClose={() => setUploadModalType(null)}
          onApplyUpload={handleApplyUpload}
        />
      )}

      {isPoModalOpen && (
        <SupplierPoModal
          isOpen={true}
          itemsToOrder={itemsForPo}
          onClose={() => setIsPoModalOpen(false)}
          onConfirmPo={handleConfirmPo}
        />
      )}

      {isAddEditOpen && (
        <AddEditSkuModal
          isOpen={true}
          itemToEdit={itemToEdit}
          onClose={() => {
            setIsAddEditOpen(false);
            setItemToEdit(null);
          }}
          onSave={handleSaveSku}
        />
      )}
    </div>
  );
}
