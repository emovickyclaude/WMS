import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Truck, 
  ArrowRight,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { InventoryItem, UploadType, CsvParsedRow } from '../types/inventory';
import { parseUploadCsv, downloadSampleCsv } from '../utils/csvUtils';
import confetti from 'canvas-confetti';

interface UploadModalProps {
  isOpen: boolean;
  type: UploadType;
  items: InventoryItem[];
  onClose: () => void;
  onApplyUpload: (type: UploadType, updates: { isbn: string; value: number }[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  type,
  items,
  onClose,
  onApplyUpload,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<{
    rows: CsvParsedRow[];
    validCount: number;
    invalidCount: number;
    matchedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isStockBalance = type === 'stock_balance';
  const modalTitle = isStockBalance ? 'Upload Stock Balance CSV' : 'Upload Extra PO Stock CSV';
  const formatExample = isStockBalance 
    ? 'ISBN,stock_balance\n9781108742719,15\n9781108789943,20\n9781108819558,30' 
    : 'ISBN,extra_po_stock\n9781108742719,10\n9781108789943,15\n9781108819558,10';

  const handleProcessText = (text: string, name = 'Pasted Data') => {
    setCsvContent(text);
    setFileName(name);
    const result = parseUploadCsv(text, type, items);
    setParsedResult(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        handleProcessText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    const validUpdates = parsedResult.rows
      .filter(r => r.isValid)
      .map(r => ({ isbn: r.isbn, value: r.value }));

    if (validUpdates.length === 0) return;

    onApplyUpload(type, validUpdates);
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
    
    onClose();
  };

  const handleReset = () => {
    setCsvContent('');
    setFileName('');
    setParsedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
          isStockBalance ? 'bg-gradient-to-r from-cyan-900 to-slate-900' : 'bg-gradient-to-r from-purple-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
              isStockBalance ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {isStockBalance ? <Package className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/10">
                  {isStockBalance ? 'Icon 1' : 'Icon 2'}
                </span>
                <h3 className="text-lg font-bold">{modalTitle}</h3>
              </div>
              <p className="text-xs text-slate-300">
                {isStockBalance 
                  ? 'Update on-hand physical warehouse balances per ISBN' 
                  : 'Update outstanding inbound purchase order quantities per ISBN'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200">
          {/* Dropzone */}
          {!parsedResult ? (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className={`mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${
                  isStockBalance ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                }`}>
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Click to browse or drag & drop CSV file
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Format: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">{isStockBalance ? 'isbn, stock_balance' : 'isbn, extra_po_stock'}</code>
                </p>
              </div>

              {/* Quick sample download or manual paste */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleCsv(type);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download {isStockBalance ? 'stock_balance.csv' : 'extra_po.csv'} Sample
                </button>

                <button
                  type="button"
                  onClick={() => handleProcessText(formatExample, 'Sample Template')}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  Load Sample Values
                </button>
              </div>

              {/* Paste Text Area */}
              <div className="pt-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste Raw CSV Lines Directly:
                </label>
                <textarea
                  rows={3}
                  value={csvContent}
                  onChange={e => handleProcessText(e.target.value, 'Pasted Input')}
                  placeholder={formatExample}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{fileName}</span>
                  <span className="text-slate-400">({parsedResult.rows.length} lines detected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                    {parsedResult.validCount} valid
                  </span>
                  {parsedResult.invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                      {parsedResult.invalidCount} invalid
                    </span>
                  )}
                  <button
                    onClick={handleReset}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    title="Change file"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Parsed Rows Preview Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">ISBN</th>
                      <th className="p-2.5">Book Title</th>
                      <th className="p-2.5 text-right">Current</th>
                      <th className="p-2.5 text-right">New {isStockBalance ? 'Balance' : 'Extra PO'}</th>
                      <th className="p-2.5 text-right">Delta</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {parsedResult.rows.map((row, idx) => {
                      const item = row.existingItem;
                      const currentVal = item 
                        ? (isStockBalance ? item.stockBalance : item.extraPoStock) 
                        : null;
                      const delta = currentVal !== null ? row.value - currentVal : null;

                      return (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                            !row.isValid ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {row.isbn}
                          </td>
                          <td className="p-2.5 font-sans truncate max-w-[180px] text-slate-600 dark:text-slate-400">
                            {item ? item.title : <span className="text-amber-500 italic">Not in catalogue</span>}
                          </td>
                          <td className="p-2.5 text-right text-slate-500">
                            {currentVal !== null ? currentVal : '—'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                            {row.isValid ? row.value : 'ERR'}
                          </td>
                          <td className="p-2.5 text-right font-medium">
                            {delta !== null ? (
                              <span className={delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="p-2.5 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-sans font-medium" title={row.error}>
                                <AlertCircle className="h-3 w-3" /> {row.error || 'Error'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {parsedResult.matchedCount < parsedResult.validCount && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    Some ISBNs in this file are not yet registered in the inventory catalogue. Only matched books will have their values updated.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult || parsedResult.validCount === 0}
            onClick={handleApply}
            className={`px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isStockBalance
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
            }`}
          >
            <span>Apply {parsedResult ? `${parsedResult.validCount} Updates` : 'Updates'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
