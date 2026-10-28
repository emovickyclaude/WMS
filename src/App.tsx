import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  ShoppingCart, 
  Warehouse,
  Users,
  Lock,
  User,
  LogIn,
  LogOut,
  Shield,
  KeyRound,
  Info
} from 'lucide-react';
import { 
  InventoryItem, 
  UploadType, 
  PurchaseOrderRecord, 
  UserStatus,
  calculateShortage 
} from './types/inventory';
import { 
  AppUser, 
  UserPermissions, 
  UserRole, 
  INITIAL_USERS,
  ROLE_DEFAULT_PERMISSIONS
} from './types/auth';
import { INITIAL_INVENTORY } from './data/initialData';
import { FormulaBanner } from './components/FormulaBanner';
import { UploadModal } from './components/UploadModal';
import { SupplierPoModal } from './components/SupplierPoModal';
import { AddEditSkuModal } from './components/AddEditSkuModal';
import { AuthModal } from './components/AuthModal';
import { OrderRequisitionTab } from './components/tabs/OrderRequisitionTab';
import { PresetStockSetupTab } from './components/tabs/PresetStockSetupTab';
import { DualUploadCenterTab } from './components/tabs/DualUploadCenterTab';
import { PoHistoryTab } from './components/tabs/PoHistoryTab';
import { AdminUserManagementTab } from './components/tabs/AdminUserManagementTab';

const STORAGE_KEY_ITEMS = 'logiflow_wms_phase1_inventory_preset50_v11';
const STORAGE_KEY_POS = 'logiflow_wms_phase1_pos_preset50_v11';
const STORAGE_KEY_LOGS = 'logiflow_wms_phase1_upload_logs_preset50_v11';
const STORAGE_KEY_USERS = 'logiflow_wms_phase1_users_preset50_v11';
const STORAGE_KEY_CURRENT_USER = 'logiflow_wms_phase1_current_user_preset50_v11';

export default function App() {
  // Users state
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.uid)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS[0]; // Master Admin (master@admin.com) by default
  });

  const currentPermissions: UserPermissions = useMemo(() => {
    return currentUser?.permissions || {
      canUploadStockBalance: false,
      canUploadExtraPo: false,
      canEditPresetMinStock: false,
      canCreatePo: false,
      canManageUsers: false,
      canExportData: false,
      canResetDefaults: false,
    };
  }, [currentUser]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState<boolean>(false);

  // State for inventory items
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].isbn) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_INVENTORY;
  });

  // State for PO records
  const [poRecords, setPoRecords] = useState<PurchaseOrderRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // State for upload logs
  const [recentUploads, setRecentUploads] = useState<{
    id: string;
    type: UploadType;
    fileName: string;
    recordsCount: number;
    timestamp: string;
  }[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        type: 'stock_balance',
        fileName: 'Initial Cambridge & Oxford catalogue sync',
        recordsCount: 36,
        timestamp: new Date().toISOString(),
      }
    ];
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'requisition' | 'preset' | 'upload_center' | 'pos' | 'admin_users'>('requisition');

  // Currently focused/selected item for live formula breakdown
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Modal states
  const [uploadModalType, setUploadModalType] = useState<UploadType | null>(null);
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [itemsForPo, setItemsForPo] = useState<InventoryItem[]>([]);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(poRecords));
  }, [poRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(recentUploads));
  }, [recentUploads]);

  // If selected item was modified, sync it
  useEffect(() => {
    if (selectedItem) {
      const refreshed = items.find(i => i.isbn === selectedItem.isbn);
      if (refreshed) setSelectedItem(refreshed);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalPresetMin = 0;
    let totalStockOnHand = 0;
    let totalExtraPo = 0;
    let totalDeficitUnits = 0;
    let deficitCount = 0;
    let sufficientCount = 0;

    items.forEach(item => {
      totalPresetMin += item.presetMinStock;
      totalStockOnHand += item.stockBalance;
      totalExtraPo += item.extraPoStock;
      const calc = calculateShortage(item);
      if (calc.isDeficit) {
        deficitCount++;
        totalDeficitUnits += calc.orderQtyNeeded;
      } else {
        sufficientCount++;
      }
    });

    return {
      totalTitles: items.length,
      deficitCount,
      sufficientCount,
      totalDeficitUnits,
      totalStockOnHand,
      totalExtraPo,
      totalPresetMin,
    };
  }, [items]);

  // Check upload permissions on Icon 1 / Icon 2 click
  const handleOpenUploadWithPermission = (type: UploadType) => {
    if (type === 'stock_balance') {
      if (!currentPermissions.canUploadStockBalance) {
        showToast('Access Denied: Stock Balance upload option is disabled by your Administrator.');
        return;
      }
    } else {
      if (!currentPermissions.canUploadExtraPo) {
        showToast('Access Denied: Extra PO upload option is disabled by your Administrator.');
        return;
      }
    }
    setUploadModalType(type);
  };

  // Handler for uploading CSV updates
  const handleApplyUpload = (type: UploadType, updates: { isbn: string; value: number }[]) => {
    const clean = (val: string) => val.replace(/[-\s]/g, '').toUpperCase();
    const updateMap = new Map<string, number>();
    updates.forEach(u => {
      updateMap.set(u.isbn.toUpperCase(), u.value);
      updateMap.set(clean(u.isbn), u.value);
    });

    let count = 0;

    setItems(prev =>
      prev.map(item => {
        const val = updateMap.get(item.isbn.toUpperCase()) ?? updateMap.get(clean(item.isbn));
        if (val !== undefined) {
          count++;
          return {
            ...item,
            stockBalance: type === 'stock_balance' ? val : item.stockBalance,
            extraPoStock: type === 'extra_po' ? val : item.extraPoStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    const newLog = {
      id: `log-${Date.now()}`,
      type,
      fileName: type === 'stock_balance' ? 'stock_balance.csv' : 'extra_po.csv',
      recordsCount: count,
      timestamp: new Date().toISOString(),
    };
    setRecentUploads(prev => [newLog, ...prev.slice(0, 9)]);

    showToast(
      `Successfully updated ${count} book titles with new ${
        type === 'stock_balance' ? 'Stock Balances' : 'Extra PO Stock'
      }!`
    );
  };

  // Quick single item adjuster
  const handleQuickUpdateItem = (isbn: string, type: UploadType, value: number) => {
    if (type === 'stock_balance' && !currentPermissions.canUploadStockBalance) {
      showToast('Access Denied: Stock balance update restricted by Administrator.');
      return;
    }
    if (type === 'extra_po' && !currentPermissions.canUploadExtraPo) {
      showToast('Access Denied: Extra PO update restricted by Administrator.');
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.isbn === isbn) {
          return {
            ...item,
            stockBalance: type === 'stock_balance' ? value : item.stockBalance,
            extraPoStock: type === 'extra_po' ? value : item.extraPoStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast(`Updated ${isbn} ${type === 'stock_balance' ? 'Stock Balance' : 'Extra PO'} to ${value}`);
  };

  // Update preset minimum safety stock (from Minimum Qty.xlsx)
  const handleUpdateMinStock = (isbn: string, newMin: number) => {
    if (!currentPermissions.canEditPresetMinStock) {
      showToast('Access Denied: Editing preset safety stock is restricted by Administrator.');
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.isbn === isbn) {
          return {
            ...item,
            presetMinStock: newMin,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    showToast(`Updated Preset Min Stock for ${isbn} to ${newMin}`);
  };

  // Set all items to maintain specific preset quantity (default 50 copies as per Minimum Qty.xlsx)
  const handleSetAllMinStock = (targetQty: number = 50) => {
    if (!currentPermissions.canEditPresetMinStock) {
      showToast('Access Denied: Batch preset adjustments restricted by Administrator.');
      return;
    }

    setItems(prev =>
      prev.map(item => ({
        ...item,
        presetMinStock: targetQty,
        lastUpdated: new Date().toISOString(),
      }))
    );
    showToast(`Preset safety threshold set to maintain ${targetQty} copies across all titles.`);
  };

  // Batch adjust minimum safety stocks
  const handleBatchAdjustMinStock = (percentage: number, categoryFilter?: string) => {
    if (!currentPermissions.canEditPresetMinStock) {
      showToast('Access Denied: Safety stock adjustments restricted by Administrator.');
      return;
    }

    const factor = 1 + percentage / 100;
    let modified = 0;

    setItems(prev =>
      prev.map(item => {
        if (!categoryFilter || item.category === categoryFilter) {
          modified++;
          return {
            ...item,
            presetMinStock: Math.max(1, Math.round(item.presetMinStock * factor)),
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    showToast(`Adjusted Preset Safety Stock by ${percentage > 0 ? `+${percentage}` : percentage}% across ${modified} titles`);
  };

  // Add or edit book title
  const handleSaveSku = (newItem: InventoryItem) => {
    setItems(prev => {
      const existsIndex = prev.findIndex(i => i.isbn === newItem.isbn);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });
    showToast(`Saved title ${newItem.isbn} successfully`);
  };

  // Place PO handler
  const handleConfirmPo = (newPo: PurchaseOrderRecord, autoAddToExtraPo: boolean) => {
    setPoRecords(prev => [newPo, ...prev]);

    if (autoAddToExtraPo) {
      const orderMap = new Map(newPo.items.map(i => [i.isbn, i.qtyToOrder]));
      setItems(prev =>
        prev.map(item => {
          const qty = orderMap.get(item.isbn);
          if (qty && qty > 0) {
            return {
              ...item,
              extraPoStock: item.extraPoStock + qty,
              lastUpdated: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      showToast(`PO ${newPo.poNumber} dispatched! Inbound units added to Extra PO Stock.`);
    } else {
      showToast(`PO ${newPo.poNumber} created successfully!`);
    }
  };

  // Single item PO trigger
  const handleOrderSingleItem = (item: InventoryItem) => {
    if (!currentPermissions.canCreatePo) {
      showToast('Access Denied: Supplier requisition dispatch option is disabled by your Administrator.');
      return;
    }
    setItemsForPo([item]);
    setIsPoModalOpen(true);
  };

  // Bulk all deficit PO trigger
  const handleOrderAllDeficits = () => {
    if (!currentPermissions.canCreatePo) {
      showToast('Access Denied: Supplier purchase order creation is restricted by your Administrator.');
      return;
    }
    const deficitItems = items.filter(item => calculateShortage(item).isDeficit);
    if (deficitItems.length === 0) {
      showToast('No deficit titles found. All stock is currently sufficient!');
      return;
    }
    setItemsForPo(deficitItems);
    setIsPoModalOpen(true);
  };

  // Reset demo data
  const handleResetDefaults = () => {
    if (!currentPermissions.canResetDefaults) {
      showToast('Access Denied: Resetting catalogue is restricted by Administrator.');
      return;
    }
    if (window.confirm('Reset all inventory records and preset minimum safety stocks to initial 36 Cambridge & Oxford titles (50 copies preset)?')) {
      setItems(INITIAL_INVENTORY);
      setSelectedItem(null);
      showToast('Reset to default inventory data (50 copies safety stock).');
    }
  };

  // ================= ADMIN USER MANAGEMENT HANDLERS =================
  const handleUpdateUserPermissions = (id: string, newPermissions: UserPermissions) => {
    setUsers(prev =>
      prev.map(u => ((u.id === id || u.uid === id) ? { ...u, permissions: newPermissions } : u))
    );
    if (currentUser && ((currentUser.id || currentUser.uid) === id)) {
      setCurrentUser(prev => prev ? ({ ...prev, permissions: newPermissions }) : null);
    }
    showToast(`Updated user options & permissions!`);
  };

  const handleUpdateUserRole = (id: string, newRole: UserRole) => {
    setUsers(prev =>
      prev.map(u => ((u.id === id || u.uid === id) ? { ...u, role: newRole } : u))
    );
    if (currentUser && ((currentUser.id || currentUser.uid) === id)) {
      setCurrentUser(prev => prev ? ({ ...prev, role: newRole }) : null);
    }
    showToast(`Updated role to ${newRole}`);
  };

  const handleUpdateUserStatus = (id: string, newStatus: UserStatus) => {
    setUsers(prev =>
      prev.map(u => ((u.id === id || u.uid === id) ? { ...u, status: newStatus } : u))
    );
    if (currentUser && ((currentUser.id || currentUser.uid) === id)) {
      setCurrentUser(prev => prev ? ({ ...prev, status: newStatus }) : null);
    }
    showToast(`User status updated to ${newStatus}`);
  };

  const handleUpdateUserPassword = (id: string, newPass: string) => {
    setUsers(prev =>
      prev.map(u => ((u.id === id || u.uid === id) ? { ...u, password: newPass } : u))
    );
    showToast(`Password successfully updated!`);
  };

  const handleCreateUser = (newUser: AppUser) => {
    setUsers(prev => [newUser, ...prev]);
    showToast(`Created user ${newUser.email} with admin-assigned options!`);
  };

  const handleSwitchUser = (user: AppUser) => {
    setCurrentUser(user);
    showToast(`Switched active session to: ${user.displayName || user.name} (${user.role})`);
  };

  // ================= AUTH MODAL HANDLERS =================
  const handleAuthLogin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) return false;
    if (found.password && found.password !== cleanPass) return false;
    if (found.status !== 'APPROVED') return false;

    setCurrentUser(found);
    showToast(`Welcome back, ${found.displayName || found.name}! Signed in as ${found.role.replace('_', ' ')}.`);
    return true;
  };

  const handleAuthRegister = (name: string, email: string, role: UserRole) => {
    const newId = `user-${Date.now()}`;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const newUser: AppUser = {
      id: newId,
      uid: newId,
      name: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      role: role,
      status: 'PENDING',
      permissions: { ...ROLE_DEFAULT_PERMISSIONS[role] },
      password: 'Staff123Password!',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    showToast(`Registration request for ${cleanEmail} submitted. Status: PENDING.`);
  };

  const handleAuthLogout = () => {
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    showToast('Signed out of warehouse session.');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Warehouse className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    LogiFlow WMS
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    Order Management
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Preset: 50 Copies
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Cambridge & Oxford Inventory · Admin-Determined User Options · Dual Ingestion Engine
                </p>
              </div>
            </div>

            {/* Right: Direct 2 Upload Icons & User Profile Indicator */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* ICON 1: Stock Balance Upload */}
              <button
                onClick={() => handleOpenUploadWithPermission('stock_balance')}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  currentPermissions.canUploadStockBalance
                    ? 'bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 opacity-60'
                }`}
                title={
                  currentPermissions.canUploadStockBalance
                    ? 'Icon 1: Upload Stock Balance CSV (isbn, stock_balance)'
                    : 'Option restricted by Administrator'
                }
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  currentPermissions.canUploadStockBalance ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  <Package className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold px-1 rounded bg-cyan-500/30 text-cyan-200">
                      Icon 1
                    </span>
                    <span className="text-xs font-semibold text-cyan-100">
                      Upload Stock Balance
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 block leading-tight font-mono">
                    {currentPermissions.canUploadStockBalance ? 'isbn, stock_balance' : 'Restricted by Admin'}
                  </span>
                </div>
              </button>

              {/* ICON 2: Extra PO Stock Upload */}
              <button
                onClick={() => handleOpenUploadWithPermission('extra_po')}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  currentPermissions.canUploadExtraPo
                    ? 'bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950/50'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 opacity-60'
                }`}
                title={
                  currentPermissions.canUploadExtraPo
                    ? 'Icon 2: Upload Extra PO Stock CSV (isbn, extra_po_stock)'
                    : 'Option restricted by Administrator'
                }
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  currentPermissions.canUploadExtraPo ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  <Truck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase font-bold px-1 rounded bg-purple-500/30 text-purple-200">
                      Icon 2
                    </span>
                    <span className="text-xs font-semibold text-purple-100">
                      Upload Extra PO Stock
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 block leading-tight font-mono">
                    {currentPermissions.canUploadExtraPo ? 'isbn, extra_po_stock' : 'Restricted by Admin'}
                  </span>
                </div>
              </button>

              {/* USER PROFILE & PERMISSIONS POPUP */}
              {currentUser ? (
                <div className="relative">
                  <div
                    onClick={() => setShowPermissionsTooltip(!showPermissionsTooltip)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs cursor-pointer transition-colors shadow-sm"
                    title="Click to view your admin-determined options"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
                      {(currentUser.displayName || currentUser.name || 'User').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white leading-tight">
                        {(currentUser.displayName || currentUser.name || 'User').split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                        <span>{currentUser.role.replace('_', ' ')}</span>
                        <Shield className="h-2.5 w-2.5 inline" />
                      </div>
                    </div>
                  </div>

                  {/* Permissions Breakdown Popover */}
                  {showPermissionsTooltip && (
                    <div className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-xs text-slate-700 dark:text-slate-300 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-indigo-500" />
                          <span>Admin-Determined Options</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-mono">
                          {currentUser.role}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span>📦 Upload Stock Balance (Icon 1)</span>
                          <span className={currentPermissions.canUploadStockBalance ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canUploadStockBalance ? 'Allowed' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>🚚 Upload Extra PO (Icon 2)</span>
                          <span className={currentPermissions.canUploadExtraPo ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canUploadExtraPo ? 'Allowed' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>🛡️ Edit Preset 50 Safety Stock</span>
                          <span className={currentPermissions.canEditPresetMinStock ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canEditPresetMinStock ? 'Allowed' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>🛒 Dispatch Supplier Orders</span>
                          <span className={currentPermissions.canCreatePo ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canCreatePo ? 'Allowed' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>📥 Export CSV Data</span>
                          <span className={currentPermissions.canExportData ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canExportData ? 'Allowed' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>👥 Manage User Options (Admin)</span>
                          <span className={currentPermissions.canManageUsers ? 'text-indigo-500 font-bold' : 'text-slate-400'}>
                            {currentPermissions.canManageUsers ? 'Granted' : 'Restricted'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setShowPermissionsTooltip(false);
                            setIsLoginModalOpen(true);
                          }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <LogIn className="h-3 w-3" /> Account & Security
                        </button>

                        <button
                          onClick={() => setShowPermissionsTooltip(false)}
                          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Login / Access Modal Button */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="LogiFlow Access Control (Sign in, Register, Switch User)"
              >
                <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 text-xs">
            <div className="flex items-center gap-6 shrink-0">
              {/* Deficit Alert */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-400">Qty Not Sufficient:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {stats.deficitCount} Titles ({stats.totalDeficitUnits} units to order)
                </span>
              </div>

              {/* Sufficient */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Sufficient:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {stats.sufficientCount} Titles
                </span>
              </div>

              {/* Physical Balance */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <Package className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-400">Physical Stock:</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {stats.totalStockOnHand.toLocaleString()}
                </span>
              </div>

              {/* Inbound PO */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <Truck className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-slate-400">Extra PO Stock:</span>
                <span className="font-mono font-semibold text-purple-300">
                  {stats.totalExtraPo.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                Formula: 50 Min − Balance − PO = Shortage
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* INTERACTIVE FORMULA CALCULATION BANNER */}
        <FormulaBanner selectedItem={selectedItem} />

        {/* TABS NAVIGATION */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            {/* Tab 1 */}
            <button
              onClick={() => setActiveTab('requisition')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'requisition'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Order Requisition Engine</span>
              {stats.deficitCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {stats.deficitCount}
                </span>
              )}
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'preset'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Preset Minimum Stock Setup</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-mono">
                50 Copies
              </span>
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => setActiveTab('upload_center')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upload_center'
                  ? 'border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Dual Upload & Update Center</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-mono">
                Icon 1 & 2
              </span>
            </button>

            {/* Tab 4 */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pos'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Publisher Requisitions Log</span>
              {poRecords.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {poRecords.length}
                </span>
              )}
            </button>

            {/* Tab 5: Admin User Options (Visible to users with canManageUsers permission) */}
            {currentPermissions.canManageUsers && (
              <button
                onClick={() => setActiveTab('admin_users')}
                className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'admin_users'
                    ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Users className="h-4 w-4 text-rose-500" />
                <span>Admin User Options & Roles</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold font-mono">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* ACTIVE TAB CONTENT */}
        {activeTab === 'requisition' && (
          <OrderRequisitionTab
            items={items}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            onOpenUpload={handleOpenUploadWithPermission}
            onOrderSingleItem={handleOrderSingleItem}
            onOrderAllDeficits={handleOrderAllDeficits}
            onEditItem={item => {
              if (!currentPermissions.canEditPresetMinStock) {
                showToast('Option restricted: Administrator has disabled editing presets for your account.');
                return;
              }
              setItemToEdit(item);
              setIsAddEditOpen(true);
            }}
            permissions={currentPermissions}
          />
        )}

        {activeTab === 'preset' && (
          <PresetStockSetupTab
            items={items}
            onUpdateMinStock={handleUpdateMinStock}
            onBatchAdjustMinStock={handleBatchAdjustMinStock}
            onSetAllMinStock={handleSetAllMinStock}
            onOpenAddSku={() => {
              if (!currentPermissions.canEditPresetMinStock) {
                showToast('Option restricted: Registering new titles is restricted by Administrator.');
                return;
              }
              setItemToEdit(null);
              setIsAddEditOpen(true);
            }}
            onOpenEditSku={item => {
              if (!currentPermissions.canEditPresetMinStock) {
                showToast('Option restricted: Editing title details is restricted by Administrator.');
                return;
              }
              setItemToEdit(item);
              setIsAddEditOpen(true);
            }}
            onResetDefaults={handleResetDefaults}
            permissions={currentPermissions}
          />
        )}

        {activeTab === 'upload_center' && (
          <DualUploadCenterTab
            items={items}
            onOpenUploadModal={handleOpenUploadWithPermission}
            onQuickUpdateItem={handleQuickUpdateItem}
            recentUploads={recentUploads}
            permissions={currentPermissions}
          />
        )}

        {activeTab === 'pos' && (
          <PoHistoryTab
            poRecords={poRecords}
            onOpenNewPo={() => {
              if (!currentPermissions.canCreatePo) {
                showToast('Option restricted: Creating new supplier requisitions is restricted by Administrator.');
                return;
              }
              const deficits = items.filter(i => calculateShortage(i).isDeficit);
              setItemsForPo(deficits.length > 0 ? deficits : items.slice(0, 3));
              setIsPoModalOpen(true);
            }}
            onUpdatePoStatus={(id, status) => {
              setPoRecords(prev =>
                prev.map(p => (p.id === id ? { ...p, status } : p))
              );
            }}
          />
        )}

        {activeTab === 'admin_users' && currentPermissions.canManageUsers && (
          <AdminUserManagementTab
            currentUser={currentUser || INITIAL_USERS[0]}
            users={users}
            onUpdateUserPermissions={handleUpdateUserPermissions}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateUserStatus={handleUpdateUserStatus}
            onUpdateUserPassword={handleUpdateUserPassword}
            onCreateUser={handleCreateUser}
            onSwitchUser={handleSwitchUser}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">LogiFlow WMS</span>
            <span>· Order Management with Admin-Determined User Roles & Options</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Account: <strong className="text-slate-700 dark:text-slate-200">{currentUser ? (currentUser.name || currentUser.displayName) : 'Signed Out'}</strong> ({currentUser ? currentUser.role : 'Guest'})</span>
            <span>· Formula: <code>50 Min − Balance − PO = Shortage</code></span>
            {currentPermissions.canResetDefaults && (
              <button
                onClick={handleResetDefaults}
                className="hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Reset Demo
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ACCESS & AUTH MODAL */}
      <AuthModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        pendingUsers={users.filter(u => u.status === 'PENDING')}
        onLogin={handleAuthLogin}
        onRegister={handleAuthRegister}
        onLogout={handleAuthLogout}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenUserManagement={() => {
          setActiveTab('admin_users');
          setIsLoginModalOpen(false);
        }}
      />

      {/* CSV UPLOAD MODAL */}
      {uploadModalType && (
        <UploadModal
          isOpen={true}
          type={uploadModalType}
          items={items}
          onClose={() => setUploadModalType(null)}
          onApplyUpload={handleApplyUpload}
        />
      )}

      {/* SUPPLIER REQUISITION MODAL */}
      {isPoModalOpen && (
        <SupplierPoModal
          isOpen={true}
          itemsToOrder={itemsForPo}
          onClose={() => setIsPoModalOpen(false)}
          onConfirmPo={handleConfirmPo}
        />
      )}

      {/* ADD / EDIT SKU MODAL */}
      {isAddEditOpen && (
        <AddEditSkuModal
          isOpen={true}
          itemToEdit={itemToEdit}
          onClose={() => {
            setIsAddEditOpen(false);
            setItemToEdit(null);
          }}
          onSave={handleSaveSku}
        />
      )}
    </div>
  );
}
