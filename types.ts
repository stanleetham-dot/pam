
export type Theme = 'light' | 'dark';
export type Language = 'EN' | 'ZH';

export type UserRole = 'ADMIN' | 'MANAGER' | 'INSPECTOR' | 'TRADER' | 'USER' | 'DRIVER' | 'BRANCH';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  AI_ASSISTANT = 'AI_ASSISTANT',
  TASK_MANAGER = 'TASK_MANAGER',
  // Order Management
  OM_TASK_MANAGEMENT = 'OM_TASK_MANAGEMENT',
  OM_DISTRIBUTION_ORDER = 'OM_DISTRIBUTION_ORDER',
  OM_ARRIVAL_MANAGEMENT = 'OM_ARRIVAL_MANAGEMENT',
  PARCEL_MANAGEMENT = 'PARCEL_MANAGEMENT',
  PARCEL_HISTORY = 'PARCEL_HISTORY',
  PICKING_PLAN = 'PICKING_PLAN',
  PTL_USE = 'PTL_USE',
  DISTRIBUTION_METHOD = 'DISTRIBUTION_METHOD',
  // Warehouse Management
  WAREHOUSE_CONFIG = 'WAREHOUSE_CONFIG',
  SHELF_ARRANGEMENT = 'SHELF_ARRANGEMENT',
  // Delivery Management
  DM_DISTRIBUTION_CENTER = 'DM_DISTRIBUTION_CENTER',
  DM_BRANCH_REPLENISHMENT = 'DM_BRANCH_REPLENISHMENT',
  DM_TRANSFER_OUT_ORDER = 'DM_TRANSFER_OUT_ORDER',
  DM_DELIVERY_TRACKING = 'DM_DELIVERY_TRACKING',
  DM_PRODUCTS_IN_TRANSIT = 'DM_PRODUCTS_IN_TRANSIT',
  // Mobile Apps
  MOBILE_DRIVER = 'MOBILE_DRIVER',
  MOBILE_BRANCH = 'MOBILE_BRANCH',
  MOBILE_USER = 'MOBILE_USER',
  // Purchasing
  PURCHASING = 'PURCHASING',
  RECEIVING_ORDERS = 'RECEIVING_ORDERS',
  INBOUND = 'INBOUND',
  // Product Management
  INVENTORY_PRODUCT = 'INVENTORY_PRODUCT',
  INVENTORY_EXPIRE = 'INVENTORY_EXPIRE',
  // Inventory
  INVENTORY_QUERY = 'INVENTORY_QUERY',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  INVENTORY_TRANSFER = 'INVENTORY_TRANSFER',
  INVENTORY_DISCREPANCY = 'INVENTORY_DISCREPANCY',
  // Scan Ops
  SCAN_TO_SHELF = 'SCAN_TO_SHELF',
  SKU_LOOKUP = 'SKU_LOOKUP',
  SHELF_LOGS = 'SHELF_LOGS',
  // Admin
  ACCOUNT_MANAGEMENT = 'ACCOUNT_MANAGEMENT',
  SETTINGS = 'SETTINGS',
  DELIVERY = 'DELIVERY',
}

export interface InventoryItem {
  id: string;
  productId: string;
  productCode: string; // SKU or Barcode snapshot
  productName: string; // Name snapshot
  location: string;
  quantity: number;
  warehouse: string;
  category: string;
  updatedAt: string;
  expiryDate?: string;
  batchNumber?: string;
}

export interface ExpiryLog {
  id: string;
  expiryDate: string;
  createdAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'REMOVED';
  batchNumber?: string;
  quantity?: number;
  mfgDate?: string;
  shelfLife?: number;
  type?: 'EXP' | 'MFG';
  note?: string;
  updatedAt?: string;
  removedQuantity?: number;
  removedAt?: string;
  removedBy?: string;
}

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  location: string; // Default/Preferred Location
  specification: string;
  unit: string;
  stock: number; // This will now serve as a cache or initial value
  expiryDate: string;
  mfgDate?: string;
  shelfLife?: number;
  status: string;
  imageUrl?: string;
  standardPrice: number;
  wholesalePrice: number;
  wholesalePrice2: number;
  purchasePrice: number;
  origin: string;
  brand: string;
  warehouse?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  expiryLogs?: ExpiryLog[];
  daysRemaining?: number | null;
  description?: string;
  relevantBatch?: string;
  relevantQty?: number;
}

export interface Transaction {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  productId: string;
  productName: string;
  fromLocation?: string;
  toLocation?: string;
  quantity: number;
  timestamp: string;
  user: string;
  referenceId?: string;
}

export interface ShelfLog {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  sku: string;
  oldLocation: string;
  newLocation: string;
  timestamp: string;
  operator: string;
  method: 'SCAN' | 'IMPORT' | 'MANUAL';
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalInboundToday: number;
  totalOutboundToday: number;
  warehouseCapacity: number;
}

export interface NotificationSettings {
  alertTiming: number;
  enableSound: boolean;
  soundType: 'default' | 'chime' | 'pulse';
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  plateNumber?: string;
  employmentType?: 'Fulltime' | 'Part-time' | 'Contract'; // Added field
  role: string;
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  permissions?: string[];
  landingPage?: string;
  country?: string;
  notificationSettings?: NotificationSettings;
  password?: string;
  customConfig?: RoleConfig; // User-specific permission overrides
}

export interface AdjustmentItem {
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  currentStock: number;
  actualStock: number;
  adjustmentQty: number;
  reason: string;
}

export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdjustmentBill {
  id: string;
  serialNumber: string;
  createdAt: string;
  createdBy: string;
  items: AdjustmentItem[];
  note?: string;
  status: AdjustmentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  relatedOrderId?: string; // Links task to a distribution order
}

export type WarehouseType = 'MAIN' | 'BRANCH' | 'TRANSFER';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type?: WarehouseType;
  isMain?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ShelfLane {
  id: string;
  laneCode: string;
  sortOrder: number;
  shelfCount: number; // Number of Bays
  shelfRows: number;  // Vertical Levels
  shelfCols: number;  // Horizontal Slots per Bay
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  areaName: string;
  areaCode: string;
  storageNum: number;
}

export interface PermissionObject {
  create: boolean;
  read: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  reject: boolean;
  undo: boolean;
  sharing: string;
}

export interface RoleConfig {
  objects: Record<string, PermissionObject>;
  actions: Record<string, boolean>;
  metadata?: {
    description?: string;
    isCustom?: boolean;
    color?: string;
  };
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  items: any[];
  createdBy?: string;
}

export interface ReceivingOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  purchaseUnit?: string; // Added field
  orderQty: number;
  receivedQty: number;
  storageLocation: string;
  category: string;
  inventoryQty: number;
  remarks?: string;
}

export interface ReceivingOrder {
  id: string;
  receivingSerial: string;
  purchaseSerial: string;
  supplierName: string;
  receivingBranch: string;
  receiptDate: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  creator: string;
  createTime: string;
  modificationTime: string;
  reviewer?: string;
  reviewTime?: string;
  numberOfPieces: number;
  orderStatus: string;
  remarks?: string;
  items?: ReceivingOrderItem[];
  receivingWarehouse?: string;
  department?: string;
}

export interface DistributionOrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  storageLocation: string;
  orderedQty: number; // Requested
  pickedQty: number; // Actual Scanned
  specification: string;
  distributionUnit: string;
  inventoryQty: number;
  pickedBy?: string;
  pickedAt?: string;
  status: 'PENDING' | 'PICKED' | 'PARTIAL' | 'OVER';
  // Discrepancy Check Fields
  receivedQty?: number;
  variance?: number;
  recipientRemark?: string;
  recipientPhoto?: string; // Base64
}

export interface DistributionOutlet {
  id: string;
  recipient: string;
  phone: string;
  deliveryMethod: string;
  postCode: string;
  address: string;
  unit: string;
  deliveryTime?: string;
  sendPeriod?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number; // In meters
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  plateNumber?: string; // Added field
  type: 'Fulltime' | 'Contract' | 'Part-time';
  vehicleType: 'Van' | 'Lorry' | 'Bike' | 'Car';
  deliveryMethods: string[]; // e.g. "Home Delivery", "Express"
  maxPacks?: number;
  currentPacks?: number;
  avatar?: string;
}

export interface DistributionOrder {
  id: string;
  orderNumber: string;
  receivingBranch: string;
  receivingBranchCode?: string;
  status: 'Created' | 'Pending' | 'Picking' | 'Pick Complete' | 'Discrepancy' | 'Approved' | 'Ready to Ship' | 'Shipped' | 'In Transit' | 'Delivered' | 'Delivery Failed' | 'Rejected' | 'Received' | 'Dispute';
  salesman: string;
  department: string;
  shippingWarehouse: string;
  remarks?: string;
  dispatchDate: string;
  paymentDate: string;
  items: DistributionOrderItem[];
  createTime: string;
  creator: string;
  branchBalance?: number;
  creditLimit?: number;
  currentCreditBalance?: number;
  deliveryDetails?: DistributionOutlet;
  assignedDriverId?: string;
  driverNote?: string;
  assignedAt?: string;
  geoVerified?: boolean;
  geofenceVerified?: boolean;
  distanceToOutlet?: number; // In meters
  proofOfDelivery?: string; // Image URL
  signature?: string; // Base64 signature
  deliveryTimestamp?: string;
  // New tracking fields
  scheduledBy?: string;
  scheduledAt?: string;
  pickedCompletedBy?: string | null;
  // Picking Lock Fields
  pickedByUserId?: string | null;
  pickedByName?: string | null;
}

export interface DiscrepancyItem {
    productId: string;
    productCode: string;
    productName: string;
    receivedQty: number;
    variance: number;
    remark?: string;
    photo?: string;
}

export interface DiscrepancyReport {
    id: string;
    packageNo: string;
    orderNumber?: string;
    branchName: string;
    receivedPerson: string;
    reportDate: string;
    status: string;
    items: DiscrepancyItem[];
    createdAt: string;
    approvalRemark?: string;
    approvedBy?: string;
    approvedAt?: string;
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  weight: number;
  dimensions: string;
  receivedAt: string;
}

export interface PickingItem {
    productId: string;
    name: string;
    location: string;
    qty: number;
    picked: boolean;
}

export interface PickingPlan {
    id: string;
    orderId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'NORMAL' | 'HIGH';
    items: PickingItem[];
}
