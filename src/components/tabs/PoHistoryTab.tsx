import React from 'react';
import { PurchaseOrderRecord } from '../../types/inventory';
import { ShoppingBag, Calendar, BookOpen } from 'lucide-react';

interface PoHistoryTabProps {
  poRecords: PurchaseOrderRecord[];
  onOpenNewPo: () => void;
  onUpdatePoStatus: (id: string, newStatus: PurchaseOrderRecord['status']) => void;
}

export const PoHistoryTab: React.FC<PoHistoryTabProps> = ({
  poRecords,
  onOpenNewPo,
  onUpdatePoStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Publisher & Supplier Requisition Orders
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log of purchase requisitions generated to replenish deficit stock from publishers and book distributors.
          </p>
        </div>

        <button
          onClick={onOpenNewPo}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          Create New Requisition
        </button>
      </div>

      {poRecords.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40 text-indigo-400" />
          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
            No Supplier Requisitions Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            When books are calculated as "Qty Not Sufficient", click "Order from Supplier" in the Order Requisition Engine to generate a formal purchase order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {poRecords.map(po => (
            <div
              key={po.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                    {po.poNumber}
                  </span>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(po.createdAt).toLocaleDateString()} {new Date(po.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {po.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    ${po.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Items in this PO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
                {po.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {it.isbn}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {it.title}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        +{it.qtyToOrder}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        ${it.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {po.notes && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                  Note: {po.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
