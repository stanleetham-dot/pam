
import React, { useState, useEffect, useRef } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import InventoryQuery from './components/InventoryQuery';
import ScanToShelf from './components/ScanToShelf';
import SkuLookup from './components/SkuLookup';
import InventoryAdjustment from './components/InventoryAdjustment';
import InventoryTransfer from './components/InventoryTransfer';
import ProductExpireLogs from './components/ProductExpireLogs';
import ShelfLogs from './components/ShelfLogs';
import WarehouseConfig from './components/WarehouseConfig';
import ShelfArrangement from './components/ShelfArrangement';
import TaskManager from './components/TaskManager';
import Login from './components/Login';
import AiAssistant from './components/AiAssistant';
import Settings from './components/Settings';
import AccountManagement from './components/AccountManagement';
import ParcelManagement from './components/ParcelManagement';
import PickingPlanView from './components/PickingPlan';
import PTLUse from './components/PTLUse';
import PurchasingManager from './components/PurchasingManager';
import Purchasing from './components/Purchasing';
import DistributionOrderManager from './components/DistributionOrderManager';
import DistributionMethodManager from './components/DistributionMethodManager';
import OrderTaskManagement from './components/OrderTaskManagement'; 
import DistributionCenter from './components/DistributionCenter'; 
import MobileDriverApp from './components/MobileDriverApp';
import MobileBranchApp from './components/MobileBranchApp';
import MobileUserApp from './components/MobileUserApp';
import DeliveryTracking from './components/DeliveryTracking';
import TransferOutOrder from './components/TransferOutOrder';
import DiscrepancyCheck from './components/DiscrepancyCheck';
import ToastContainer from './components/ToastContainer';
import { ViewState } from './types';
import { Construction, ShieldAlert, Boxes, ArrowDownToLine, History, RotateCcw } from 'lucide-react';

const PlaceholderView: React.FC<{ title: string; icon?: React.ElementType; description?: string }> = ({ title, icon: Icon = Construction, description }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[80vh] bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-500 p-8 transition-colors">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-full shadow-sm mb-6 border border-transparent dark:border-slate-800">
      <Icon size={48} className="text-blue-200 dark:text-blue-900" />
    </div>
    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
    <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">{description || "This module is currently under development. Please check back later."}</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; viewId: string }> = ({ children, viewId }) => {
  const { checkPermission } = useInventory();
  if (checkPermission(viewId, 'read')) return <>{children}</>;
  return <PlaceholderView title="Access Denied" icon={ShieldAlert} description="You do not have permission to view this module." />;
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const { currentUser, checkPermission } = useInventory();
  const prevUserRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // 1. Handle Logout or User Switch
    if (currentUser?.id !== prevUserRef.current) {
        if (currentUser) {
            // User Logged In
            if (currentUser.landingPage && Object.values(ViewState).includes(currentUser.landingPage as ViewState)) {
                setCurrentView(currentUser.landingPage as ViewState);
            } else if (currentUser.role === 'DRIVER') {
                setCurrentView(ViewState.MOBILE_DRIVER);
            } else if (currentUser.role === 'BRANCH') {
                setCurrentView(ViewState.MOBILE_BRANCH);
            } else if (currentUser.role === 'USER') {
                setCurrentView(ViewState.MOBILE_USER);
            } else {
                setCurrentView(ViewState.DASHBOARD);
            }
        } else {
            // User Logged Out - Reset to Dashboard default
            setCurrentView(ViewState.DASHBOARD);
        }
        prevUserRef.current = currentUser?.id;
        return;
    }

    // 2. Handle Permissions Change on Current View
    if (currentUser && !checkPermission(currentView, 'read')) {
        if (currentUser.role === 'DRIVER' && checkPermission('MOBILE_DRIVER', 'read')) {
            setCurrentView(ViewState.MOBILE_DRIVER);
        } else if (currentUser.role === 'BRANCH' && checkPermission('MOBILE_BRANCH', 'read')) {
            setCurrentView(ViewState.MOBILE_BRANCH);
        } else if (currentUser.role === 'USER' && checkPermission('MOBILE_USER', 'read')) {
            setCurrentView(ViewState.MOBILE_USER);
        } else {
            setCurrentView(ViewState.DASHBOARD);
        }
    }
  }, [currentUser, currentView, checkPermission]);

  if (!currentUser) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  // If Mobile Driver View is active, render full screen without sidebar
  if (currentView === ViewState.MOBILE_DRIVER) {
      return (
          <>
            <MobileDriverApp />
            <ToastContainer />
          </>
      );
  }

  // If Mobile Branch View is active, render full screen without sidebar
  if (currentView === ViewState.MOBILE_BRANCH) {
      return (
          <>
            <MobileBranchApp />
            <ToastContainer />
          </>
      );
  }

  // If Mobile User View is active, render full screen without sidebar
  if (currentView === ViewState.MOBILE_USER) {
      return (
          <>
            <MobileUserApp />
            <ToastContainer />
          </>
      );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onNavigate={setCurrentView} />;
      case ViewState.AI_ASSISTANT: return <AiAssistant />;
      case ViewState.TASK_MANAGER: return <ProtectedRoute viewId={ViewState.TASK_MANAGER}><TaskManager /></ProtectedRoute>;
      
      // Order Management Routes
      case ViewState.OM_TASK_MANAGEMENT: return <ProtectedRoute viewId={ViewState.OM_TASK_MANAGEMENT}><OrderTaskManagement /></ProtectedRoute>;
      case ViewState.OM_DISTRIBUTION_ORDER: return <ProtectedRoute viewId={ViewState.OM_DISTRIBUTION_ORDER}><DistributionOrderManager /></ProtectedRoute>;
      case ViewState.OM_ARRIVAL_MANAGEMENT: return <PlaceholderView title="Arrival Management" icon={ArrowDownToLine} description="Manage incoming shipment arrivals and dock scheduling." />;
      case ViewState.PARCEL_MANAGEMENT: return <ProtectedRoute viewId={ViewState.PARCEL_MANAGEMENT}><ParcelManagement /></ProtectedRoute>;
      case ViewState.PARCEL_HISTORY: return <ProtectedRoute viewId={ViewState.PARCEL_HISTORY}><PlaceholderView title="Parcel History" icon={History} /></ProtectedRoute>;
      case ViewState.PICKING_PLAN: return <ProtectedRoute viewId={ViewState.PICKING_PLAN}><PickingPlanView /></ProtectedRoute>;
      case ViewState.PTL_USE: return <ProtectedRoute viewId={ViewState.PTL_USE}><PTLUse /></ProtectedRoute>;
      case ViewState.DISTRIBUTION_METHOD: return <ProtectedRoute viewId={ViewState.DISTRIBUTION_METHOD}><DistributionMethodManager /></ProtectedRoute>;
      
      // Warehouse Management
      case ViewState.WAREHOUSE_CONFIG: return <ProtectedRoute viewId={ViewState.WAREHOUSE_CONFIG}><WarehouseConfig /></ProtectedRoute>;
      case ViewState.SHELF_ARRANGEMENT: return <ProtectedRoute viewId={ViewState.SHELF_ARRANGEMENT}><ShelfArrangement /></ProtectedRoute>;
      
      // Delivery Management
      case ViewState.DM_DISTRIBUTION_CENTER: return <ProtectedRoute viewId={ViewState.DM_DISTRIBUTION_CENTER}><DistributionCenter /></ProtectedRoute>;
      case ViewState.DM_BRANCH_REPLENISHMENT: return <PlaceholderView title="Branch Replenishment" icon={RotateCcw} description="Monitor and execute branch stock replenishment." />;
      case ViewState.DM_TRANSFER_OUT_ORDER: return <ProtectedRoute viewId={ViewState.DM_TRANSFER_OUT_ORDER}><TransferOutOrder /></ProtectedRoute>;
      case ViewState.DM_DELIVERY_TRACKING: return <ProtectedRoute viewId={ViewState.DM_DELIVERY_TRACKING}><DeliveryTracking /></ProtectedRoute>;
      case ViewState.DM_PRODUCTS_IN_TRANSIT: return <PlaceholderView title="Products in Transit" icon={Boxes} description="View inventory currently in transit between locations." />;

      // Product & Inventory
      case ViewState.INVENTORY_PRODUCT: return <ProtectedRoute viewId={ViewState.INVENTORY_PRODUCT}><InventoryList /></ProtectedRoute>;
      case ViewState.SKU_LOOKUP: return <ProtectedRoute viewId={ViewState.SKU_LOOKUP}><SkuLookup onClose={() => setCurrentView(ViewState.DASHBOARD)} /></ProtectedRoute>;
      case ViewState.INVENTORY_QUERY: return <ProtectedRoute viewId={ViewState.INVENTORY_QUERY}><InventoryQuery /></ProtectedRoute>;
      case ViewState.INVENTORY_ADJUSTMENT: return <ProtectedRoute viewId={ViewState.INVENTORY_ADJUSTMENT}><InventoryAdjustment /></ProtectedRoute>;
      case ViewState.STOCK_ADJUSTMENT: return <ProtectedRoute viewId={ViewState.INVENTORY_ADJUSTMENT}><InventoryAdjustment initialView="QUICK" /></ProtectedRoute>;
      case ViewState.INVENTORY_TRANSFER: return <ProtectedRoute viewId={ViewState.INVENTORY_TRANSFER}><InventoryTransfer /></ProtectedRoute>;
      case ViewState.INVENTORY_DISCREPANCY: return <ProtectedRoute viewId={ViewState.INVENTORY_DISCREPANCY}><DiscrepancyCheck /></ProtectedRoute>;
      case ViewState.INVENTORY_EXPIRE: return <ProtectedRoute viewId={ViewState.INVENTORY_EXPIRE}><ProductExpireLogs /></ProtectedRoute>;
      
      // Scan Ops
      case ViewState.SCAN_TO_SHELF: return <ProtectedRoute viewId={ViewState.SCAN_TO_SHELF}><ScanToShelf onClose={() => setCurrentView(ViewState.DASHBOARD)} /></ProtectedRoute>;
      case ViewState.SHELF_LOGS: return <ProtectedRoute viewId={ViewState.SHELF_LOGS}><ShelfLogs /></ProtectedRoute>;
      
      // Purchasing
      case ViewState.PURCHASING: return <ProtectedRoute viewId={ViewState.PURCHASING}><Purchasing /></ProtectedRoute>;
      case ViewState.RECEIVING_ORDERS: return <ProtectedRoute viewId={ViewState.RECEIVING_ORDERS}><PurchasingManager /></ProtectedRoute>;
      case ViewState.INBOUND: return <ProtectedRoute viewId={ViewState.INBOUND}><PlaceholderView title="Inbound Operations" icon={ArrowDownToLine} description="Manage incoming shipments and receiving workflows." /></ProtectedRoute>;
      
      // Admin
      case ViewState.DELIVERY: return <Dashboard onNavigate={setCurrentView} />;
      case ViewState.ACCOUNT_MANAGEMENT: return <ProtectedRoute viewId={ViewState.ACCOUNT_MANAGEMENT}><AccountManagement /></ProtectedRoute>;
      case ViewState.SETTINGS: return <ProtectedRoute viewId={ViewState.SETTINGS}><Settings /></ProtectedRoute>;
      
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300 print:h-auto print:overflow-visible">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 overflow-y-auto print:w-full print:h-auto print:overflow-visible">
        {renderView()}
        <ToastContainer />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
};

export default App;
