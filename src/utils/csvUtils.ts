import { InventoryItem, CsvParsedRow, UploadType, calculateShortage } from '../types/inventory';

export function parseUploadCsv(
  csvText: string,
  uploadType: UploadType,
  existingItems: InventoryItem[]
): { rows: CsvParsedRow[]; validCount: number; invalidCount: number; matchedCount: number } {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const rows: CsvParsedRow[] = [];
  const itemMap = new Map(existingItems.map(item => [item.sku.toUpperCase(), item]));

  // Check if first line looks like a header (contains non-numeric in second col or matches 'sku', 'stock', etc.)
  let startIndex = 0;
  if (lines.length > 0) {
    const firstLineCols = lines[0].split(',').map(c => c.trim().toLowerCase());
    if (
      firstLineCols[0].includes('sku') || 
      firstLineCols[1]?.includes('stock') || 
      firstLineCols[1]?.includes('balance') || 
      firstLineCols[1]?.includes('po') || 
      firstLineCols[1]?.includes('qty') ||
      isNaN(Number(firstLineCols[1]))
    ) {
      startIndex = 1;
    }
  }

  let validCount = 0;
  let invalidCount = 0;
  let matchedCount = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma
    const parts = rawLine.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 2) {
      rows.push({
        sku: parts[0] || 'Unknown',
        value: 0,
        rawLine,
        isValid: false,
        error: 'Missing value column (format must be: SKU, Quantity)',
      });
      invalidCount++;
      continue;
    }

    const sku = parts[0].trim();
    const rawValue = parts[1].trim();
    const numericValue = Number(rawValue);

    if (!sku) {
      rows.push({
        sku: 'EMPTY',
        value: 0,
        rawLine,
        isValid: false,
        error: 'SKU code is empty',
      });
      invalidCount++;
      continue;
    }

    if (isNaN(numericValue) || numericValue < 0) {
      rows.push({
        sku,
        value: 0,
        rawLine,
        isValid: false,
        error: `Invalid quantity "${rawValue}". Must be a non-negative number.`,
      });
      invalidCount++;
      continue;
    }

    const matchedItem = itemMap.get(sku.toUpperCase());
    if (matchedItem) {
      matchedCount++;
    }

    rows.push({
      sku,
      value: Math.round(numericValue),
      rawLine,
      isValid: true,
      existingItem: matchedItem,
    });
    validCount++;
  }

  return { rows, validCount, invalidCount, matchedCount };
}

export function downloadSampleCsv(type: UploadType) {
  let content = '';
  let filename = '';

  if (type === 'stock_balance') {
    content = `SKU,stock_balance\nSKU-1001,15\nSKU-1002,50\nSKU-1003,30\nSKU-1004,20\nSKU-1005,60`;
    filename = 'stock_balance_sample.csv';
  } else {
    content = `SKU,extra_po_stock\nSKU-1001,10\nSKU-1002,0\nSKU-1003,15\nSKU-1004,25\nSKU-1005,30`;
    filename = 'extra_po_sample.csv';
  }

  triggerDownload(content, filename, 'text/csv');
}

export function exportRequisitionsCsv(items: InventoryItem[], filterOnlyDeficit = false) {
  const exportItems = filterOnlyDeficit 
    ? items.filter(item => calculateShortage(item).isDeficit)
    : items;

  const headers = [
    'SKU',
    'Item Name',
    'Category',
    'Preset Min Stock',
    'Current Stock Balance',
    'Extra PO Stock',
    'Shortage Qty',
    'Status',
    'Qty to Order',
    'Unit Cost (USD)',
    'Estimated Total (USD)',
    'Supplier',
    'Warehouse Location'
  ];

  const rows = exportItems.map(item => {
    const calc = calculateShortage(item);
    return [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.presetMinStock,
      item.stockBalance,
      item.extraPoStock,
      calc.shortageQty,
      calc.isDeficit ? 'Qty Not Sufficient' : 'Sufficient',
      calc.orderQtyNeeded,
      item.unitCost.toFixed(2),
      calc.estimatedOrderCost.toFixed(2),
      `"${item.supplier.replace(/"/g, '""')}"`,
      `"${item.location || 'N/A'}"`
    ].join(',');
  });

  const csvString = [headers.join(','), ...rows].join('\n');
  const filename = `LogiFlow_PO_Requisition_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvString, filename, 'text/csv');
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
