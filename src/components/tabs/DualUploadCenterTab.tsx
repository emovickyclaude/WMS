import React from 'react';
import { 
  Package, 
  Truck, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight,
  Database,
  History,
  Info
} from 'lucide-react';
import { InventoryItem, UploadType } from '../../types/inventory';
import { downloadSampleCsv } from '../../utils/csvUtils';
import { QuickAdjustDropdown } from '../QuickAdjustDropdown';

interface DualUploadCenterTabProps {
  items: InventoryItem[];
  onOpenUploadModal: (type: UploadType) => void;
  onQuickUpdateItem: (sku: string, type: UploadType, value: number) => void;
  recentUploads: {
    id: string;
    type: UploadType;
    fileName: string;
    recordsCount: number;
    timestamp: string;
  }[];
}

export const DualUploadCenterTab: React.FC<DualUploadCenterTabProps> = ({
  items,
  onOpenUploadModal,
  onQuickUpdateItem,
  recentUploads,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Database className="h-4 w-4" />
            <span>Dual Ingestion Architecture · LogiFlow WMS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Dual Upload & Update Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Keep warehouse inventory synchronized with two dedicated ingestion channels. Upload bulk CSV files or use the quick-adjust controls below. LogiFlow immediately re-calculates safety deficits across all SKUs.
          </p>
        </div>
      </div>

      {/* Dual Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Stock Balance Update (Icon 1) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header / Icon 1 Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
                  <Package className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      Icon 1
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      Stock Balance Update
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Physical on-hand inventory residing in the warehouse
                  </p>
                </div>
              </div>
            </div>

            {/* Ingestion Dropzone & Instructions */}
            <div className="my-5 space-y-3">
              <div 
                onClick={() => onOpenUploadModal('stock_balance')}
                className="border-2 border-dashed border-cyan-300 dark:border-cyan-800/80 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-xl p-6 text-center bg-cyan-50/40 dark:bg-cyan-950/20 cursor-pointer transition-all hover:bg-cyan-50 dark:hover:bg-cyan-950/40 group"
              >
                <div className="h-12 w-12 rounded-xl bg-cyan-600 text-white mx-auto flex items-center justify-center shadow-md shadow-cyan-600/30 group-hover:scale-105 transition-transform mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Upload Stock Balance CSV
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Expected schema: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-cyan-700 dark:text-cyan-300">sku, stock_balance</code>
                </p>
                <span className="mt-3 inline-block px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                  Launch Upload Parser
                </span>
              </div>

              {/* Sample Download button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Sample: <code>SKU-1001, 15</code></span>
                <button
                  type="button"
                  onClick={() => downloadSampleCsv('stock_balance')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download stock_balance.csv
                </button>
              </div>
            </div>

            {/* Manual Quick Adjust Component */}
            <div className="pt-2">
              <QuickAdjustDropdown
                items={items}
                type="stock_balance"
                onUpdate={(sku, val) => onQuickUpdateItem(sku, 'stock_balance', val)}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Extra PO Stock Update (Icon 2) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header / Icon 2 Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
                  <Truck className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Icon 2
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      Extra PO Stock Update
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active supplier purchase orders expected to arrive
                  </p>
                </div>
              </div>
            </div>

            {/* Ingestion Dropzone & Instructions */}
            <div className="my-5 space-y-3">
              <div 
                onClick={() => onOpenUploadModal('extra_po')}
                className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 hover:border-purple-500 dark:hover:border-purple-400 rounded-xl p-6 text-center bg-purple-50/40 dark:bg-purple-950/20 cursor-pointer transition-all hover:bg-purple-50 dark:hover:bg-purple-950/40 group"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-600 text-white mx-auto flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Upload Extra PO Stock CSV
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Expected schema: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-purple-700 dark:text-purple-300">sku, extra_po_stock</code>
                </p>
                <span className="mt-3 inline-block px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                  Launch Upload Parser
                </span>
              </div>

              {/* Sample Download button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Sample: <code>SKU-1001, 10</code></span>
                <button
                  type="button"
                  onClick={() => downloadSampleCsv('extra_po')}
                  className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download extra_po.csv
                </button>
              </div>
            </div>

            {/* Manual Quick Adjust Component */}
            <div className="pt-2">
              <QuickAdjustDropdown
                items={items}
                type="extra_po"
                onUpdate={(sku, val) => onQuickUpdateItem(sku, 'extra_po', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sync History / Audit Logs */}
      {recentUploads.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Ingestion Logs
            </h4>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentUploads.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    log.type === 'stock_balance' 
                      ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' 
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                  }`}>
                    {log.type === 'stock_balance' ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.type === 'stock_balance' ? 'Stock Balance' : 'Extra PO Stock'}
                    </span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500">{log.fileName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-slate-500">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{log.recordsCount} records applied
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
