import React, { useState } from 'react';
import { Calculator, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface FormulaBannerProps {
  selectedItem?: InventoryItem | null;
}

export const FormulaBanner: React.FC<FormulaBannerProps> = ({ selectedItem }) => {
  const [testMin, setTestMin] = useState<number>(50);
  const [testBal, setTestBal] = useState<number>(4);
  const [testPo, setTestPo] = useState<number>(2);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);

  // If item is selected, display its live numbers; otherwise interactive simulation
  const min = selectedItem ? selectedItem.presetMinStock : testMin;
  const bal = selectedItem ? selectedItem.stockBalance : testBal;
  const po = selectedItem ? selectedItem.extraPoStock : testPo;

  const shortage = min - bal - po;
  const isDeficit = shortage > 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
                Core Shortage Calculation Engine
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Preset (50)
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              {selectedItem ? (
                <>
                  <BookOpen className="h-3 w-3 text-amber-400 inline" />
                  <span>
                    Active calculation for <strong>{selectedItem.isbn}</strong>: "{selectedItem.title}"
                  </span>
                </>
              ) : (
                'Shortage Qty = Preset Min Stock (50) − Stock Balance − Extra PO Stock'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsInteractive(!isInteractive)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              isInteractive 
                ? 'bg-amber-500 text-slate-950 font-medium border-amber-400 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isInteractive ? 'Close Simulator' : 'Test What-If Values'}
          </button>
        </div>
      </div>

      {/* Visual Equation Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left formula operands */}
        <div className="lg:col-span-8 grid grid-cols-3 sm:grid-cols-7 items-center gap-2 text-center text-xs sm:text-sm">
          {/* Preset Minimum Required Stock */}
          <div className="col-span-1 sm:col-span-2 bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] block uppercase tracking-wider text-slate-400 font-medium truncate">
              Preset Min Stock
            </span>
            {isInteractive && !selectedItem ? (
              <input
                type="number"
                min="0"
                value={testMin}
                onChange={e => setTestMin(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-lg font-bold text-amber-400 mt-1 font-mono focus:outline-none focus:border-amber-400"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
                {min}
              </div>
            )}
            <span className="text-[10px] text-slate-400 block truncate">Preset from Minimum Qty.xlsx</span>
          </div>

          <div className="col-span-1 sm:col-span-0.5 flex justify-center text-slate-400 text-lg sm:text-2xl font-black">
            −
          </div>

          {/* Stock Balance */}
          <div className="col-span-1 sm:col-span-2 bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] block uppercase tracking-wider text-slate-400 font-medium">
              Stock Balance
            </span>
            {isInteractive && !selectedItem ? (
              <input
                type="number"
                min="0"
                value={testBal}
                onChange={e => setTestBal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-lg font-bold text-cyan-400 mt-1 font-mono focus:outline-none focus:border-cyan-400"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
                {bal}
              </div>
            )}
            <span className="text-[10px] text-slate-400 block truncate">Physical On-Hand</span>
          </div>

          <div className="col-span-1 sm:col-span-0.5 flex justify-center text-slate-400 text-lg sm:text-2xl font-black">
            −
          </div>

          {/* Extra PO Stock */}
          <div className="col-span-1 sm:col-span-2 bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <span className="text-[11px] block uppercase tracking-wider text-slate-400 font-medium">
              Extra PO Stock
            </span>
            {isInteractive && !selectedItem ? (
              <input
                type="number"
                min="0"
                value={testPo}
                onChange={e => setTestPo(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-lg font-bold text-purple-400 mt-1 font-mono focus:outline-none focus:border-purple-400"
              />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 mt-1">
                {po}
              </div>
            )}
            <span className="text-[10px] text-slate-400 block truncate">Inbound Orders</span>
          </div>
        </div>

        {/* Equals Sign */}
        <div className="hidden lg:flex justify-center text-slate-400 text-2xl font-black">
          =
        </div>

        {/* Calculated Result Card */}
        <div className="lg:col-span-3">
          <div
            className={`rounded-xl p-3 border transition-all ${
              isDeficit
                ? 'bg-rose-950/70 border-rose-500/60 shadow-lg shadow-rose-950/40'
                : 'bg-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">
                Shortage Qty
              </span>
              {isDeficit ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                  <AlertTriangle className="h-3 w-3" /> Qty Not Sufficient
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> Sufficient Stock
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  isDeficit ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {shortage > 0 ? `+${shortage}` : shortage}
              </span>
              <span className="text-xs text-slate-300">units</span>
            </div>

            <div className="mt-1 pt-1.5 border-t border-slate-700/50 text-[11px] text-slate-300">
              {isDeficit ? (
                <span className="text-rose-300 font-medium flex items-center gap-1">
                  <ArrowRight className="h-3 w-3 inline shrink-0" />
                  Must order <strong>{shortage} units</strong> from supplier
                </span>
              ) : (
                <span className="text-emerald-300">
                  Inventory covered (+{Math.abs(shortage)} buffer units)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
