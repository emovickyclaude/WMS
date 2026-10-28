import type { User, UserRole, UserStatus } from './inventory';

export type { User, UserRole, UserStatus };

export interface UserPermissions {
  canUploadStockBalance: boolean; // Option 1: Can use Icon 1 to update physical stock balance
  canUploadExtraPo: boolean;      // Option 2: Can use Icon 2 to update inbound extra PO stock
  canEditPresetMinStock: boolean; // Option 3: Can edit preset minimum required stock (10)
  canCreatePo: boolean;           // Option 4: Can create and dispatch purchase requisitions to publishers
  canManageUsers: boolean;        // Option 5: Can manage users and determine user options (Master Admin & Admin)
  canExportData: boolean;         // Option 6: Can export inventory and shortage lists to CSV
  canResetDefaults: boolean;      // Option 7: Can reset catalogue to default 10 copies
}

export interface AppUser extends User {
  displayName?: string; // alias for name
  uid?: string;         // alias for id
  password?: string;
  permissions: UserPermissions;
  lastLogin?: string;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  MASTER_ADMIN: {
    canUploadStockBalance: true,
    canUploadExtraPo: true,
    canEditPresetMinStock: true,
    canCreatePo: true,
    canManageUsers: true,
    canExportData: true,
    canResetDefaults: true,
  },
  ADMIN: {
    canUploadStockBalance: true,
    canUploadExtraPo: true,
    canEditPresetMinStock: true,
    canCreatePo: true,
    canManageUsers: true,
    canExportData: true,
    canResetDefaults: false,
  },
  CUSTOMER_SERVICE: {
    canUploadStockBalance: false, // Strict View-Only Access
    canUploadExtraPo: false,      // Strict View-Only Access
    canEditPresetMinStock: false, // Strict View-Only Access
    canCreatePo: false,           // Strict View-Only Access
    canManageUsers: false,        // Strict View-Only Access
    canExportData: true,          // View-only report inspection & export
    canResetDefaults: false,
  },
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-master-01',
    uid: 'user-master-01',
    name: 'Vignesh (Master Admin)',
    displayName: 'Vignesh',
    email: 'vignesh@emobooks.com',
    role: 'MASTER_ADMIN',
    status: 'APPROVED',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.MASTER_ADMIN },
    password: 'Loga@2012',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-02',
    uid: 'user-admin-02',
    name: 'Warehouse Operations Admin',
    displayName: 'Operations Admin',
    email: 'admin@logiflow.io',
    role: 'ADMIN',
    status: 'APPROVED',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.ADMIN },
    password: 'Admin123Password!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-cs-03',
    uid: 'user-cs-03',
    name: 'Customer Support Representative',
    displayName: 'Support Staff',
    email: 'cs@logiflow.io',
    role: 'CUSTOMER_SERVICE',
    status: 'APPROVED',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.CUSTOMER_SERVICE },
    password: 'CS123Password!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-pending-04',
    uid: 'user-pending-04',
    name: 'Sarah Jenkins (New Applicant)',
    displayName: 'Sarah Jenkins',
    email: 'newstaff@logiflow.io',
    role: 'CUSTOMER_SERVICE',
    status: 'PENDING',
    permissions: { ...ROLE_DEFAULT_PERMISSIONS.CUSTOMER_SERVICE },
    password: 'Staff123Password!',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];
