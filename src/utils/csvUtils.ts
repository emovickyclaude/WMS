import { InventoryItem, CsvParsedRow, UploadType, calculateShortage } from '../types/inventory';

// Normalize ISBN for flexible matching (removes hyphens and spaces)
function cleanIsbn(val: string): string {
  return val.replace(/[-\s]/g, '').toUpperCase();
}

export function parseUploadCsv(
  csvText: string,
  uploadType: UploadType,
  existingItems: InventoryItem[]
): { rows: CsvParsedRow[]; validCount: number; invalidCount: number; matchedCount: number } {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const rows: CsvParsedRow[] = [];

  // Index existing items by raw ISBN and normalized ISBN
  const itemMap = new Map<string, InventoryItem>();
  existingItems.forEach(item => {
    itemMap.set(item.isbn.toUpperCase(), item);
    itemMap.set(cleanIsbn(item.isbn), item);
  });

  // Check if first line is a header row
  let startIndex = 0;
  if (lines.length > 0) {
    const firstLineCols = lines[0].split(',').map(c => c.trim().toLowerCase());
    if (
      firstLineCols[0].includes('isbn') || 
      firstLineCols[0].includes('sku') || 
      firstLineCols[0].includes('title') || 
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
    const parts = rawLine.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 2) {
      rows.push({
        isbn: parts[0] || 'Unknown',
        value: 0,
        rawLine,
        isValid: false,
        error: 'Missing value column (format: ISBN, Quantity)',
      });
      invalidCount++;
      continue;
    }

    const isbn = parts[0].trim();
    const rawValue = parts[1].trim();
    const numericValue = Number(rawValue);

    if (!isbn) {
      rows.push({
        isbn: 'EMPTY',
        value: 0,
        rawLine,
        isValid: false,
        error: 'ISBN is empty',
      });
      invalidCount++;
      continue;
    }

    if (isNaN(numericValue) || numericValue < 0) {
      rows.push({
        isbn,
        value: 0,
        rawLine,
        isValid: false,
        error: `Invalid quantity "${rawValue}". Must be a non-negative integer.`,
      });
      invalidCount++;
      continue;
    }

    const matchedItem = itemMap.get(isbn.toUpperCase()) || itemMap.get(cleanIsbn(isbn));
    if (matchedItem) {
      matchedCount++;
    }

    rows.push({
      isbn,
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
    content = `ISBN,stock_balance\n9781108742719,15\n9781108789943,20\n9781108819558,30\n9789815055344,25\n9781382006668,15\n9781382006729,18`;
    filename = 'stock_balance_sample.csv';
  } else {
    content = `ISBN,extra_po_stock\n9781108742719,10\n9781108789943,15\n9781108819558,10\n9789815055344,25\n9781382006668,10\n9781382006729,12`;
    filename = 'extra_po_sample.csv';
  }

  triggerDownload(content, filename, 'text/csv');
}

export function exportRequisitionsCsv(items: InventoryItem[], filterOnlyDeficit = false) {
  const exportItems = filterOnlyDeficit 
    ? items.filter(item => calculateShortage(item).isDeficit)
    : items;

  const headers = [
    'ISBN',
    'Book Title',
    'Category',
    'Preset Min Stock (Minimum Qty.xlsx)',
    'Current Stock Balance',
    'Extra PO Stock',
    'Shortage Qty',
    'Status Rule',
    'Qty to Order',
    'Unit Cost (USD)',
    'Estimated Total (USD)',
    'Publisher / Supplier',
    'Warehouse Shelf Location'
  ];

  const rows = exportItems.map(item => {
    const calc = calculateShortage(item);
    return [
      `"${item.isbn}"`,
      `"${item.title.replace(/"/g, '""')}"`,
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
  const filename = `LogiFlow_Book_Requisition_${new Date().toISOString().slice(0, 10)}.csv`;
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
