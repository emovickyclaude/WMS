# LogiFlow WMS — Phase 1: Order Management & Inventory Control

Welcome to **Phase 1** of the LogiFlow Warehouse Management System (WMS). This phase focuses on core **Order Management**, safety stock monitoring, automated deficit calculations, and supplier requisition workflows.

---

## 1. Core Logic & Calculation Engine

The foundation of WMS Phase 1 is a real-time shortage calculation engine designed to prevent stockouts while factoring in active purchase orders.

$$\text{Shortage Qty} = \text{Minimum Required Stock} - \text{Stock Balance} - \text{Extra PO Stock}$$

*   **Minimum Required Stock:** The preset safety threshold established for each SKU in the system.
*   **Stock Balance:** The current physical quantity of items available in the warehouse.
*   **Extra PO Stock:** Outstanding purchase orders placed with suppliers that are expected to arrive.
*   **Result Rule:** If the calculated shortage quantity is greater than $0$, the system flags the SKU as **"Qty Not Sufficient"** and generates the exact unit requirement to order from the supplier. If the result is $\le 0$, the stock is marked as **"Sufficient"**.

---

## 2. Key Features & Interface Modules

### A. Order Requisition Engine Tab
*   **Live Table View:** Displays SKU codes, item names, categories, preset minimum stock, current stock balance, extra PO stock, and calculated shortage quantities.
*   **Dynamic Status Badges:** Instantly highlights items needing immediate reordering with intuitive warning badges.
*   **Search & Filter:** Quickly filter items by "All", "Deficit (Qty Not Sufficient)", or "Sufficient Stock".
*   **CSV Export:** Export filtered supplier requisition lists directly to CSV for procurement action.

### B. Preset Minimum Stock Setup Tab
*   Allows warehouse managers to configure and adjust safety thresholds for individual SKUs directly inline or via modal forms. Changes instantly update the calculation engine.

### C. Dual Upload & Update Center Tab
Designed with dedicated control cards for fast data ingestion:
1.  **Stock Balance Update (Icon 1):**
    *   Upload CSV files in the format `sku, stock_balance`.
    *   Manual quick-adjust dropdown to update on-hand physical inventory per SKU instantly.
2.  **Extra PO Stock Update (Icon 2):**
    *   Upload CSV files in the format `sku, extra_po_stock`.
    *   Manual quick-adjust dropdown to update incoming purchase order quantities instantly.

---

## 3. Sample CSV Data Formats

### Stock Balance CSV Format (`stock_balance.csv`)
```csv
SKU-1001, 15
SKU-1002, 50
SKU-1003, 30
```

### Extra PO Stock CSV Format (`extra_po.csv`)
```csv
SKU-1001, 10
SKU-1004, 25
```

---

## 4. Technical Stack & Deployment
*   **Frontend Framework:** Tailwind CSS for modern responsive styling, Alpine.js for lightweight reactivity.
*   **Icons:** FontAwesome 6.4.0.
*   **Persistence:** HTML5 LocalStorage ensures that all added SKUs, adjusted minimum stock levels, and balance updates persist across browser sessions.