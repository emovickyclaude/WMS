export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  presetMinStock: number; // Minimum Required Stock preset in system
  stockBalance: number;   // Current physical on-hand inventory
  extraPoStock: number;   // Outstanding purchase orders expected
  supplier: string;
  unit: string;
  unitCost: number;       // In USD
  location?: string;
  lastUpdated: string;
}

export interface ShortageAnalysis {
  shortageQty: number;      // Preset Min - Stock Balance - Extra PO
  isDeficit: boolean;       // shortageQty > 0
  status: 'NOT_SUFFICIENT' | 'SUFFICIENT';
  orderQtyNeeded: number;   // Math.max(0, shortageQty)
  coveragePercent: number;  // (stockBalance + extraPoStock) / presetMinStock * 100
  estimatedOrderCost: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  createdAt: string;
  supplier: string;
  items: {
    sku: string;
    name: string;
    qtyToOrder: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalUnits: number;
  totalCost: number;
  status: 'DRAFT' | 'SENT_TO_SUPPLIER' | 'CONFIRMED' | 'RECEIVED';
  notes?: string;
}

export type UploadType = 'stock_balance' | 'extra_po';

export interface CsvParsedRow {
  sku: string;
  value: number;
  rawLine: string;
  isValid: boolean;
  error?: string;
  existingItem?: InventoryItem;
}

export function calculateShortage(item: InventoryItem): ShortageAnalysis {
  // The exact formula: Shortage = Preset Min Stock - Stock Balance - Extra PO Stock
  const shortageQty = item.presetMinStock - item.stockBalance - item.extraPoStock;
  const isDeficit = shortageQty > 0;
  const orderQtyNeeded = isDeficit ? shortageQty : 0;
  const totalAvailableAndInbound = item.stockBalance + item.extraPoStock;
  const coveragePercent = item.presetMinStock > 0 
    ? Math.round((totalAvailableAndInbound / item.presetMinStock) * 100) 
    : 100;
  
  return {
    shortageQty,
    isDeficit,
    status: isDeficit ? 'NOT_SUFFICIENT' : 'SUFFICIENT',
    orderQtyNeeded,
    coveragePercent,
    estimatedOrderCost: orderQtyNeeded * (item.unitCost || 0)
  };
}
