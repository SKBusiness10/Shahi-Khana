import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, User, Key, X, CheckSquare, XSquare, 
  Settings, LogOut, Package, RefreshCw, ShoppingBag, 
  DollarSign, Calendar, Mail, Plus, Trash2, Edit3, 
  AlertCircle, Check, HelpCircle, Sparkles
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs, 
  writeBatch,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data';

interface AdminDashboardProps {
  onClose: () => void;
}

interface OrderItem {
  name: string;
  portion: 'half' | 'full';
  quantity: number;
  priceByUnit: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  orderMethod: 'takeaway' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'rejected';
  orderDate: string;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Credentials configuration
  const [showSettings, setShowSettings] = useState(false);
  const [configSuccess, setConfigSuccess] = useState('');

  // Orders pipeline
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');

  // Control Portal Tabs ('orders' | 'menu')
  const [selectedTab, setSelectedTab] = useState<'orders' | 'menu'>('orders');

  // Menu Catalog States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuError, setMenuError] = useState('');
  const [menuSuccess, setMenuSuccess] = useState('');
  
  // Editor Form States
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState<MenuItem | null>(null);

  // Form Field Values
  const [itemFormId, setItemFormId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemNameUrdu, setItemNameUrdu] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [priceFull, setPriceFull] = useState<number | ''>('');
  const [priceHalf, setPriceHalf] = useState<number | ''>('');
  const [hasHalfOption, setHasHalfOption] = useState(false);
  const [category, setCategory] = useState<'breakfast' | 'bread' | 'dairy' | 'beverages'>('breakfast');
  const [isSpecialty, setIsSpecialty] = useState(false);

  // Sync Admin session, orders stream, and menu items stream from Firebase
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeMenu: (() => void) | null = null;

    // Listen to Firebase auth session state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listeners if active
      if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
      }
      if (unsubscribeMenu) {
        unsubscribeMenu();
        unsubscribeMenu = null;
      }

      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setLoginError('');

        // Real-time synchronization of placed orders
        unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
          const fetchedOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            fetchedOrders.push({ ...docSnap.data() as Order, id: docSnap.id });
          });
          
          // Sort descending by Order ID (which has Timestamp offset)
          fetchedOrders.sort((a, b) => b.id.localeCompare(a.id));
          setOrders(fetchedOrders);
        }, (error) => {
          console.error('Firestore real-time orders query error:', error);
          try {
            handleFirestoreError(error, OperationType.LIST, 'orders');
          } catch (e) {}
        });

        // Real-time synchronization of menu items
        unsubscribeMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
          const fetchedMenu: MenuItem[] = [];
          snapshot.forEach((docSnap) => {
            fetchedMenu.push({ ...docSnap.data() as MenuItem, id: docSnap.id });
          });
          // Sort numeric ID order
          fetchedMenu.sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, '')) || 999;
            const numB = parseInt(b.id.replace(/\D/g, '')) || 999;
            return numA - numB;
          });
          setMenuItems(fetchedMenu);
        }, (error) => {
          console.error('Firestore real-time menu items query error:', error);
        });
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        // Load fallback storage list if not signed in or offline
        loadOrdersLocalFallback();
      }
    });

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
      if (unsubscribeMenu) {
        unsubscribeMenu();
      }
      unsubscribeAuth();
    };
  }, []);

  const loadOrdersLocalFallback = () => {
    const savedOrdersStr = localStorage.getItem('shahi_khana_orders');
    if (savedOrdersStr) {
      try {
        setOrders(JSON.parse(savedOrdersStr));
      } catch (e) {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  };

  // Menu Catalog Controller Helpers
  const handleResetMenuForm = () => {
    setIsEditingItem(null);
    setShowMenuForm(false);
    setItemFormId('');
    setItemName('');
    setItemNameUrdu('');
    setItemDescription('');
    setPriceFull('');
    setPriceHalf('');
    setHasHalfOption(false);
    setCategory('breakfast');
    setIsSpecialty(false);
  };

  const handleOpenEditMenuItem = (item: MenuItem) => {
    setIsEditingItem(item);
    setShowMenuForm(true);
    setItemFormId(item.id);
    setItemName(item.name);
    setItemNameUrdu(item.nameUrdu);
    setItemDescription(item.description);
    setPriceFull(item.priceFull);
    setPriceHalf(item.priceHalf || '');
    setHasHalfOption(item.hasHalfOption);
    setCategory(item.category);
    setIsSpecialty(!!item.isSpecialty);
  };

  const handleOpenAddMenuItem = () => {
    handleResetMenuForm();
    setShowMenuForm(true);
    
    // Auto-calculate suggest mi-id
    const maxNum = menuItems.reduce((max, item) => {
      const num = parseInt(item.id.replace(/\D/g, '')) || 0;
      return num > max ? num : max;
    }, 0);
    setItemFormId(`mi-${maxNum + 1}`);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuError('');
    setMenuSuccess('');

    if (!itemName.trim() || !itemNameUrdu.trim() || !itemDescription.trim() || priceFull === '') {
      setMenuError('All primary required fields (English, Urdu, Description, Full Price) must be populated.');
      return;
    }

    const payloadId = isEditingItem ? isEditingItem.id : itemFormId.trim();
    if (!payloadId) {
      setMenuError('A unique menu item identifier is required.');
      return;
    }

    // High fidelity schema matches MenuItem types
    const payload: MenuItem = {
      id: payloadId,
      name: itemName.trim(),
      nameUrdu: itemNameUrdu.trim(),
      description: itemDescription.trim(),
      priceFull: Number(priceFull),
      hasHalfOption,
      category,
      isSpecialty,
    };

    if (hasHalfOption && priceHalf !== '') {
      payload.priceHalf = Number(priceHalf);
    }

    try {
      const docRef = doc(db, 'menu_items', payloadId);
      await setDoc(docRef, payload);
      setMenuSuccess(isEditingItem ? `Dish "${itemName}" updated successfully!` : `New dish "${itemName}" added successfully!`);
      handleResetMenuForm();
    } catch (err: any) {
      console.error('Firestore save menu failed:', err);
      setMenuError(err.message || 'Failed saving dynamic dish in database.');
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (window.confirm(`Are you sure you want to delete this menu item (${itemId})?`)) {
      setMenuError('');
      setMenuSuccess('');
      try {
        await deleteDoc(doc(db, 'menu_items', itemId));
        setMenuSuccess('Menu item successfully deleted from dynamic website catalogue!');
      } catch (err: any) {
        console.error('Firestore delete menu failed:', err);
        setMenuError(err.message || 'Failed to delete menu item.');
      }
    }
  };

  const handleSeedMenuItems = async () => {
    if (window.confirm('Would you like to seed the dynamic menu_items database with the 18 default specialties from Shahi Khana? This pre-populates your dynamic menu choice list immediately!')) {
      setMenuError('');
      setMenuSuccess('');
      try {
        const batch = writeBatch(db);
        MENU_ITEMS.forEach((item) => {
          const docRef = doc(db, 'menu_items', item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
        setMenuSuccess('Successfully seeded all 18 standard menu items to your dynamic database!');
      } catch (err: any) {
        console.error('Firestore batch seed failed:', err);
        setMenuError(err.message || 'Failed to seed the default menu items.');
      }
    }
  };

  // Submit Sign-In or Sign-Up via Firebase Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setConfigSuccess('');

    const email = emailInput.trim();
    const password = passwordInput;

    if (!email || !password) {
      setLoginError('Email and password credentials are required.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setConfigSuccess('Admin access successfully authorized.');
      setEmailInput('');
      setPasswordInput('');
    } catch (error: any) {
      console.error('Firebase Auth error context:', error);
      let errorMsg = error.message || 'Authentication failed. Please verify credentials.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email key is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password keys must contain at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid administrative email.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email login or security passcode value.';
      }
      setLoginError(errorMsg);
    }
  };

  // Log Out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSelectedOrder(null);
      setShowSettings(false);
    } catch (err) {
      console.error('Firebase signout failure:', err);
    }
  };

  // Change order status (Confirm / Reject) on both local storage + Firebase Firestore
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'confirmed' | 'rejected') => {
    // 1. Update local cache/fallback for immediate feedback
    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: nextStatus };
      }
      return ord;
    });

    localStorage.setItem('shahi_khana_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    
    // Update active expansion details
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }

    // 2. Synchronize update upstream to Firebase Firestore
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status: nextStatus });
      console.log('Firebase Order Approved/Rejected state saved:', orderId, nextStatus);
    } catch (err) {
      console.error('Firestore Order Status Update Failed:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      } catch (e) {}
    }
  };

  // Clear all orders helper
  const handleResetOrders = async () => {
    if (window.confirm('Are you sure you want to clear orders database? This will sweep your real-time Firestore collection.')) {
      localStorage.removeItem('shahi_khana_orders');
      setOrders([]);
      setSelectedOrder(null);

      // Clean Firestore orders in structural batches
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
          batch.delete(doc(db, 'orders', docSnap.id));
        });
        await batch.commit();
        console.log('Firebase Firestore orders wiped cleanly.');
      } catch (err) {
        console.error('Firestore mass order delete failed:', err);
        try {
          handleFirestoreError(err, OperationType.DELETE, 'orders/*');
        } catch (e) {}
      }
    }
  };

  // Filter computation
  const filteredOrders = orders.filter(ord => {
    if (filterMode === 'all') return true;
    return ord.status === filterMode;
  });

  return (
    <section className="bg-gradient-to-b from-[#fbf8f5] to-[#f5eeeb] min-h-screen pt-32 pb-24 relative px-4">
      {/* Upper absolute design ornaments */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#58111A_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#58111A]/10 pb-6 mb-10 gap-4">
          <div className="text-center sm:text-left">
            <span className="font-sans text-xs font-black tracking-widest text-[#D4AF37] uppercase block">
              Shahi Khana Authority portal
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-[#58111A] tracking-tight mt-1">
              {isAuthenticated ? '👑 Admin Command Center' : '🔒 Secure Admin Gate'}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#58111A] text-[#58111A] hover:text-white rounded-lg border border-[#58111A]/20 transition-all text-xs font-bold cursor-pointer shadow-xs"
          >
            <X className="h-4 w-4 text-[#D4AF37]" />
            <span>Close Control Panel</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* Secure Log-In & Sign-Up Portal Box */
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto bg-white border border-[#58111A]/12 p-8 sm:p-10 rounded-2xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#58111A]" />
              
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex p-3.5 bg-[#58111A]/5 text-[#58111A] border border-[#58111A]/10 rounded-full mb-1">
                  <Lock className="h-7 w-7 text-[#58111A]" />
                </div>
                <h2 className="font-sans text-xl font-bold text-[#58111A] tracking-tight">Access Verification</h2>
                <p className="font-sans text-xs text-[#58111A]/60 font-semibold leading-relaxed">
                  Authenticate your admin profile to inspect live orders, accept takeaway requests, and ship deliveries.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-sans text-xs font-bold text-center">
                  {loginError}
                </div>
              )}

              {configSuccess && (
                <div className="p-3.5 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-xs font-bold text-center">
                  {configSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70 block">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58111A]/40">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      required
                      type="email"
                      id="admin-email-gate"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="admin@shahikhana.com"
                      className="w-full pl-9 pr-4 py-3 rounded-lg bg-[#FAF6F0] border border-[#58111A]/15 text-[#58111A] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70 block">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#58111A]/40">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      required
                      type="password"
                      id="admin-password-gate"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Minimum 6 characters keys..."
                      className="w-full pl-9 pr-4 py-3 rounded-lg bg-[#FAF6F0] border border-[#58111A]/15 text-[#58111A] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center py-3.5 bg-[#58111A] hover:bg-[#D4AF37] hover:text-[#58111A] text-white font-black tracking-wide rounded-lg text-sm transition-all shadow-md cursor-pointer border border-[#D4AF37]/30 mt-3"
                >
                  <Unlock className="h-4 w-4 text-[#D4AF37] mr-2" />
                  <span>Verify Passcode Gate</span>
                </button>
              </form>
            </motion.div>
          ) : (
            /* Exclusive Authenticated Dashboard Portal */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Portal Mode Switcher Tabs */}
              <div className="flex bg-white/75 backdrop-blur-md p-1.5 rounded-xl border border-[#58111A]/10 max-w-sm sm:max-w-md shadow-xs justify-center mx-auto sm:mx-0">
                <button
                  id="tab-orders-pipeline"
                  onClick={() => setSelectedTab('orders')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    selectedTab === 'orders'
                      ? 'bg-[#58111A] text-white shadow-md'
                      : 'text-[#58111A]/70 hover:bg-[#58111A]/5'
                  }`}
                >
                  <Package className="h-4 w-4 text-[#D4AF37]" />
                  <span>Orders Pipeline</span>
                </button>
                <button
                  id="tab-menu-catalog"
                  onClick={() => setSelectedTab('menu')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    selectedTab === 'menu'
                      ? 'bg-[#58111A] text-white shadow-md'
                      : 'text-[#58111A]/70 hover:bg-[#58111A]/5'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
                  <span>Menu Manager</span>
                </button>
              </div>

              {selectedTab === 'orders' ? (
                <>
                  {/* Stat Overview Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-5 bg-white border border-[#58111A]/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#58111A]/45">Total Orders</span>
                    <p className="text-2xl font-black text-[#58111A]">{orders.length}</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-[#D4AF37] rounded-lg border border-amber-100">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#58111A]/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#58111A]/45">Pending Approvals</span>
                    <p className="text-2xl font-black text-amber-600">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-lg border border-amber-100 animate-pulse">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-5 bg-white border border-[#58111A]/10 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#58111A]/45">Confirmed Requests</span>
                    <p className="text-2xl font-black text-emerald-600">
                      {orders.filter(o => o.status === 'confirmed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#58111A]/10 rounded-xl flex flex-col justify-center divide-y divide-[#58111A]/10 gap-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#58111A]/45">Potential Income</span>
                      <p className="text-lg font-black text-[#58111A]">
                        Rs. {orders.reduce((acc, idCurr) => acc + idCurr.grandTotal, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-[#58111A]/5 text-[#58111A] rounded-lg border border-[#58111A]/10">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/70">Total Revenue</span>
                      <p className="text-lg font-black text-emerald-600">
                        Rs. {orders.filter(o => o.status === 'confirmed').reduce((acc, idCurr) => acc + idCurr.grandTotal, 0)}
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-[#58111A]/10 rounded-xl p-4 gap-4 shadow-xs">
                {/* Filtration tab buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'pending', 'confirmed', 'rejected'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        filterMode === mode
                          ? 'bg-[#58111A] text-white shadow-xs'
                          : 'bg-[#FAF6F0] text-[#58111A]/70 hover:bg-[#58111A]/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Settings & Reset Toggle bar */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                    }}
                    className={`inline-flex items-center space-x-1 px-4 py-2.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                      showSettings
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-amber-900 shadow-inner'
                        : 'bg-white border-[#58111A]/20 hover:bg-[#FAF6F0] text-[#58111A]'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>My Session Details</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Inline Gate Settings / Credentials Modifier Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#FAF6F0] border-2 border-[#D4AF37]/30 border-dashed rounded-xl p-5 sm:p-7 space-y-5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-[#D4AF37]" />
                        <h4 className="font-sans text-sm font-black text-[#58111A]">Admin Account Details</h4>
                      </div>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-[#58111A]/50 hover:text-[#58111A]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-[#58111A]/5">
                        <span className="font-bold text-[#5a111a]/60 uppercase">Signed In Email</span>
                        <span className="font-mono font-bold text-[#58111A]">{currentUser?.email}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-[#58111A]/5">
                        <span className="font-bold text-[#5a111a]/60 uppercase">Firebase UID Code</span>
                        <span className="font-mono text-[10px] text-[#58111A]/70">{currentUser?.uid}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Orders Dashboard Splitting View Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Orders Main list pipeline (7 Columns) */}
                <div className="lg:col-span-12 xl:col-span-8 bg-white border border-[#58111A]/10 rounded-2xl p-5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#58111A]/10 pb-4 mb-4">
                    <h3 className="font-sans text-md font-black text-[#58111A] flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#D4AF37]" />
                      <span>Firestore Orders Stream ({filteredOrders.length})</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleResetOrders}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border border-red-200"
                      >
                        Sweeps Remote Database
                      </button>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <p className="font-sans text-sm text-[#58111A]/60 font-semibold italic">
                        No custom ordered records found inside storage pipeline.
                      </p>
                      <p className="font-sans text-xs text-[#58111A]/40 max-w-sm mx-auto">
                        Inbound digital ordered requests placed by travelers or local residential lines onto our menu checkout form will emerge here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans text-sm">
                        <thead>
                          <tr className="border-b border-[#55111a]/10 text-[#5a111a]/55 font-bold uppercase tracking-wider text-[11px] bg-[#FAF6F0]/55">
                            <th className="py-3 px-3">Order ID</th>
                            <th className="py-3 px-3">Customer</th>
                            <th className="py-3 px-3">Date/Time</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3">Grand Total</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#58111A]/5">
                          {filteredOrders.map(ord => (
                            <tr 
                              key={ord.id} 
                              className={`hover:bg-[#FAF6F0]/30 transition-colors group ${
                                selectedOrder?.id === ord.id ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <td className="py-3.5 px-3 font-mono text-xs font-black text-amber-800">
                                {ord.id}
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-[#58111A]">
                                {ord.customerName}
                              </td>
                              <td className="py-3.5 px-3 text-xs text-[#58111A]/70">
                                {ord.orderDate}
                              </td>
                              <td className="py-3.5 px-3 text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wide text-[10px] ${
                                  ord.orderMethod === 'delivery' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : 'bg-teal-50 text-teal-700 border border-teal-100'
                                }`}>
                                  {ord.orderMethod === 'delivery' ? '🚗 Delivery' : '🥡 Takeaway'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-black text-[#58111A]">
                                Rs. {ord.grandTotal}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${
                                  ord.status === 'confirmed' 
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                    : ord.status === 'rejected' 
                                      ? 'bg-red-500' 
                                      : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                }`} />
                                <span className="text-xs uppercase font-extrabold tracking-wide">
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => setSelectedOrder(ord)}
                                    title="View entire billing items"
                                    className="p-1 px-2.5 bg-[#58111A]/5 hover:bg-[#58111A] text-[#58111A] hover:text-white rounded border border-[#58111A]/10 text-xs font-bold transition-all cursor-pointer"
                                  >
                                    View
                                  </button>
                                  
                                  {ord.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                                        title="Approve Order Request"
                                        className="p-1 bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-600 hover:text-white rounded transition-colors cursor-pointer"
                                      >
                                        <CheckSquare className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                                        title="Reject Order Request"
                                        className="p-1 bg-red-50 hover:bg-red-600 border border-red-200 text-red-600 hover:text-white rounded transition-colors cursor-pointer"
                                      >
                                        <XSquare className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Selected Order Details Panel (5 Columns) */}
                {selectedOrder && (
                  <div className="lg:col-span-12 xl:col-span-4 bg-white border border-[#58111A]/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
                    {/* Visual bar header depending on state status */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      selectedOrder.status === 'confirmed' 
                        ? 'bg-emerald-500' 
                        : selectedOrder.status === 'rejected' 
                          ? 'bg-red-500' 
                          : 'bg-amber-400'
                    }`} />

                    <div className="flex items-center justify-between border-b border-[#58111a]/10 pb-4 mb-4 mt-2">
                      <div className="space-y-0.5">
                        <span className="font-sans text-[10px] text-amber-800 font-bold uppercase tracking-widest">{selectedOrder.id}</span>
                        <h4 className="font-sans text-md font-black text-[#58111A]">{selectedOrder.customerName} Invoice</h4>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-1 hover:bg-[#FAF6F0] text-[#58111A]/50 hover:text-[#58111A] rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta info tags */}
                    <div className="space-y-2 text-xs font-sans text-[#58111A]/80 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[#58111A]/40 font-bold uppercase text-[10px]">Method</span>
                        <span className="font-black text-[#58111A] capitalize">{selectedOrder.orderMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#58111A]/40 font-bold uppercase text-[10px]">Date Placed</span>
                        <span className="font-medium text-[#58111A]">{selectedOrder.orderDate}</span>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-[#58111a]/5">
                        <span className="text-[#58111A]/40 font-bold uppercase text-[10px] block">Shipping Address</span>
                        <p className="text-[#58111A] font-medium leading-relaxed bg-[#FAF6F0] p-2.5 rounded border border-[#58111A]/10">
                          {selectedOrder.customerAddress}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Table list */}
                    <div className="space-y-3 font-sans mb-6">
                      <span className="text-[#58111A]/40 font-bold uppercase text-[10px] block border-b border-[#58111a]/5 pb-1">Items Included</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedOrder.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-xs">
                             <div className="space-y-0.5 max-w-[180px]">
                               <span className="font-bold text-[#58111a] block truncate">{item.name}</span>
                               <span className="text-[9px] uppercase font-semibold text-[#5a111a]/50">
                                 {item.portion.toUpperCase()} Size x {item.quantity}
                               </span>
                             </div>
                             <span className="font-bold text-[#58111A]">Rs. {item.total}</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Billing Summary calculation */}
                    <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#58111A]/10 text-xs font-sans text-[#58111A] space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="font-medium text-[#5a111a]/60">Items Subtotal</span>
                        <span className="font-bold">Rs. {selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[#5a111a]/60">Packaging Container</span>
                        <span className="font-bold">Rs. {selectedOrder.packagingFee}</span>
                      </div>
                      {selectedOrder.orderMethod === 'delivery' && (
                        <div className="flex justify-between">
                          <span className="font-medium text-[#5a111a]/60">Delivery Charges</span>
                          <span className="font-bold">Rs. {selectedOrder.deliveryFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-[#58111A] border-t border-[#58111a]/10 pt-2 text-[#58111A]">
                        <span>Grand Total</span>
                        <span>Rs. {selectedOrder.grandTotal}</span>
                      </div>
                    </div>

                    {/* Action Panel Inside Details Card */}
                    {selectedOrder.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}
                          className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'rejected')}
                          className="flex-1 py-3 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Reject Order
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-[#FAF6F0] rounded-lg border border-stone-200">
                        <span className="text-xs uppercase font-extrabold text-[#58111A]/60">
                          Invoice Processed:
                        </span>
                        <span className={`block text-xs font-black uppercase mt-1 ${
                          selectedOrder.status === 'confirmed' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    )}

                  </div>
                )}

              </div>
                </>
              ) : (
                /* Dynamic Menu Manager Panel */
                <div className="space-y-6 text-[#58111A] animate-fade-in font-sans">
                  
                  {/* Banners for success or errors */}
                  {menuError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-sans text-xs font-bold flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <span>{menuError}</span>
                    </div>
                  )}

                  {menuSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-sans text-xs font-bold flex items-center space-x-2 animate-fade-in">
                      <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span>{menuSuccess}</span>
                    </div>
                  )}

                  {/* Header Actions Card */}
                  <div className="bg-white border border-[#58111A]/10 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <h3 className="font-sans text-lg font-black text-[#58111A] flex items-center gap-2 justify-center md:justify-start">
                        <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                        <span>Dynamic Menu Catalog ({menuItems.length})</span>
                      </h3>
                      <p className="font-sans text-xs text-[#58111A]/60 font-medium">
                        Manage active prices, modify specialties, and add/remove traditional items in real-time.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        id="seed-standard-menu-btn"
                        onClick={handleSeedMenuItems}
                        className="px-4 py-2.5 bg-amber-50 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        ⚡ Seed default menu
                      </button>

                      <button
                        id="add-new-dish-btn"
                        onClick={handleOpenAddMenuItem}
                        className="px-5 py-2.5 bg-[#58111A] hover:bg-[#D4AF37] text-white hover:text-[#58111A] font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4 text-[#D4AF37]" />
                        <span>Add New Choice</span>
                      </button>
                    </div>
                  </div>

                  {/* Form toggle block (Add / Edit) */}
                  <AnimatePresence>
                    {showMenuForm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="bg-white border-2 border-[#D4AF37]/35 rounded-2xl p-5 sm:p-8 shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        
                        <div className="flex items-center justify-between border-b border-[#58111A]/10 pb-4 mb-6">
                          <h4 className="font-sans text-md font-extrabold text-[#58111A] flex items-center gap-2">
                            <Plus className="h-5 w-5 text-[#D4AF37]" />
                            <span>{isEditingItem ? `✏️ Modify Dynamic Price: ${isEditingItem.name}` : '➕ Add Custom Traditional Dish'}</span>
                          </h4>
                          <button
                            onClick={handleResetMenuForm}
                            className="p-1 hover:bg-[#FAF6F0] rounded text-[#58111A]/40 hover:text-[#58111A] cursor-pointer"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveMenuItem} className="space-y-5 font-sans">
                          {/* Row 1: ID (Read-only if editing) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1.5 flex flex-col justify-end">
                              <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block font-sans">
                                Unique ID / Route ID
                              </label>
                              <input
                                required
                                disabled={!!isEditingItem}
                                type="text"
                                placeholder="e.g. mi-19"
                                value={itemFormId}
                                onChange={(e) => setItemFormId(e.target.value)}
                                className="w-full bg-[#FAF6F0] disabled:opacity-60 border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37] font-mono"
                              />
                            </div>

                            <div className="space-y-1.5 flex flex-col justify-end font-sans">
                              <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block font-sans">
                                Name (English)
                              </label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. Special Beef Nehari"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37]"
                              />
                            </div>

                            <div className="space-y-1.5 flex flex-col justify-end font-sans">
                              <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block font-sans">
                                Name (Urdu calligraphy name)
                              </label>
                              <input
                                required
                                type="text"
                                placeholder="e.g. نہاری بیف اسپیشل"
                                value={itemNameUrdu}
                                onChange={(e) => setItemNameUrdu(e.target.value)}
                                className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37] text-right font-semibold"
                              />
                            </div>
                          </div>

                          {/* Row 2: Category, specialty, has half toggle */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center font-sans">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block font-sans">
                                Dinner Catalog Category
                              </label>
                              <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                              >
                                <option value="breakfast">Morning Nashta</option>
                                <option value="bread">Naan & Parathas</option>
                                <option value="dairy">Pure Dairy</option>
                                <option value="beverages">Beverages & Lassi</option>
                              </select>
                            </div>

                            {/* Portion check */}
                            <div className="flex items-center space-x-2 bg-[#FAF6F0] p-4 rounded-xl border border-[#58111A]/10 mt-5">
                              <input
                                type="checkbox"
                                id="hasHalfOption"
                                checked={hasHalfOption}
                                onChange={(e) => setHasHalfOption(e.target.checked)}
                                className="h-4 w-4 bg-[#FAF6F0] border-gray-300 rounded text-amber-600 focus:ring-[#58111A] cursor-pointer"
                              />
                              <label htmlFor="hasHalfOption" className="text-xs font-bold uppercase tracking-wider text-[#58111A]/80 cursor-pointer block select-none">
                                Has Portion Sizes? (Half/Full)
                              </label>
                            </div>

                            {/* Specialty check */}
                            <div className="flex items-center space-x-2 bg-[#FAF6F0] p-4 rounded-xl border border-[#58111A]/10 mt-5">
                              <input
                                type="checkbox"
                                id="isSpecialty"
                                checked={isSpecialty}
                                onChange={(e) => setIsSpecialty(e.target.checked)}
                                className="h-4 w-4 bg-[#FAF6F0] border-gray-300 rounded text-amber-600 focus:ring-[#58111A] cursor-pointer"
                              />
                              <label htmlFor="isSpecialty" className="text-xs font-bold uppercase tracking-wider text-[#58111A]/80 cursor-pointer block select-none">
                                House Specialty Badge?
                              </label>
                            </div>
                          </div>

                          {/* Row 3: Prices depending on portion toggles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                            <div className="space-y-1.5 font-sans">
                              <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block">
                                Full Plate / Standard Price (Rs.)
                              </label>
                              <input
                                required
                                type="number"
                                placeholder="e.g. 350"
                                value={priceFull}
                                onChange={(e) => setPriceFull(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37]"
                              />
                            </div>

                            {hasHalfOption && (
                              <div className="space-y-1.5 animate-fade-in text-[#58111A] font-sans">
                                <label className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                                  Half Plate Size Price (Rs.)
                                </label>
                                <input
                                  required={hasHalfOption}
                                  type="number"
                                  placeholder="e.g. 190"
                                  value={priceHalf}
                                  onChange={(e) => setPriceHalf(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full bg-[#FAF6F0] border-2 border-amber-300/30 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm focus:outline-none focus:border-[#D4AF37]"
                                />
                              </div>
                            )}
                          </div>

                          {/* Row 4: Description */}
                          <div className="space-y-1.5 font-sans">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#58111A]/60 block">
                              Detailed Description & Ingredients
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Describe taste profile, preparation desis, organic oil types, and general accompaniment suggestions..."
                              value={itemDescription}
                              onChange={(e) => setItemDescription(e.target.value)}
                              className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/30 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          {/* Bottom Action buttons */}
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={handleResetMenuForm}
                              className="px-5 py-3 border border-[#58111A]/20 hover:bg-[#FAF6F0] text-[#58111A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer font-sans"
                            >
                              Cancel / Reset
                            </button>

                            <button
                              type="submit"
                              className="px-8 py-3 bg-[#58111A] hover:bg-[#D4AF37] text-white hover:text-[#58111A] font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-md cursor-pointer font-sans"
                            >
                              {isEditingItem ? '💾 Update Dynamic Price' : '💾 Save New Dynamic Dish'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dynamic Items Cards list Grid */}
                  {menuItems.length === 0 ? (
                    <div className="bg-white border border-dashed border-[#58111A]/25 rounded-2xl p-12 text-center space-y-4">
                      <HelpCircle className="h-10 w-10 text-[#D4AF37]/45 mx-auto" />
                      <h4 className="font-sans text-md font-black text-[#58111A] uppercase tracking-wider">
                        Dynamic Dishes Catalog is Offline
                      </h4>
                      <p className="font-sans text-xs text-[#58111A]/65 max-w-sm mx-auto font-medium">
                        Your database catalog has no dynamic menu records active. Click "Seed default menu" above to pre-populate with the 18 classical specialties instantly!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-[#58111A]/10 rounded-2xl p-5 shadow-xs relative overflow-hidden group flex flex-col justify-between"
                        >
                          <div>
                            {/* Card badge line */}
                            <div className="flex items-center justify-between border-b border-[#58111A]/5 pb-3">
                              <div className="flex items-center space-x-2">
                                <span className="p-1 px-1.5 bg-[#58111A]/5 text-[#58111A] text-[9px] font-black rounded uppercase tracking-wider font-mono">
                                  {item.id}
                                </span>
                                <span className="text-[10px] uppercase font-black text-[#D4AF37] bg-[#58111A]/5 px-2.5 py-0.5 rounded border border-[#58111a]/5 font-sans">
                                  {item.category}
                                </span>
                              </div>

                              {item.isSpecialty && (
                                <span className="flex items-center space-x-1 text-[9px] font-extrabold uppercase bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                                  <Sparkles className="h-2.5 w-2.5 text-[#D4AF37]" />
                                  <span>House Specialty</span>
                                </span>
                              )}
                            </div>

                            {/* Item Title context */}
                            <div className="pt-3 flex justify-between items-start">
                              <div>
                                <h4 className="font-sans text-base font-extrabold text-[#58111A]">{item.name}</h4>
                                <span className="text-xs text-[#D4AF37] font-semibold font-sans block mt-0.5">{item.nameUrdu}</span>
                              </div>
                              <div className="text-right whitespace-nowrap">
                                {item.hasHalfOption ? (
                                  <div className="space-y-0.5 font-sans">
                                    <div className="text-xs font-sans"><span className="text-[10px] font-semibold uppercase text-gray-400 mr-1">Half:</span><span className="font-black text-[#58111A]">Rs. {item.priceHalf}</span></div>
                                    <div className="text-xs font-sans"><span className="text-[10px] font-semibold uppercase text-gray-400 mr-1">Full:</span><span className="font-black text-[#58111A]">Rs. {item.priceFull}</span></div>
                                  </div>
                                ) : (
                                  <span className="text-sm font-black bg-[#58111A]/5 text-[#58111A] px-2.5 py-1.5 rounded-lg block border border-[#58111A]/8 font-sans">
                                    Rs. {item.priceFull}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Item Description context */}
                            <p className="font-sans text-xs text-[#58111A]/70 leading-relaxed mt-3 pt-3 border-t border-[#58111A]/5">
                              {item.description}
                            </p>
                          </div>

                          {/* Card bottom buttons */}
                          <div className="mt-5 pt-3 border-t border-[#58111A]/5 flex items-center justify-between font-sans">
                            <span className="text-[9px] uppercase font-bold text-stone-400 font-mono">
                              Validated Dynamic Schema
                            </span>

                            <div className="flex items-center space-x-1.5">
                              <button
                                id={`edit-dish-${item.id}`}
                                onClick={() => handleOpenEditMenuItem(item)}
                                className="p-2 bg-stone-50 hover:bg-[#D4AF37]/15 text-[#58111A]/70 hover:text-[#58111A] border border-[#58111A]/10 hover:border-[#D4AF37] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer font-sans"
                                title="Edit item attributes or prices"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-[#D4AF37]" />
                                <span>Edit Price</span>
                              </button>

                              <button
                                id={`delete-dish-${item.id}`}
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                title="Permanent deletion"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
