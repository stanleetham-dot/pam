
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Settings, 
  LogOut,
  Boxes,
  Menu,
  ChevronLeft,
  Users,
  ChevronDown,
  Tag,
  ShieldCheck,
  Search,
  User,
  ClipboardList,
  Scan,
  CheckSquare,
  Warehouse,
  BrainCircuit,
  Circle,
  Layers
} from 'lucide-react';
import { ViewState } from './types';
import { useInventory } from './context/InventoryContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  subItems?: { id: ViewState; label: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout, checkPermission, theme } = useInventory();
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_sidebar_expanded');
      return saved ? JSON.parse(saved) : ['PRODUCT_MGMT_GROUP', 'INVENTORY_GROUP', 'WAREHOUSE_MGMT_GROUP', 'ORDER_MGMT_GROUP', 'PURCHASING_GROUP'];
    } catch (e) {
      console.error('Failed to parse sidebar state', e);
      return ['PRODUCT_MGMT_GROUP', 'INVENTORY_GROUP', 'WAREHOUSE_MGMT_GROUP', 'ORDER_MGMT_GROUP', 'PURCHASING_GROUP'];
    }
  });

  useEffect(() => {
    localStorage.setItem('nexus_sidebar_expanded', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Auto-expand logic based on active view
  useEffect(() => {
    if (collapsed) return;
    
    // Group Mapping
    const groupMap: Record<string, string[]> = {
        'ORDER_MGMT_GROUP': [
            ViewState.OM_TASK_MANAGEMENT, 
            ViewState.OM_DISTRIBUTION_ORDER, 
            ViewState.OM_ARRIVAL_MANAGEMENT,
            ViewState.PARCEL_MANAGEMENT, 
            ViewState.PARCEL_HISTORY, 
            ViewState.PICKING_PLAN, 
            ViewState.PTL_USE, 
            ViewState.DISTRIBUTION_METHOD
        ],
        'WAREHOUSE_MGMT_GROUP': [
            ViewState.WAREHOUSE_CONFIG, 
            ViewState.SHELF_ARRANGEMENT
        ],
        'DELIVERY_MGMT_GROUP': [
            ViewState.DM_DISTRIBUTION_CENTER, 
            ViewState.DM_BRANCH_REPLENISHMENT, 
            ViewState.DM_TRANSFER_OUT_ORDER, 
            ViewState.DM_DELIVERY_TRACKING, 
            ViewState.DM_PRODUCTS_IN_TRANSIT
        ],
        'INVENTORY_GROUP': [ViewState.INVENTORY_QUERY],
        'PRODUCT_MGMT_GROUP': [ViewState.INVENTORY_PRODUCT, ViewState.INVENTORY_EXPIRE],
        'PURCHASING_GROUP': [ViewState.PURCHASING, ViewState.RECEIVING_ORDERS, ViewState.INBOUND],
        'SCAN_OPS_GROUP': [ViewState.SCAN_TO_SHELF, ViewState.SKU_LOOKUP, ViewState.SHELF_LOGS]
    };

    const newExpanded = new Set(expandedGroups);
    let changed = false;

    for (const [groupId, items] of Object.entries(groupMap)) {
        if (items.includes(currentView) && !newExpanded.has(groupId)) {
            newExpanded.add(groupId);
            changed = true;
        }
    }

    if (changed) {
        setExpandedGroups(Array.from(newExpanded));
    }
  }, [currentView, collapsed]);

  const toggleGroup = (groupId: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedGroups(prev => [...prev, groupId]);
      return;
    }
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const allMenuItems: MenuItem[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'AI_ASSISTANT', label: 'AI Assistant', icon: BrainCircuit },
    { id: 'TASK_MANAGER', label: 'My Tasks', icon: CheckSquare },
    { 
      id: 'ORDER_MGMT_GROUP', 
      label: 'Order Management', 
      icon: ClipboardList,
      subItems: [
        { id: ViewState.OM_TASK_MANAGEMENT, label: 'Task Management' },
        { id: ViewState.OM_DISTRIBUTION_ORDER, label: 'Distribution Order' },
        { id: ViewState.OM_ARRIVAL_MANAGEMENT, label: 'Arrival Management' },
        { id: ViewState.PARCEL_MANAGEMENT, label: 'Parcel Management' },
        { id: ViewState.PARCEL_HISTORY, label: 'Parcel History' },
        { id: ViewState.PICKING_PLAN, label: 'Picking Plan' },
        { id: ViewState.PTL_USE, label: 'PTL Use' },
        { id: ViewState.DISTRIBUTION_METHOD, label: 'Distribution Method' },
      ]
    },
    { 
      id: 'WAREHOUSE_MGMT_GROUP', 
      label: 'Warehouse Management', 
      icon: Warehouse,
      subItems: [
        { id: ViewState.WAREHOUSE_CONFIG, label: 'Warehouse Configuration' },
        { id: ViewState.SHELF_ARRANGEMENT, label: 'Shelf Arrangement' },
      ]
    },
    { 
      id: 'DELIVERY_MGMT_GROUP', 
      label: 'Delivery Management', 
      icon: Truck,
      subItems: [
        { id: ViewState.DM_DISTRIBUTION_CENTER, label: 'Distribution Center' },
        { id: ViewState.DM_BRANCH_REPLENISHMENT, label: 'Branch Replenishment' },
        { id: ViewState.DM_TRANSFER_OUT_ORDER, label: 'Transfer Out Order' },
        { id: ViewState.DM_DELIVERY_TRACKING, label: 'Delivery Tracking' },
        { id: ViewState.DM_PRODUCTS_IN_TRANSIT, label: 'Products in Transit' },
      ]
    },
    { 
      id: 'PURCHASING_GROUP', 
      label: 'Purchasing', 
      icon: ShoppingCart,
      subItems: [
        { id: ViewState.PURCHASING, label: 'Purchase Order' },
        { id: ViewState.RECEIVING_ORDERS, label: 'Receiving Orders' },
        { id: ViewState.INBOUND, label: 'Inbound Operations' },
      ]
    },
    { 
      id: 'PRODUCT_MGMT_GROUP', 
      label: 'Product Management', 
      icon: Tag,
      subItems: [
        { id: ViewState.INVENTORY_PRODUCT, label: 'Product File' },
        { id: ViewState.INVENTORY_EXPIRE, label: 'Product Expire Logs' },
      ]
    },
    { 
      id: 'INVENTORY_GROUP', 
      label: 'Inventory', 
      icon: Boxes,
      subItems: [
        { id: ViewState.INVENTORY_QUERY, label: 'Inventory Query' },
      ]
    },
    { 
      id: 'SCAN_OPS_GROUP', 
      label: 'Scan Operations', 
      icon: Scan,
      subItems: [
        { id: ViewState.SCAN_TO_SHELF, label: 'Scan to Shelf' },
        { id: ViewState.SKU_LOOKUP, label: 'SKU Lookup' },
        { id: ViewState.SHELF_LOGS, label: 'Shelf Logs' },
      ]
    }, 
    { id: 'ACCOUNT_MANAGEMENT', label: 'Account Mgmt', icon: Users },
    { id: 'SETTINGS', label: 'Settings', icon: Settings }, 
  ];

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'ADMIN': return { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30', icon: ShieldCheck };
          case 'INSPECTOR': return { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-red-900/30', icon: Search };
          default: return { bg: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30', icon: User };
      }
  };

  const hasAccess = (itemId: string) => {
      // Allow grouping if at least one child is accessible or if group itself is readable
      return checkPermission(itemId, 'read');
  };

  if (!currentUser) return null;

  const currentRoleStyle = getRoleBadge(currentUser.role);
  const RoleIcon = currentRoleStyle.icon;

  return (
    <div 
      className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen flex flex-col transition-[width,background-color] duration-300 ease-in-out z-20 print:hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-md">
              P
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Pam Pam</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!collapsed ? (
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0 animate-in fade-in">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm object-cover" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-gray-800 dark:text-white text-sm truncate">{currentUser.name}</span>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border w-fit mt-0.5 ${currentRoleStyle.bg}`}>
                <RoleIcon size={10} />
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-center flex-shrink-0">
             <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 object-cover" />
        </div>
      )}

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {allMenuItems.map((item) => {
          // Special permission handling to show group if children exist or user has access
          if (!hasAccess(item.id) && (!item.subItems || item.subItems.length === 0)) return null;

          const Icon = item.icon || Circle;
          const isGroup = !!item.subItems;
          const isExpanded = expandedGroups.includes(item.id);
          
          const isChildActive = item.subItems?.some(sub => sub.id === currentView);
          const isActive = currentView === item.id || isChildActive;

          return (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => isGroup ? toggleGroup(item.id) : onChangeView(item.id as ViewState)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive && !isGroup
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                } ${isChildActive && collapsed ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon size={20} className={`${(isActive || isChildActive) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                  {!collapsed && <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>}
                </div>
                
                {!collapsed && isGroup && (
                  <div className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} />
                  </div>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-white text-white dark:text-black text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity">
                    {item.label}
                  </div>
                )}
              </button>

              <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      !collapsed && isGroup && isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                  <div className="mt-1 ml-3 space-y-0.5 pl-3 border-l-2 border-gray-100 dark:border-slate-800">
                    {item.subItems?.map(subItem => {
                        const isSubActive = currentView === subItem.id;
                        return (
                        <button
                            key={subItem.id}
                            onClick={() => onChangeView(subItem.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                            isSubActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isSubActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-slate-700'}`}></span>
                            <span className="truncate">{subItem.label}</span>
                        </button>
                        );
                    })}
                  </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
        <button 
          onClick={logout}
          className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full px-3 py-2 rounded-lg group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
