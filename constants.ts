
import { Product, Transaction, UserRole } from './types';

export const ORIGIN_OPTIONS = [
  'CHINA',
  'JAPAN',
  'Thailand',
  'USA',
  'EU',
  'Korea',
  'Taiwan',
  'Malaysia',
  'India',
  'Germany',
  'Indonesia',
  'Singapore',
  'EUROPE',
  'AUSTRALIA',
  'Other'
];

export const USER_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'INSPECTOR', 'USER', 'TRADER', 'DRIVER', 'BRANCH'];

export const APP_MODULES = [
    { key: 'DASHBOARD', label: 'Dashboard' },
    { key: 'AI_ASSISTANT', label: 'AI Assistant' },
    { key: 'TASK_MANAGER', label: 'My Tasks' },
    {
        key: 'ORDER_MGMT_GROUP', label: 'Order Management',
        children: [
            { key: 'OM_TASK_MANAGEMENT', label: 'Task Management' },
            { key: 'OM_DISTRIBUTION_ORDER', label: 'Distribution Order' },
            { key: 'INVENTORY_DISCREPANCY', label: 'Discrepancy Check' },
            { key: 'DISTRIBUTION_METHOD', label: 'Distribution Method' },
        ]
    },
    {
        key: 'WAREHOUSE_MGMT_GROUP', label: 'Warehouse Management',
        children: [
            { key: 'WAREHOUSE_CONFIG', label: 'Warehouse Configuration' },
            { key: 'SHELF_ARRANGEMENT', label: 'Shelf Arrangement' },
        ]
    },
    {
        key: 'DELIVERY_MGMT_GROUP', label: 'Delivery Management',
        children: [
            { key: 'DM_DISTRIBUTION_CENTER', label: 'Distribution Center' },
            { key: 'DM_TRANSFER_OUT_ORDER', label: 'Transfer Out Order' },
            { key: 'DM_DELIVERY_TRACKING', label: 'Delivery Tracking' },
            { key: 'MOBILE_DRIVER', label: 'Driver Mobile App' },
        ]
    },
    {
        key: 'PURCHASING_GROUP', label: 'Purchasing',
        children: [
            { key: 'PURCHASING', label: 'Purchase Orders' },
            { key: 'RECEIVING_ORDERS', label: 'Receiving Orders' },
            { key: 'INBOUND', label: 'Inbound Operations' },
        ]
    },
    {
        key: 'PRODUCT_MGMT_GROUP', label: 'Product Management',
        children: [
            { key: 'INVENTORY_PRODUCT', label: 'Product File' },
            { key: 'INVENTORY_EXPIRE', label: 'Product Expire Logs' },
        ]
    },
    {
        key: 'INVENTORY_GROUP', label: 'Inventory Operations',
        children: [
            { key: 'INVENTORY_QUERY', label: 'Inventory Query' },
            { key: 'INVENTORY_ADJUSTMENT', label: 'Inventory Adjustment' },
            { key: 'INVENTORY_TRANSFER', label: 'Stock Transfer' },
        ]
    },
    {
        key: 'SCAN_OPS_GROUP', label: 'Scan Operations',
        children: [
            { key: 'SCAN_TO_SHELF', label: 'Scan to Shelf' },
            { key: 'SKU_LOOKUP', label: 'SKU Lookup' },
            { key: 'SHELF_LOGS', label: 'Shelf Logs' },
        ]
    },
    { key: 'ACCOUNT_MANAGEMENT', label: 'Account Management' },
    { key: 'SETTINGS', label: 'Settings' },
    { key: 'MOBILE_BRANCH', label: 'Branch Mobile App' },
    { key: 'MOBILE_USER', label: 'General User Mobile App' },
];

// Flattened list for easy iteration in Context/Checks
export const PERMISSION_MODULES = APP_MODULES.reduce((acc: {key: string, label: string}[], curr) => {
    acc.push({ key: curr.key, label: curr.label });
    if (curr.children) {
        curr.children.forEach(child => acc.push({ key: child.key, label: child.label }));
    }
    return acc;
}, []);

export const INITIAL_PRODUCTS: Product[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];
