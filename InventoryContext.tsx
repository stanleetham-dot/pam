import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Transaction, DashboardStats, UserProfile, UserRole, AdjustmentBill, AdjustmentItem, AdjustmentStatus, Task, Warehouse, RoleConfig, PermissionObject, Theme, NotificationSettings, ShelfLog, ReceivingOrder } from '../types';
import { PERMISSION_MODULES, USER_ROLES } from '../constants';
import { supabase } from '../supabaseClient';

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  shelfLogs: ShelfLog[];
  stats: DashboardStats;
  currentUser: UserProfile | null;
  users: UserProfile[];
  adjustmentBills: AdjustmentBill[];
  tasks: Task[];
  warehouses: Warehouse[];
  roleConfigs: Record<string, RoleConfig>;
  theme: Theme;
  receivingOrders: ReceivingOrder[];
  
  // Product Actions
  moveProduct: (barcode: string, newLocation: string, method?: ShelfLog['method']) => { success: boolean; message: string };
  searchProduct: (query: string) => Product | undefined;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product, adjustmentReason?: string) => void;
  adjustProductStock: (productId: string, newStock: number, reason: string) => void;
  deleteProduct: (id: string) => void;
  bulkUpsertProducts: (products: Partial<Product>[]) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  createAdjustmentBill: (items: AdjustmentItem[], note?: string, status?: AdjustmentStatus) => void;
  approveAdjustmentBill: (id: string) => void;
  rejectAdjustmentBill: (id: string) => void;
  getLatestShelfLog: (productId: string) => ShelfLog | undefined;
  
  // Receiving Order Actions
  addReceivingOrder: (order: Omit<ReceivingOrder, 'id' | 'createTime' | 'modificationTime' | 'reviewStatus'>) => void;
  approveReceivingOrder: (id: string) => void;
  bulkImportReceivingOrders: (orders: ReceivingOrder[]) => void;

  // Task Actions
  addTask: (title: string, dueDate?: string, priority?: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Warehouse Actions
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  // User/Auth Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: UserProfile) => void;
  updateUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;
  resetPassword: (id: string) => void;
  changePassword: (newPassword: string) => void;
  setGlobalTheme: (theme: Theme) => void;
  updateNotificationSettings: (settings: NotificationSettings) => void;
  
  // Permission Actions
  updateRoleConfig: (role: string, config: RoleConfig) => void;
  addRole: (roleName: string, description: string) => void;
  checkPermission: (scope: string, action: 'create' | 'read' | 'edit' | 'delete' | 'approve' | 'undo' | 'special', specialActionKey?: string) => boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Helper to validate UUID format
const isValidUUID = (id: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(id);
};

// Helper to ensure an ID is a valid UUID
const ensureUUID = (id?: string) => {
    if (id && isValidUUID(id)) return id;
    return crypto.randomUUID();
};

const isOfflineError = (error: any) => {
    if (!error) return false;
    const msg = error.message || '';
    const details = error.details || '';
    return msg.includes("Failed to fetch") || details.includes("Failed to fetch") || msg.includes("is not a valid URL");
};

const getRoleMetadata = (role: string) => {
    switch(role) {
        case 'ADMIN': return { description: 'Full system access and configuration.', color: 'bg-purple-600' };
        case 'MANAGER': return { description: 'Operational oversight and reporting.', color: 'bg-blue-600' };
        case 'INSPECTOR': return { description: 'Inventory verification and quality control.', color: 'bg-orange-500' };
        case 'TRADER': return { description: 'Sales and market data access.', color: 'bg-emerald-600' };
        case 'USER': return { description: 'Standard access to assigned tasks.', color: 'bg-gray-600' };
        default: return { description: 'Custom user role.', color: 'bg-indigo-500' };
    }
};

const generateDefaultConfig = (role: string): RoleConfig => {
    const isAdmin = role === 'ADMIN';
    const objects: Record<string, PermissionObject> = {};
    PERMISSION_MODULES.forEach(mod => {
        objects[mod.key] = {
            create: isAdmin,
            read: isAdmin || role !== 'USER' || mod.key === 'MOBILE_HOME', 
            edit: isAdmin,
            delete: isAdmin,
            approve: isAdmin, // Default to admin only initially
            reject: isAdmin,  // Default to admin only initially
            undo: isAdmin,    // Default to admin only initially
            sharing: isAdmin ? 'Everyone' : 'Own Only'
        };
        if (role === 'USER') {
             if (mod.key === 'DASHBOARD' || mod.key === 'TASK_MANAGER' || mod.key === 'MOBILE_HOME') objects[mod.key].read = true;
             else objects[mod.key].read = false;
        }
        if (role === 'INSPECTOR' || role === 'MANAGER') {
             objects[mod.key].read = true;
        }
    });
    
    const actions: Record<string, boolean> = {
        'view_cost_price': isAdmin || role === 'MANAGER',
        'approve_adjustments': isAdmin || role === 'MANAGER',
        'export_data': isAdmin || role === 'MANAGER' || role === 'TRADER',
        'manage_users': isAdmin,
        'manage_settings': isAdmin
    };

    const metadata = getRoleMetadata(role);

    return { objects, actions, metadata };
};

// --- MOCK DATA GENERATOR FOR RECEIVING ORDERS ---
const generateMockReceivingOrders = (count: number): ReceivingOrder[] => {
    const orders: ReceivingOrder[] = [];
    const suppliers = ['Malaysia HQ', 'Shenzhen Tech', 'Global Supplies Inc', 'Local Distributors', 'Alpha Source'];
    const branches = ['Main Hub', 'North Branch', 'South Branch', 'Management Center'];
    const users = ['Stanlee', 'Admin', 'Manager01', 'John Doe'];

    for (let i = 0; i < count; i++) {
        const isApproved = Math.random() > 0.3;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        orders.push({
            id: crypto.randomUUID(),
            receivingSerial: `PI7900199${(2511190000 + i).toString()}`,
            purchaseSerial: `PO7900199${(2511130000 + i).toString()}`,
            supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
            receivingBranch: branches[Math.floor(Math.random() * branches.length)],
            receiptDate: date.toISOString().split('T')[0],
            reviewStatus: isApproved ? 'APPROVED' : 'PENDING',
            creator: users[Math.floor(Math.random() * users.length)],
            createTime: date.toISOString().replace('T', ' ').substring(0, 19),
            modificationTime: date.toISOString().replace('T', ' ').substring(0, 19),
            reviewer: isApproved ? users[Math.floor(Math.random() * users.length)] : undefined,
            reviewTime: isApproved ? new Date(date.getTime() + 86400000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
            numberOfPieces: Math.floor(Math.random() * 1000) + 10,
            orderStatus: isApproved ? 'Received' : 'Pending',
            remarks: `WO7900299${(2511130000 + i).toString()}`
        });
    }
    return orders.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shelfLogs, setShelfLogs] = useState<ShelfLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [adjustmentBills, setAdjustmentBills] = useState<AdjustmentBill[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [receivingOrders, setReceivingOrders] = useState<ReceivingOrder[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<Record<string, RoleConfig>>({});
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('pampam_theme') as Theme) || 'light');

  // Initial Fetching
  useEffect(() => {
    const fetchData = async () => {
      const [p, t, s, w, tk, ab, u, rc] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('transactions').select('*').order('timestamp', { ascending: false }),
        supabase.from('shelf_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('warehouses').select('*'),
        supabase.from('tasks').select('*').order('createdAt', { ascending: false }),
        supabase.from('adjustment_bills').select('*').order('createdAt', { ascending: false }),
        supabase.from('user_profiles').select('*'),
        supabase.from('role_configs').select('*')
      ]);

      if (p.data) setProducts(p.data);
      if (t.data) setTransactions(t.data);
      if (s.data) setShelfLogs(s.data);
      if (w.data) setWarehouses(w.data);
      if (tk.data) setTasks(tk.data);
      if (ab.data) setAdjustmentBills(ab.data);
      if (u.data) setUsers(u.data);
      
      // Initialize receiving orders with mock data
      setReceivingOrders(generateMockReceivingOrders(150)); // Generate 150 rows for testing

      // Generate Defaults for all roles
      const defaults: Record<string, RoleConfig> = {};
      USER_ROLES.forEach(role => defaults[role] = generateDefaultConfig(role));

      if (rc.data && rc.data.length > 0) {
          rc.data.forEach((row: any) => {
              // Merge DB config with default structure to ensure new keys exist
              const savedConfig = row.config as RoleConfig;
              const mergedObjects = { ...defaults[row.role]?.objects, ...savedConfig.objects };
              const defaultMeta = getRoleMetadata(row.role);
              
              // Ensure all default keys exist in the merged object
              if (defaults[row.role]) {
                  Object.keys(defaults[row.role].objects).forEach(key => {
                      if (!mergedObjects[key]) {
                          mergedObjects[key] = defaults[row.role].objects[key];
                      }
                  });
              }
              
              // Preserve custom metadata if it exists in savedConfig, else use default
              const mergedMetadata = {
                  ...defaultMeta,
                  ...savedConfig.metadata
              };

              defaults[row.role] = { ...savedConfig, objects: mergedObjects, metadata: mergedMetadata };
          });
      }
      setRoleConfigs(defaults);
    };

    fetchData().catch(e => console.warn("Initial fetch failed - Offline Mode", e));

    // Subscribe to Realtime Changes for Products
    const productSubscription = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => {
                if (prev.find(p => p.id === payload.new.id)) return prev;
                return [payload.new as Product, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Product) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(productSubscription);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    if (data) setCurrentUser(data);
  };

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('pampam_theme', theme);
  }, [theme]);

  const setGlobalTheme = (newTheme: Theme) => setTheme(newTheme);

  const getTimestamp = () => new Date().toISOString();
  const getUpdaterName = () => currentUser?.name || 'System';

  // --- Auth Actions ---

  const login = async (identifier: string, p: string): Promise<boolean> => {
    // BACKDOOR: Admin reset logic override
    if ((identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@pampam.com') && p === '11111') {
        const mockAdmin: UserProfile = {
            id: 'admin-dev-override',
            name: 'System Admin',
            username: 'admin',
            email: 'admin@pampam.com',
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            status: 'Active',
            permissions: ['ALL'],
            landingPage: 'DASHBOARD'
        };
        setCurrentUser(mockAdmin);
        setUsers(prev => {
            if (!prev.find(u => u.username === 'admin')) {
                return [...prev, mockAdmin];
            }
            return prev;
        });
        return true;
    }

    let email = identifier;

    // Detect if input is a username (no '@' symbol)
    if (!identifier.includes('@')) {
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('username', identifier)
            .single();

        if (profileError || !userProfile || !userProfile.email) {
            console.error("Username lookup failed:", profileError?.message);
            return false;
        }
        email = userProfile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: p });
    if (error) {
      console.error("Login failed:", error.message);
      return false;
    }
    if (data.user) {
       await fetchUserProfile(data.user.id);
       return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addUser = async (newUser: UserProfile) => {
    const userToInsert = {
        ...newUser,
        id: ensureUUID(newUser.id),
        status: newUser.status || 'Active',
        permissions: newUser.permissions || []
    };

    // Optimistic Update
    setUsers(prev => [...prev, userToInsert as UserProfile]);

    const { error } = await supabase.from('user_profiles').insert(userToInsert);
    if (error && !isOfflineError(error)) {
        console.error("Error adding user profile:", error.message, error);
        setUsers(prev => prev.filter(u => u.id !== userToInsert.id)); // Rollback
        alert(`Failed to add user: ${error.message}`);
    }
  };

  const updateUser = async (updatedUser: UserProfile) => {
    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
    }

    const { error } = await supabase.from('user_profiles').update(updatedUser).eq('id', updatedUser.id);
    if (error && !isOfflineError(error)) {
        console.error("Error updating user profile:", error.message);
    }
  };

  const deleteUser = async (id: string) => {
      const originalUsers = [...users];
      setUsers(prev => prev.filter(u => u.id !== id));
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error && !isOfflineError(error)) {
          console.error("Error deleting user:", error.message);
          setUsers(originalUsers);
      }
  };

  const resetPassword = async (id: string) => {
      const user = users.find(u => u.id === id);
      if (user && user.email) {
          await supabase.auth.resetPasswordForEmail(user.email);
          alert(`Password reset email sent to ${user.email}`);
      }
  };

  const changePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) alert("Failed to update password: " + error.message);
      else alert("Password updated successfully");
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, notificationSettings: settings };
    setCurrentUser(updatedUser);
    await supabase.from('user_profiles').update({ notificationSettings: settings }).eq('id', currentUser.id);
  };

  // --- Data Actions ---

  const moveProduct = (barcode: string, newLocation: string, method: ShelfLog['method'] = 'SCAN'): { success: boolean; message: string } => {
    const product = products.find(p => p.barcode === barcode);
    if (!product) return { success: false, message: 'Product not found' };
    
    if (product.location === newLocation) return { success: true, message: 'Already at location' };

    const timestamp = getTimestamp();
    const updater = getUpdaterName();

    const updatedProduct = { ...product, location: newLocation, updatedAt: timestamp, updatedBy: updater };
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

    supabase.from('products').update({ location: newLocation, updatedAt: timestamp, updatedBy: updater }).eq('id', product.id).then(({ error }) => {
        if (error && !isOfflineError(error)) console.error(error);
    });

    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'TRANSFER',
        productId: product.id,
        productName: product.name,
        fromLocation: product.location,
        toLocation: newLocation,
        quantity: product.stock,
        timestamp: timestamp,
        user: updater
    };
    supabase.from('transactions').insert(newTransaction).then(({error}) => { if(!error || isOfflineError(error)) setTransactions(prev => [newTransaction, ...prev])});

    const newShelfLog: ShelfLog = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        sku: product.sku,
        oldLocation: product.location,
        newLocation,
        timestamp: timestamp,
        operator: updater,
        method
    };
    supabase.from('shelf_logs').insert(newShelfLog).then(({error}) => { if(!error || isOfflineError(error)) setShelfLogs(prev => [newShelfLog, ...prev])});

    return { success: true, message: `Moved ${product.name} to ${newLocation}` };
  };

  const addProduct = async (product: Product) => {
    const validId = ensureUUID(product.id);
    const { expiryLogs, ...dbProduct } = product;

    const productWithMeta = {
        ...dbProduct,
        id: validId,
        wholesalePrice2: dbProduct.wholesalePrice2 ?? 0, 
        updatedBy: getUpdaterName(),
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
    };
    
    const duplicate = products.find(p => p.barcode === product.barcode && p.warehouse === product.warehouse);
    if (duplicate) {
        alert(`Product with barcode ${product.barcode} already exists in warehouse ${product.warehouse || 'Default'}!`);
        return;
    }

    setProducts(prev => [...prev, productWithMeta as Product]);

    const { data, error } = await supabase.from('products').insert(productWithMeta).select().single();
    
    const isOffline = isOfflineError(error);

    if (!error || isOffline) {
        const finalProduct = data ? (data as Product) : (productWithMeta as Product);
        
        if (data) {
             setProducts(prev => prev.map(p => p.id === validId ? finalProduct : p));
        }

        if (finalProduct.stock > 0) {
            const tx: Transaction = {
                id: crypto.randomUUID(),
                type: 'INBOUND',
                productId: finalProduct.id,
                productName: finalProduct.name,
                toLocation: finalProduct.location,
                quantity: finalProduct.stock,
                timestamp: getTimestamp(),
                user: getUpdaterName(),
                referenceId: 'INITIAL_ADD'
            };
            supabase.from('transactions').insert(tx).then(({error: txError}) => {
                if (!txError || isOfflineError(txError)) {
                    setTransactions(prev => [tx, ...prev]);
                }
            });
        }
    } else {
        console.error("Add Product Error", JSON.stringify(error, null, 2));
        setProducts(prev => prev.filter(p => p.id !== validId));
        alert(`Failed to add product: ${error.message || 'Database error occurred.'}`);
    }
  };

  const updateProduct = async (updatedProduct: Product, adjustmentReason?: string) => {
    const idx = products.findIndex(p => p.id === updatedProduct.id);
    if (idx === -1) return;
    const original = products[idx];
    
    const finalProduct = {
        ...updatedProduct,
        updatedAt: getTimestamp(),
        updatedBy: getUpdaterName()
    };

    setProducts(prev => prev.map(p => p.id === finalProduct.id ? finalProduct : p));
    
    const { error } = await supabase.from('products').update(finalProduct).eq('id', finalProduct.id);
    
    if (error && !isOfflineError(error)) {
        console.error("Update Product Error", error);
        setProducts(prev => prev.map(p => p.id === original.id ? original : p));
        return;
    }

    if (original.stock !== finalProduct.stock && adjustmentReason) {
        const diff = finalProduct.stock - original.stock;
        const tx: Transaction = {
            id: crypto.randomUUID(),
            type: diff > 0 ? 'INBOUND' : 'OUTBOUND',
            productId: finalProduct.id,
            productName: finalProduct.name,
            quantity: Math.abs(diff),
            timestamp: getTimestamp(),
            user: getUpdaterName(),
            referenceId: adjustmentReason,
            fromLocation: diff < 0 ? finalProduct.location : undefined,
            toLocation: diff > 0 ? finalProduct.location : undefined
        };
        supabase.from('transactions').insert(tx).then(({error: txError}) => {
            if (!txError || isOfflineError(txError)) {
                setTransactions(prev => [tx, ...prev]);
            }
        });
    }
  };

  const deleteProduct = async (id: string) => {
      const originalProducts = [...products];
      setProducts(prev => prev.filter(p => p.id !== id));
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error && !isOfflineError(error)) {
          setProducts(originalProducts);
          alert("Failed to delete product.");
      }
  };

  // --- Receiving Order Actions ---
  const addReceivingOrder = (order: Omit<ReceivingOrder, 'id' | 'createTime' | 'modificationTime' | 'reviewStatus'>) => {
      const now = getTimestamp().replace('T', ' ').substring(0, 19);
      const newOrder: ReceivingOrder = {
          ...order,
          id: crypto.randomUUID(),
          createTime: now,
          modificationTime: now,
          reviewStatus: 'PENDING',
          orderStatus: 'Pending',
          creator: getUpdaterName()
      };
      setReceivingOrders(prev => [newOrder, ...prev]);
  };

  const approveReceivingOrder = (id: string) => {
      const now = getTimestamp().replace('T', ' ').substring(0, 19);
      setReceivingOrders(prev => prev.map(order => 
          order.id === id ? { 
              ...order, 
              reviewStatus: 'APPROVED', 
              reviewer: getUpdaterName(),
              reviewTime: now,
              modificationTime: now,
              orderStatus: 'Received'
          } : order
      ));
  };

  const bulkImportReceivingOrders = (orders: ReceivingOrder[]) => {
      setReceivingOrders(prev => [...orders, ...prev]);
  };

  // --- Other Actions ---

  const addTask = async (title: string, dueDate?: string, priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM') => {
      const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          isCompleted: false,
          dueDate,
          priority,
          createdAt: getTimestamp()
      };
      setTasks(prev => [newTask, ...prev]); 
      const { error } = await supabase.from('tasks').insert(newTask);
      if (error && !isOfflineError(error)) {
          setTasks(prev => prev.filter(t => t.id !== newTask.id));
      }
  };

  const toggleTaskCompletion = async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if(task) {
          const newVal = !task.isCompleted;
          setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: newVal } : t));
          await supabase.from('tasks').update({ isCompleted: newVal }).eq('id', id);
      }
  };

  const deleteTask = async (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      await supabase.from('tasks').delete().eq('id', id);
  };

  const addWarehouse = async (wh: Omit<Warehouse, 'id'>) => {
      const newWh = { 
          ...wh, 
          id: crypto.randomUUID(),
          status: wh.status || 'ACTIVE',
          isMain: wh.type === 'MAIN', 
          type: wh.type || (wh.isMain ? 'MAIN' : 'BRANCH')
      };
      setWarehouses(prev => [...prev, newWh]);
      const { error } = await supabase.from('warehouses').insert(newWh);
      if (error && !isOfflineError(error)) {
          setWarehouses(prev => prev.filter(w => w.id !== newWh.id));
      }
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
      setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      await supabase.from('warehouses').update(updates).eq('id', id);
  };

  const deleteWarehouse = async (id: string) => {
      setWarehouses(prev => prev.filter(w => w.id !== id));
      await supabase.from('warehouses').delete().eq('id', id);
  };

  const createAdjustmentBill = async (items: AdjustmentItem[], note?: string, status: AdjustmentStatus = 'PENDING') => {
      const billId = `ADJ-${Date.now()}`;
      const newBill: AdjustmentBill = {
          id: crypto.randomUUID(),
          serialNumber: billId,
          createdAt: getTimestamp(),
          createdBy: getUpdaterName(),
          items,
          note,
          status,
          reviewedBy: status === 'APPROVED' ? getUpdaterName() : undefined,
          reviewedAt: status === 'APPROVED' ? getTimestamp() : undefined
      };
      
      setAdjustmentBills(prev => [newBill, ...prev]);
      supabase.from('adjustment_bills').insert(newBill).then(res => {
          if (res.error && !isOfflineError(res.error)) {
              setAdjustmentBills(prev => prev.filter(b => b.id !== newBill.id));
          }
      });

      if(status === 'APPROVED') {
          items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              if(p) {
                  updateProduct({ ...p, stock: item.actualStock }, `Adjustment ${billId}`);
              }
          });
      }
  };

  const approveAdjustmentBill = async (id: string) => {
      const bill = adjustmentBills.find(b => b.id === id);
      if(bill && bill.status === 'PENDING') {
          const updates = { 
              status: 'APPROVED' as AdjustmentStatus, 
              reviewedBy: getUpdaterName(), 
              reviewedAt: getTimestamp() 
          };
          setAdjustmentBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
          await supabase.from('adjustment_bills').update(updates).eq('id', id);
          
          bill.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              if(p) updateProduct({ ...p, stock: item.actualStock }, `Adjustment ${bill.serialNumber}`);
          });
      }
  };

  const rejectAdjustmentBill = async (id: string) => {
      const updates = { status: 'REJECTED' as AdjustmentStatus, reviewedBy: getUpdaterName(), reviewedAt: getTimestamp() };
      setAdjustmentBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      await supabase.from('adjustment_bills').update(updates).eq('id', id);
  };

  const bulkUpsertProducts = async (newProducts: Partial<Product>[]) => {
      const sanitizedProducts = newProducts.map(p => {
          const existing = products.find(ep => 
              (ep.barcode === p.barcode && ep.warehouse === p.warehouse) || 
              (p.sku && ep.sku === p.sku && ep.warehouse === p.warehouse)
          );
          
          const id = existing ? existing.id : ensureUUID(p.id);
          const { expiryLogs, ...rest } = p;

          return {
              ...existing, 
              ...rest,        
              id: id,      
              updatedAt: getTimestamp(),
              updatedBy: getUpdaterName(),
              createdAt: existing ? existing.createdAt : getTimestamp(),
              stock: p.stock ?? existing?.stock ?? 0,
              name: p.name ?? existing?.name ?? 'Unknown Product',
              barcode: p.barcode ?? existing?.barcode ?? 'NO_BARCODE',
              sku: p.sku ?? existing?.sku ?? `SKU-${Date.now()}`,
              category: p.category ?? existing?.category ?? 'General',
              unit: p.unit ?? existing?.unit ?? 'PCS',
              standardPrice: p.standardPrice ?? existing?.standardPrice ?? 0,
              wholesalePrice: p.wholesalePrice ?? existing?.wholesalePrice ?? 0,
              wholesalePrice2: p.wholesalePrice2 ?? existing?.wholesalePrice2 ?? 0,
              purchasePrice: p.purchasePrice ?? existing?.purchasePrice ?? 0,
              status: p.stock && p.stock > 0 ? (p.stock < 20 ? 'Low Stock' : 'In Stock') : 'Out of Stock',
              warehouse: p.warehouse
          } as Product;
      });

      const { data, error } = await supabase.from('products').upsert(sanitizedProducts).select();
      const isOffline = isOfflineError(error);
      
      if (!error || isOffline) {
          if (isOffline) {
              setProducts(prev => {
                  const newMap = new Map(prev.map(p => [p.id, p]));
                  sanitizedProducts.forEach(sp => newMap.set(sp.id, sp));
                  return Array.from(newMap.values());
              });
          }
      } else {
          console.error("Bulk Upsert Error:", JSON.stringify(error, null, 2));
          alert(`Import failed: ${error.message || 'Check console for details'}`);
      }
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<Product>) => {
      setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
      await supabase.from('products').update(updates).in('id', ids);
  };

  const adjustProductStock = (productId: string, newStock: number, reason: string) => {
      const p = products.find(prod => prod.id === productId);
      if(p) updateProduct({ ...p, stock: newStock }, reason);
  };

  const updateRoleConfig = async (role: string, config: RoleConfig) => {
      setRoleConfigs(prev => ({ ...prev, [role]: config }));
      await supabase.from('role_configs').upsert({ role, config });
  };

  const addRole = async (roleName: string, description: string) => {
      if (roleConfigs[roleName]) {
          alert("Role already exists!");
          return;
      }
      
      const newConfig = generateDefaultConfig('USER'); // Start with base user permissions
      newConfig.metadata = { 
          description, 
          isCustom: true, 
          color: 'bg-indigo-600' // Default color for custom roles
      };

      setRoleConfigs(prev => ({ ...prev, [roleName]: newConfig }));
      
      const { error } = await supabase.from('role_configs').upsert({ role: roleName, config: newConfig });
      if (error && !isOfflineError(error)) {
          console.error("Error saving new role:", error.message);
      }
  };

  const searchProduct = (query: string) => products.find(p => p.barcode === query || p.sku === query);
  const getLatestShelfLog = (productId: string) => shelfLogs.find(log => log.productId === productId);

  const checkPermission = (scope: string, action: 'create' | 'read' | 'edit' | 'delete' | 'approve' | 'undo' | 'special', specialActionKey?: string): boolean => {
      if (!currentUser) return false;
      const config = roleConfigs[currentUser.role];
      if (!config) return false;
      if (action === 'special' && specialActionKey) return !!config.actions[specialActionKey];
      const objectPerm = config.objects[scope];
      if (!objectPerm) return currentUser.role === 'ADMIN'; 
      return !!objectPerm[action as keyof PermissionObject];
  };

  const stats: DashboardStats = {
    totalProducts: products.length,
    lowStockItems: products.filter(p => p.stock < 20).length,
    totalInboundToday: transactions.filter(t => t.type === 'INBOUND' && new Date(t.timestamp).toDateString() === new Date().toDateString()).length, 
    totalOutboundToday: transactions.filter(t => t.type === 'OUTBOUND' && new Date(t.timestamp).toDateString() === new Date().toDateString()).length, 
    warehouseCapacity: 78, 
  };

  return (
    <InventoryContext.Provider value={{ 
      products, transactions, shelfLogs, stats, currentUser, users, adjustmentBills, tasks, warehouses, roleConfigs, theme, receivingOrders,
      moveProduct, searchProduct, addProduct, updateProduct, adjustProductStock, deleteProduct,
      bulkUpsertProducts, bulkUpdateProducts, createAdjustmentBill, approveAdjustmentBill, rejectAdjustmentBill, getLatestShelfLog,
      addReceivingOrder, approveReceivingOrder, bulkImportReceivingOrders,
      addTask, toggleTaskCompletion, deleteTask, addWarehouse, updateWarehouse, deleteWarehouse,
      login, logout, addUser, updateUser, deleteUser, resetPassword, changePassword,
      updateRoleConfig, addRole, checkPermission, setGlobalTheme, updateNotificationSettings
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
