import * as XLSX from 'xlsx';
import { InventoryItem, CsvParsedRow, UploadType, calculateShortage } from '../types/inventory';

// Normalize ISBN for flexible matching (removes hyphens, spaces, and non-alphanumeric)
export function cleanIsbn(val: string): string {
  return String(val || '').replace(/[-\s]/g, '').trim().toUpperCase();
}

/**
 * Universal file parser supporting both Excel (.xlsx, .xls) and CSV text
 */
export function parseUploadFile(
  fileData: ArrayBuffer | string,
  fileName: string,
  uploadType: UploadType,
  existingItems: InventoryItem[]
): { rows: CsvParsedRow[]; validCount: number; invalidCount: number; matchedCount: number } {
  const rows: CsvParsedRow[] = [];

  // Index existing items by raw ISBN and normalized clean ISBN
  const itemMap = new Map<string, InventoryItem>();
  existingItems.forEach(item => {
    itemMap.set(item.isbn.toUpperCase(), item);
    itemMap.set(cleanIsbn(item.isbn), item);
  });

  let rawSheetData: (string | number | undefined)[][] = [];

  try {
    const workbook = typeof fileData === 'string'
      ? XLSX.read(fileData, { type: 'string' })
      : XLSX.read(new Uint8Array(fileData), { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { rows: [], validCount: 0, invalidCount: 0, matchedCount: 0 };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    rawSheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | undefined)[][];
  } catch (err) {
    console.error('Error parsing file with XLSX:', err);
    // Fallback if string CSV
    if (typeof fileData === 'string') {
      const lines = fileData.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      rawSheetData = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, '')));
    }
  }

  if (!rawSheetData || rawSheetData.length === 0) {
    return { rows: [], validCount: 0, invalidCount: 0, matchedCount: 0 };
  }

  // Find column indices
  let isbnColIdx = 0;
  let qtyColIdx = 1;
  let startIndex = 0;

  // Inspect first 2 rows for header detection
  const firstRow = rawSheetData[0] || [];
  const firstRowStrings = firstRow.map(c => String(c ?? '').toLowerCase().trim());

  let foundHeader = false;
  firstRowStrings.forEach((col, idx) => {
    if (col.includes('isbn') || col.includes('sku') || col.includes('code') || col.includes('barcode')) {
      isbnColIdx = idx;
      foundHeader = true;
    }
    if (
      col.includes('stock') ||
      col.includes('balance') ||
      col.includes('extra') ||
      col.includes('po') ||
      col.includes('qty') ||
      col.includes('quantity') ||
      col.includes('units') ||
      col.includes('copies')
    ) {
      qtyColIdx = idx;
      foundHeader = true;
    }
  });

  if (foundHeader) {
    startIndex = 1;
  } else {
    // If first column is not numeric and second is numeric or vice-versa
    const col0IsNum = !isNaN(Number(firstRow[0])) && String(firstRow[0]).trim().length < 6;
    const col1IsNum = !isNaN(Number(firstRow[1]));
    if (!col0IsNum && col1IsNum) {
      // row 0 might be data or header
      if (isNaN(Number(firstRow[1]))) {
        startIndex = 1;
      }
    }
  }

  let validCount = 0;
  let invalidCount = 0;
  let matchedCount = 0;

  for (let i = startIndex; i < rawSheetData.length; i++) {
    const row = rawSheetData[i];
    if (!row || row.length === 0) continue;

    // Skip empty lines
    const isAllEmpty = row.every(c => c === undefined || c === null || String(c).trim() === '');
    if (isAllEmpty) continue;

    const rawIsbn = row[isbnColIdx] !== undefined ? String(row[isbnColIdx]).trim() : '';
    const rawVal = row[qtyColIdx] !== undefined ? String(row[qtyColIdx]).trim() : '';
    const rawLine = row.map(c => String(c ?? '')).join(', ');

    if (!rawIsbn) {
      rows.push({
        isbn: 'EMPTY',
        value: 0,
        rawLine,
        isValid: false,
        error: 'ISBN is missing',
      });
      invalidCount++;
      continue;
    }

    const numericValue = Number(rawVal);
    if (rawVal === '' || isNaN(numericValue) || numericValue < 0) {
      rows.push({
        isbn: rawIsbn,
        value: 0,
        rawLine,
        isValid: false,
        error: `Invalid quantity "${rawVal}". Must be non-negative integer.`,
      });
      invalidCount++;
      continue;
    }

    const matchedItem = itemMap.get(rawIsbn.toUpperCase()) || itemMap.get(cleanIsbn(rawIsbn));
    if (matchedItem) {
      matchedCount++;
    }

    rows.push({
      isbn: rawIsbn,
      value: Math.round(numericValue),
      rawLine,
      isValid: true,
      existingItem: matchedItem,
    });
    validCount++;
  }

  return { rows, validCount, invalidCount, matchedCount };
}

// Backwards-compatible CSV string parser
export function parseUploadCsv(
  csvText: string,
  uploadType: UploadType,
  existingItems: InventoryItem[]
): { rows: CsvParsedRow[]; validCount: number; invalidCount: number; matchedCount: number } {
  return parseUploadFile(csvText, 'pasted.csv', uploadType, existingItems);
}

/**
 * Download sample file in either Excel (.xlsx) or CSV format
 */
export function downloadSampleFile(type: UploadType, format: 'xlsx' | 'csv' = 'xlsx') {
  const isStockBalance = type === 'stock_balance';
  const qtyHeader = isStockBalance ? 'stock_balance' : 'extra_po_stock';
  
  const sampleData = [
    { ISBN: '9781108742719', [qtyHeader]: isStockBalance ? 15 : 10 },
    { ISBN: '9781108789943', [qtyHeader]: isStockBalance ? 20 : 15 },
    { ISBN: '9781108819558', [qtyHeader]: isStockBalance ? 30 : 10 },
    { ISBN: '9789815055344', [qtyHeader]: isStockBalance ? 25 : 20 },
    { ISBN: '9781382006668', [qtyHeader]: isStockBalance ? 18 : 10 },
    { ISBN: '9781382006729', [qtyHeader]: isStockBalance ? 16 : 12 },
  ];

  const filenameBase = isStockBalance ? 'stock_balance_sample' : 'extra_po_sample';

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isStockBalance ? 'StockBalance' : 'ExtraPO');
    const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    triggerDownloadBlob(new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filenameBase}.xlsx`);
  } else {
    const csvContent = `ISBN,${qtyHeader}\n` + sampleData.map(d => `${d.ISBN},${d[qtyHeader]}`).join('\n');
    triggerDownloadText(csvContent, `${filenameBase}.csv`, 'text/csv');
  }
}

export function downloadSampleCsv(type: UploadType) {
  downloadSampleFile(type, 'csv');
}

/**
 * Export Requisitions in Excel (.xlsx) or CSV format
 */
export function exportRequisitions(
  items: InventoryItem[], 
  format: 'xlsx' | 'csv' = 'xlsx',
  filterOnlyDeficit = false
) {
  const exportItems = filterOnlyDeficit 
    ? items.filter(item => calculateShortage(item).isDeficit)
    : items;

  const data = exportItems.map(item => {
    const calc = calculateShortage(item);
    return {
      'ISBN': item.isbn,
      'Book Title': item.title,
      'Category': item.category,
      'Preset Min Stock (Minimum Qty.xlsx)': item.presetMinStock,
      'Current Stock Balance': item.stockBalance,
      'Extra PO Stock': item.extraPoStock,
      'Shortage Qty': calc.shortageQty,
      'Status Rule': calc.isDeficit ? 'Qty Not Sufficient' : 'Sufficient',
      'Qty to Order': calc.orderQtyNeeded,
      'Unit Cost (USD)': item.unitCost,
      'Estimated Total (USD)': Number(calc.estimatedOrderCost.toFixed(2)),
      'Publisher / Supplier': item.supplier,
      'Warehouse Shelf Location': item.location || 'N/A'
    };
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `LogiFlow_Book_Requisition_${dateStr}`;

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(data);
    // Auto-fit column widths
    const colWidths = [
      { wch: 16 }, // ISBN
      { wch: 55 }, // Title
      { wch: 22 }, // Category
      { wch: 15 }, // Preset
      { wch: 14 }, // Stock
      { wch: 14 }, // Extra PO
      { wch: 13 }, // Shortage
      { wch: 18 }, // Status
      { wch: 14 }, // Qty to order
      { wch: 14 }, // Unit Cost
      { wch: 16 }, // Total Cost
      { wch: 30 }, // Supplier
      { wch: 20 }, // Location
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requisitions');
    const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    triggerDownloadBlob(new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${baseName}.xlsx`);
  } else {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => 
      headers.map(h => {
        const val = (row as Record<string, unknown>)[h];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    const csvString = [headers.join(','), ...rows].join('\n');
    triggerDownloadText(csvString, `${baseName}.csv`, 'text/csv');
  }
}

export function exportRequisitionsCsv(items: InventoryItem[], filterOnlyDeficit = false) {
  exportRequisitions(items, 'csv', filterOnlyDeficit);
}

function triggerDownloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  triggerDownloadBlob(blob, filename);
}

function triggerDownloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
