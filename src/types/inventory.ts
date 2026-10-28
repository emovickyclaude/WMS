export interface InventoryItem {
  isbn: string;
  title: string;
  category: string;
  presetMinStock: number; // Minimum Required Stock preset (default 10 units)
  stockBalance: number;   // Current physical on-hand inventory
  extraPoStock: number;   // Outstanding purchase orders expected
  supplier: string;
  unit: string;
  unitCost: number;       // In USD
  location?: string;
  lastUpdated: string;
}

export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'CUSTOMER_SERVICE';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface ShortageAnalysis {
  shortageQty: number;      
  isDeficit: boolean;       
  status: 'NOT_SUFFICIENT' | 'SUFFICIENT';
  orderQtyNeeded: number;   
  coveragePercent: number;  
  estimatedOrderCost: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  createdAt: string;
  supplier: string;
  items: {
    isbn: string;
    title: string;
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
  isbn: string;
  value: number;
  rawLine: string;
  isValid: boolean;
  error?: string;
  existingItem?: InventoryItem;
}

export function calculateShortage(item: InventoryItem): ShortageAnalysis {
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
