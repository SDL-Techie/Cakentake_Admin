import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt, FaPlusCircle, FaList, FaBoxOpen, FaThList, 
  FaShoppingCart, FaUsers, FaSignOutAlt, FaBars, FaSearch, 
  FaUserTie, FaMapMarkerAlt, FaCoins , FaDatabase
} from 'react-icons/fa';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; 
import { toast, Toaster } from 'react-hot-toast'; 
import './AdminLayout.css';

// ─── CHILD COMPONENTS: SIDEBAR ───────────────────────────────────────
const AdminSidebar = ({ isOpen, onClose, onLogout, userRole }) => {
  const location = useLocation();

  const allMenuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin/dashboard' },
    { name: 'MenuManagement', icon: <FaUsers />, path: '/admin/menu' },
    { name: 'StaffManagement', icon: <FaUsers />, path: '/admin/staff' },
    { name: 'CustomerManagement', icon: <FaUsers />, path: '/admin/customer' },
    { name: 'AreaManagement', icon: <FaUsers />, path: '/admin/area' },
    { name: 'OrderManagement', icon: <FaUsers />, path: '/admin/orderpipeline' },
    { name: 'KitchenDashboard', icon: <FaUsers />, path: '/admin/kitchen' },
    { name: 'KitchenOrder', icon: <FaUsers />, path: '/admin/kitchen-order' },
    { name: 'KitchenInventory', icon: <FaUsers />, path: '/admin/kitcheninventory' },
    { name: 'SupplierManagement', icon: <FaUsers />, path: '/admin/supplier' },
    { name: 'SalesAgentDashboard', icon: <FaUsers />, path: '/admin/salesdash' },
    { name: 'SalesAgentCreateOrder', icon: <FaUsers />, path: '/admin/salescreateorder' },
    { name: 'SalesAgentOrder', icon: <FaUsers />, path: '/admin/salesorder' },
    { name: 'DeliveryAgentDashboard', icon: <FaDatabase />, path: '/admin/deliverydashboard' },
    { name: 'DeliveryAgentOrder', icon: <FaDatabase />, path: '/admin/deliveryorder' },
    { name: 'DriverDashboard', icon: <FaDatabase />, path: '/admin/driverdashboard' }, // Added to support driver view
    { name: 'DriverOrder', icon: <FaDatabase />, path: '/admin/driverorder' },
    { name: 'DriverSettlement', icon: <FaDatabase />, path: '/admin/driversettlement' },
    { name: 'Stock&Inventory', icon: <FaUsers />, path: '/admin/stock' },
    // { name: 'Finance', icon: <FaCoins />, path: '/admin/finance' },
    { name: 'Loyalty', icon: <FaCoins />, path: '/admin/loyality' },
    { name: 'Storage', icon: <FaDatabase />, path: '/admin/backup' },
  ];

  // Dynamic Filtering based on User Role
  const menuItems = allMenuItems.filter(item => {
    // If Admin/Owner ("ADMIN"), show everything
    if (userRole === 'ADMIN') {
      return true;
    }
    
    // Kitchen Staff: Show Kitchen Dashboard, Kitchen Order, and Stock & Inventory
    if (userRole === 'KITCHEN_STAFF') {
      return (
        item.name === 'KitchenDashboard' || 
        item.name === 'KitchenOrder' || 
        item.name === 'KitchenInventory'
      );
    }
    
    // Delivery Agent: Show Delivery Agent Dashboard and Delivery Agent Order
    if (userRole === 'DELIVERY_AGENT') {
      return (
        item.name === 'DeliveryAgentDashboard' || 
        item.name === 'DeliveryAgentOrder' 
        // item.name === 'DriverSettlement'
      );
    }
    
    // Driver: Show Driver Dashboard and Driver Order
    if (userRole === 'DRIVER') {
      return (
        item.name === 'DriverDashboard' || 
        item.name === 'DriverOrder'
      );
    }


    if (userRole === "SALES_AGENT") {
  return (
    item.name === "SalesAgentDashboard" ||
    item.name === "SalesAgentCreateOrder" ||
    item.name === "MenuManagement" ||
    item.name === "CustomerManagement" ||
    item.name === "SalesAgentOrder"
  );
}

    // Default fallback for any other unexpected role (or unauthenticated visitor)
    return false;
  });

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && window.innerWidth <= 2400 && (
          <motion.div 
            className="rasi-sidebar-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className={`rasi-admin-sidebar ${isOpen ? 'open' : 'closed'}`}
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
      >
        <div className="rasi-admin-sidebar-header">
          <div className="admin-logo-box">
             <h3>CakeNTake</h3>
          </div>
          <button className="rasi-sidebar-close-btn mobile-only" onClick={onClose}>
            <span className="rasi-x">X</span>
          </button>
        </div>

        <nav className="rasi-admin-menu-container">
          <ul className="rasi-admin-menu">
            {menuItems.map((item, index) => (
              <li key={index} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path} onClick={() => window.innerWidth <= 1024 && onClose()}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rasi-sidebar-footer">
          <button onClick={onLogout} className="rasi-logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ─── MAIN PARENT COMPONENT: ADMIN LAYOUT ──────────────────────────────
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the user role from localStorage on component mount
    const role = localStorage.getItem('role') || 'USER';
    setUserRole(role);

    const handleResize = () => {
      if (window.innerWidth > 1024) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully");
    setIsSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  // Helper function to render a user-friendly string for the header profile
  // const formatRoleDisplay = (role) => {
  //   if (role === 'ADMIN') return 'Super Admin';
  //   if (!role) return '';
  //   return role.replace(/_/g, ' ');
  // };


  const formatRoleDisplay = (role) => {
  if (role === "ADMIN") return "Super Admin";
  if (role === "SALES_AGENT") return "Sales Agent";
  if (!role) return "";
  return role.replace(/_/g, " ");
};

  return (
    <div className="rasi-admin-layout">
      <Toaster position="top-right" />
      
      {/* Passed userRole state down to AdminSidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
        userRole={userRole}
      />
      
      <main className={`rasi-admin-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <header className="rasi-admin-header">
          <div className="header-left-group">
            <button className="rasi-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
            </button>
            <div className="header-search-box desktop-only">
              <FaSearch />
              <input type="text" placeholder="Quick search..." />
            </div>
          </div>
          
          <div className="header-right-group">
            <div className="admin-profile-pill">
              <img src="https://cakentake.com/wp-content/uploads/2024/05/cakentake-logo.png" alt="Admin" />
              <div className="admin-info desktop-only">
                <span className="admin-name">CakeNTake</span>
                {/* Dynamically displaying user role in the header profile pill */}
                <span className="admin-role">{formatRoleDisplay(userRole)}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="rasi-admin-content-wrapper">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;