import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Building2, 
  PlusCircle
} from 'lucide-react';
import { InventoryItem, calculateShortage, PurchaseOrderRecord } from '../types/inventory';
import confetti from 'canvas-confetti';

interface SupplierPoModalProps {
  isOpen: boolean;
  itemsToOrder: InventoryItem[];
  onClose: () => void;
  onConfirmPo: (newPo: PurchaseOrderRecord, autoAddToExtraPo: boolean) => void;
}

export const SupplierPoModal: React.FC<SupplierPoModalProps> = ({
  isOpen,
  itemsToOrder,
  onClose,
  onConfirmPo,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [autoAddIncoming, setAutoAddIncoming] = useState<boolean>(true);
  const [orderNotes, setOrderNotes] = useState<string>('Standard warehouse book safety stock replenishment. Please expedite dispatch.');

  if (!isOpen || itemsToOrder.length === 0) return null;

  // Generate PO number
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculate items and totals using ISBN and Title
  const orderItems = itemsToOrder.map(item => {
    const calc = calculateShortage(item);
    const qtyToOrder = calc.orderQtyNeeded;
    const totalCost = qtyToOrder * item.unitCost;
    return {
      isbn: item.isbn,
      title: item.title,
      supplier: item.supplier,
      qtyToOrder,
      unitCost: item.unitCost,
      unit: item.unit,
      totalCost,
    };
  });

  const totalUnits = orderItems.reduce((acc, curr) => acc + curr.qtyToOrder, 0);
  const totalCost = orderItems.reduce((acc, curr) => acc + curr.totalCost, 0);

  // Group by publisher / supplier
  const supplierGroups: Record<string, typeof orderItems> = {};
  orderItems.forEach(item => {
    if (!supplierGroups[item.supplier]) supplierGroups[item.supplier] = [];
    supplierGroups[item.supplier].push(item);
  });

  const handleCopyEmail = () => {
    const textLines = [
      `PURCHASE REQUISITION ORDER: ${poNumber}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Units: ${totalUnits}`,
      `Estimated Total: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      '',
      '--- BOOKS TO ORDER (LOGIFLOW WMS DEFICIT REQUISITION) ---',
      ...orderItems.map(
        i => `• ISBN: ${i.isbn} | "${i.title}" | Qty: ${i.qtyToOrder} ${i.unit} | Unit: $${i.unitCost.toFixed(2)} | Publisher/Supplier: ${i.supplier}`
      ),
      '',
      `Notes: ${orderNotes}`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmOrder = () => {
    const newRecord: PurchaseOrderRecord = {
      id: `po-${Date.now()}`,
      poNumber,
      createdAt: new Date().toISOString(),
      supplier: Object.keys(supplierGroups).join(', '),
      items: orderItems,
      totalUnits,
      totalCost,
      status: 'SENT_TO_SUPPLIER',
      notes: orderNotes,
    };

    onConfirmPo(newRecord, autoAddIncoming);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold">
                  {poNumber}
                </span>
                <h3 className="text-lg font-bold">Publisher / Supplier Requisition Order</h3>
              </div>
              <p className="text-xs text-slate-300">
                Replenishing {orderItems.length} book titles with insufficient inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Deficit Titles
              </span>
              <div className="text-2xl font-bold font-mono text-rose-800 dark:text-rose-200 mt-0.5">
                {orderItems.length} titles
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Total Units Required
              </span>
              <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-200 mt-0.5">
                {totalUnits.toLocaleString()} copies
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Estimated Order Cost
              </span>
              <div className="text-2xl font-bold font-mono text-indigo-800 dark:text-indigo-200 mt-0.5">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Publisher grouped breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Breakdown by Publisher / Supplier
            </h4>

            {Object.entries(supplierGroups).map(([supplierName, items], gIdx) => (
              <div
                key={gIdx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {supplierName}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                    {items.length} title{items.length > 1 ? 's' : ''} · $
                    {items.reduce((s, i) => s + i.totalCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map(item => (
                    <div key={item.isbn} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {item.isbn}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[280px]">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Unit price: ${item.unitCost.toFixed(2)} / {item.unit}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                          Order +{item.qtyToOrder} {item.unit}
                        </span>
                        <div className="font-mono text-slate-500 text-[11px]">
                          ${item.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Automatic Inbound Conversion Option */}
          <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAddIncoming}
                onChange={e => setAutoAddIncoming(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Automatically convert ordered copies into Extra PO Stock
                </span>
                <p className="text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                  When enabled, marking this PO as dispatched will add +{totalUnits} units directly to the "Extra PO Stock" column, instantly satisfying the safety threshold in LogiFlow WMS!
                </p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Procurement Instructions / Supplier Notes:
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied Order Summary' : 'Copy Email Order Text'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmOrder}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Confirm & Dispatch PO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
