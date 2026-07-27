// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import './KitchenOrder.css';
// // import {
// //   getKitchenPending,
// //   getKitchenProcessing,
// //   getKitchenCompleted,
// // } from '../../services/kitchenService'; // Using your active service reference path

// // import { 
// //    getMyKitchenOrders,
// //    startPreparation,
// //   markOrderReady ,
// //    getOrderById} from "../../services/orderService"
// // /* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
// // const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
// //     <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
// //     <path d="M12 2v3" />
// //     <path d="M9 3v2" />
// //     <path d="M15 3v2" />
// //     <path d="M19 13V7a5 5 0 0 0-10 0v6" />
// //   </svg>
// // );

// // const IconClock = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
// // );

// // const IconCheckCircle = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
// // );

// // const IconEye = ({ size = 16 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
// // );

// // const KitchenOrder: React.FC = () => {
// //   // State variables
// //   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
// //   const [pendingOrders, setPendingOrders] = useState<any[]>([]);
// //   const [processingOrders, setProcessingOrders] = useState<any[]>([]);
// //   const [completedOrders, setCompletedOrders] = useState<any[]>([]);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);
  
// //   // Detailed Modal states
// //   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
// //   const [modalOpen, setModalOpen] = useState<boolean>(false);
// //   const [modalLoading, setModalLoading] = useState<boolean>(false);

// //   // Fetch all kitchen orders concurrently
// //   // const fetchAllKitchenData = useCallback(async () => {
// //   //   try {
// //   //     setLoading(true);
// //   //     const [pending, processing, completed] = await Promise.all([
// //   //       getKitchenPending().catch(() => []),
// //   //       getKitchenProcessing().catch(() => []),
// //   //       getKitchenCompleted().catch(() => [])
// //   //     ]);

// //   //     setPendingOrders(pending);
// //   //     setProcessingOrders(processing);
// //   //     setCompletedOrders(completed);
// //   //   } catch (err) {
// //   //     console.error("Failed to load kitchen dashboard datasets", err);
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // }, []);


// //   const fetchAllKitchenData = useCallback(async () => {
// //   try {
// //     setLoading(true);

// //     const orders = await getMyKitchenOrders();

// //     setPendingOrders(
// //       orders.filter((o: any) =>
// //         ["ASSIGNED_TO_KITCHEN"].includes(o.status)
// //       )
// //     );

// //     setProcessingOrders(
// //       orders.filter((o: any) =>
// //         ["PROCESSING", "PREPARING"].includes(o.status)
// //       )
// //     );

// //     setCompletedOrders(
// //       orders.filter((o: any) =>
// //         ["READY"].includes(o.status)
// //       )
// //     );
// //   } catch (err) {
// //     console.error(err);
// //   } finally {
// //     setLoading(false);
// //   }
// // }, []);


// //   useEffect(() => {
// //     fetchAllKitchenData();
// //   }, [fetchAllKitchenData]);

// //   // Derived array representing the combined "All" tab view
// //   const allOrders = useMemo(() => {
// //     return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
// //       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// //     );
// //   }, [pendingOrders, processingOrders, completedOrders]);

// //   // Determine current active dataset to render based on user tab selection
// //   const visibleOrders = useMemo(() => {
// //     switch (activeTab) {
// //       case 'pending': return pendingOrders;
// //       case 'processing': return processingOrders;
// //       case 'completed': return completedOrders;
// //       default: return allOrders;
// //     }
// //   }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

// //   // View full detailed manifest schema in descriptive modal sheet
// //   const handleViewOrderDetails = async (orderId: number) => {
// //     try {
// //       setModalLoading(true);
// //       setModalOpen(true);
// //       // Fetch details using your verified getOrder handler
// //       const data = await getOrderById(orderId);
// //       setSelectedOrder(data.order || data); 
// //     } catch (err) {
// //       console.error("Could not fetch full order record manifest", err);
// //     } finally {
// //       setModalLoading(false);
// //     }
// //   };

// //   // Triggers "start-preparation" endpoint context to Admin state machine
// //   const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     try {
// //       setActionLoading(orderId);
// //       await startPreparation(orderId);
// //       await fetchAllKitchenData(); // update lists concurrently
      
// //       // Sync internal modal layout if open
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         const updated = await getOrderById(orderId);
// //         setSelectedOrder(updated.order || updated);
// //       }
// //     } catch (err) {
// //       alert("Error alerting admin system of preparation startup routine");
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   // Triggers "ready" endpoint context to Admin/Delivery state machine
// //   const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     try {
// //       setActionLoading(orderId);
// //       await markOrderReady(orderId);
// //       await fetchAllKitchenData();
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         setModalOpen(false); // Clean overlay view close on production completion
// //       }
// //     } catch (err) {
// //       alert("Error setting order state registry to ready framework");
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   return (
// //     <div className="ko-workspace-container">
      
// //       {/* ─── Page Title Header ─── */}
// //       <div className="ko-page-header">
// //         <div className="ko-page-header-text">
// //           <h2>Kitchen Dashboard</h2>
// //           <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
// //         </div>
// //       </div>

// //       {/* ─── Counter Metrics Top Row Grid ─── */}
// //       <div className="ko-stats-grid">
// //         <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
// //           <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{allOrders.length}</h3>
// //             <p>Total Orders Today</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
// //           <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{pendingOrders.length}</h3>
// //             <p>Awaiting Prep</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
// //           <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{processingOrders.length}</h3>
// //             <p>Currently In Oven</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
// //           <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{completedOrders.length}</h3>
// //             <p>Ready / Delivered</p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ─── Filter Navigation Tab Row ─── */}
// //       <div className="ko-tabs-navigation-bar">
// //         <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
// //           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
// //         </button>
// //         <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
// //           Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
// //         </button>
// //         <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
// //           Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
// //         </button>
// //         <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
// //           Completed <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
// //         </button>
// //       </div>

// //       {/* ─── Active Queue Layout Loop ─── */}
// //       {loading ? (
// //         <div className="ko-workspace-center-loader">
// //           <div className="ko-spinner" />
// //           <p>Syncing hot items with kitchen lines...</p>
// //         </div>
// //       ) : visibleOrders.length === 0 ? (
// //         <div className="ko-empty-state">
// //           <IconChef size={50} />
// //           <h3>No Orders Found</h3>
// //           <p>There are no items currently categorized under the "{activeTab}" status loop.</p>
// //         </div>
// //       ) : (
// //         <div className="ko-orders-grid">
// //           {visibleOrders.map((order) => {
// //             const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
// //             const currentStatus = (order.status || 'PENDING').toUpperCase();

// //             return (
// //               <div key={order.id} className="ko-order-card" onClick={() => handleViewOrderDetails(order.id)}>
// //                 <div className="ko-card-upper-row">
// //                   <div>
// //                     <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
// //                     <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
// //                   </div>
// //                   <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
// //                     {currentStatus}
// //                   </span>
// //                 </div>

// //                 {/* Products Manifest Block */}
// //                 <div className="ko-card-items-preview">
// //                   {order.items?.map((item: any, idx: number) => (
// //                     <div key={item.id || idx} className="ko-preview-item-line">
// //                       <span className="ko-item-quantity">×{item.quantity}</span>
// //                       <span className="ko-item-name">{item.product?.name || 'Assorted Item'}</span>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 {/* Interactive Workflow Execution Footer Button Row */}
// //                 <div className="ko-card-action-bar">
// //                   <button className="ko-action-view-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }}>
// //                     <IconEye size={14} /> View Items
// //                   </button>
                  
// //                   {/* Start Preparation Trigger for Incoming/Confirmed items */}
// //                   {/* {(currentStatus === 'PENDING' || currentStatus === 'CONFIRMED') && (
// //                     <button 
// //                       className="ko-action-primary-btn bg-prep" 
// //                       disabled={actionLoading === order.id}
// //                       onClick={(e) => handleStartPreparation(order.id, e)}
// //                     >
// //                       {actionLoading === order.id ? 'Starting...' : 'Start Preparation'}
// //                     </button>
// //                   )} */}

// //                   {currentStatus === "ASSIGNED_TO_KITCHEN" && (
// //   <button
// //     className="ko-action-primary-btn bg-prep"
// //     disabled={actionLoading === order.id}
// //     onClick={(e) => handleStartPreparation(order.id, e)}
// //   >
// //     {actionLoading === order.id
// //       ? "Starting..."
// //       : "Start Preparation"}
// //   </button>
// // )}

// //                   {/* Mark Ready Production Trigger for items in active processing state */}
// //                   {/* {(currentStatus === 'PROCESSING' || currentStatus === 'PREPARATION') && (
// //                     <button 
// //                       className="ko-action-primary-btn bg-complete" 
// //                       disabled={actionLoading === order.id}
// //                       onClick={(e) => handleMarkReady(order.id, e)}
// //                     >
// //                       {actionLoading === order.id ? 'Completing...' : 'Mark Ready'}
// //                     </button>
// //                   )} */}

// //   {(currentStatus === "PROCESSING" || currentStatus === "PREPARING") && (
// //   <button
// //     className="ko-action-primary-btn bg-complete"
// //     disabled={actionLoading === order.id}
// //     onClick={(e) => handleMarkReady(order.id, e)}
// //   >
// //     {actionLoading === order.id
// //       ? "Completing..."
// //       : "Mark Ready"}
// //   </button>
// // )}

// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
// //       {modalOpen && (
// //         <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
// //           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
// //             <div className="ko-modal-header">
// //               <h3>Order Detail Structure</h3>
// //               <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
// //             </div>

// //             <div className="ko-modal-body-area">
// //               {modalLoading || !selectedOrder ? (
// //                 <div className="ko-modal-spinner-wrapper">
// //                   <div className="ko-spinner" />
// //                   <p>Pulling full order manifest details...</p>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="ko-modal-meta-banner">
// //                     <div>
// //                       <h4>ID: {selectedOrder.order_number || selectedOrder.id}</h4>
// //                       <p>Type: <strong>{selectedOrder.order_type?.toUpperCase() || 'STANDARD'}</strong></p>
// //                     </div>
// //                     <span className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span>
// //                   </div>

// //                   <div className="ko-modal-section-box">
// //                     <h5>Line Kitchen Production Items</h5>
// //                     <div className="ko-modal-items-table">
// //                       {selectedOrder.items?.map((item: any) => (
// //                         <div key={item.id} className="ko-modal-item-row">
// //                           <div className="ko-modal-item-left">
// //                             <span className="ko-modal-qty-bubble">×{item.quantity}</span>
// //                             <div>
// //                               <p className="item-main-title">{item.product?.name}</p>
// //                               <p className="item-sub-desc">{item.product?.description || 'No alternative production specs descriptive tags.'}</p>
// //                             </div>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   {selectedOrder.delivery_notes && (
// //                     <div className="ko-modal-section-box notes-box">
// //                       <h5>Special Kitchen Notes / Instructions</h5>
// //                       <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
// //                     </div>
// //                   )}

// //                   <div className="ko-modal-action-footer">
// //                     <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
// //                     {/* {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') &&  */}
// //                     {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && 
// //                     (
// //                       <button className="ko-action-primary-btn bg-prep" onClick={(e) => handleStartPreparation(selectedOrder.id, e)}>
// //                         Start Preparation
// //                       </button>
// //                     )}
// //                    {(selectedOrder.status === "PROCESSING" ||
// //   selectedOrder.status === "PREPARING") && (
// //                       <button className="ko-action-primary-btn bg-complete" onClick={(e) => handleMarkReady(selectedOrder.id, e)}>
// //                         Mark Ready
// //                       </button>
// //                     )}
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //     </div>
// //   );
// // };

// // export default KitchenOrder;


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import './KitchenOrder.css';
// import {
//   getKitchenPending,
//   getKitchenProcessing,
//   getKitchenCompleted,
// } from '../../services/kitchenService'; // Using your active service reference path

// import {
//    getMyKitchenOrders,
//    startPreparation,
//   markOrderReady ,
//    getOrderById} from "../../services/orderService"
// /* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
// const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
//     <path d="M12 2v3" />
//     <path d="M9 3v2" />
//     <path d="M15 3v2" />
//     <path d="M19 13V7a5 5 0 0 0-10 0v6" />
//   </svg>
// );

// const IconClock = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
// );

// const IconCheckCircle = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
// );

// const IconEye = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
// );

// const IconImageFallback = ({ size = 22 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="3" width="18" height="18" rx="2" />
//     <circle cx="8.5" cy="8.5" r="1.5" />
//     <path d="M21 15l-5-5L5 21" />
//   </svg>
// );

// const IconCalendar = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="4" width="18" height="18" rx="2" />
//     <line x1="16" y1="2" x2="16" y2="6" />
//     <line x1="8" y1="2" x2="8" y2="6" />
//     <line x1="3" y1="10" x2="21" y2="10" />
//   </svg>
// );

// /* ─── Helpers ────────────────────────────────────────────────────────────────── */

// // custom_json on an order item can carry any subset of these — everything is
// // read defensively since different product types populate different fields.
// interface ItemCustomJson {
//   variant?: string;
//   flavour?: string;
//   flavor?: string;
//   shape?: string;
//   add_ons?: string[];
//   addons?: string[];
//   add_on_total?: number;
//   notes?: string;
// }

// const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// const getFlavour = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// };

// const getVariant = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.variant || item?.variant || null;
// };

// const getShape = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.shape || item?.shape || null;
// };

// const getAddOns = (item: any): string[] => {
//   const cj = getCustomJson(item);
//   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
//   return Array.isArray(list) ? list : [];
// };

// const getItemNotes = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.notes || item?.notes || null;
// };

// const fmtMoney = (n: number | undefined) => `₹${Number(n || 0).toFixed(0)}`;

// const fmtDateTime = (d?: string) =>
//   d ? new Date(d).toLocaleString('en-IN', {
//     day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
//   }) : null;

// const fmtDate = (d?: string) =>
//   d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

// // Order-level expected delivery info can arrive under several possible keys
// // depending on how the order was created — check them all before falling back.
// const getExpectedDelivery = (order: any): { label: string } | null => {
//   if (!order) return null;

//   const explicit =
//     order.expected_delivery_at ||
//     order.expected_delivery_time ||
//     order.estimated_delivery_at;
//   if (explicit) return { label: fmtDateTime(explicit) as string };

//   const date = order.delivery_date;
//   const slot = order.delivery_time_slot;
//   if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
//   if (date) return { label: fmtDate(date) as string };
//   if (slot) return { label: slot };

//   return null;
// };

// const KitchenOrder: React.FC = () => {
//   // State variables
//   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
//   const [pendingOrders, setPendingOrders] = useState<any[]>([]);
//   const [processingOrders, setProcessingOrders] = useState<any[]>([]);
//   const [completedOrders, setCompletedOrders] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);

//   // Detailed Modal states
//   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [modalLoading, setModalLoading] = useState<boolean>(false);

//   const fetchAllKitchenData = useCallback(async () => {
//   try {
//     setLoading(true);

//     const orders = await getMyKitchenOrders();

//     setPendingOrders(
//       orders.filter((o: any) =>
//         ["ASSIGNED_TO_KITCHEN"].includes(o.status)
//       )
//     );

//     setProcessingOrders(
//       orders.filter((o: any) =>
//         ["PROCESSING", "PREPARING"].includes(o.status)
//       )
//     );

//     setCompletedOrders(
//       orders.filter((o: any) =>
//         ["READY"].includes(o.status)
//       )
//     );
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
// }, []);


//   useEffect(() => {
//     fetchAllKitchenData();
//   }, [fetchAllKitchenData]);

//   // Derived array representing the combined "All" tab view
//   const allOrders = useMemo(() => {
//     return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
//       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );
//   }, [pendingOrders, processingOrders, completedOrders]);

//   // Determine current active dataset to render based on user tab selection
//   const visibleOrders = useMemo(() => {
//     switch (activeTab) {
//       case 'pending': return pendingOrders;
//       case 'processing': return processingOrders;
//       case 'completed': return completedOrders;
//       default: return allOrders;
//     }
//   }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

//   // View full detailed manifest schema in descriptive modal sheet
//   const handleViewOrderDetails = async (orderId: number) => {
//     try {
//       setModalLoading(true);
//       setModalOpen(true);
//       // Fetch details using your verified getOrder handler
//       const data = await getOrderById(orderId);
//       setSelectedOrder(data.order || data);
//     } catch (err) {
//       console.error("Could not fetch full order record manifest", err);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Triggers "start-preparation" endpoint context to Admin state machine
//   const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       setActionLoading(orderId);
//       await startPreparation(orderId);
//       await fetchAllKitchenData(); // update lists concurrently

//       // Sync internal modal layout if open
//       if (modalOpen && selectedOrder?.id === orderId) {
//         const updated = await getOrderById(orderId);
//         setSelectedOrder(updated.order || updated);
//       }
//     } catch (err) {
//       alert("Error alerting admin system of preparation startup routine");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Triggers "ready" endpoint context to Admin/Delivery state machine
//   const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     try {
//       setActionLoading(orderId);
//       await markOrderReady(orderId);
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         setModalOpen(false); // Clean overlay view close on production completion
//       }
//     } catch (err) {
//       alert("Error setting order state registry to ready framework");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   return (
//     <div className="ko-workspace-container">

//       {/* ─── Page Title Header ─── */}
//       <div className="ko-page-header">
//         <div className="ko-page-header-text">
//           <h2>Kitchen Dashboard</h2>
//           <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
//         </div>
//       </div>

//       {/* ─── Counter Metrics Top Row Grid ─── */}
//       <div className="ko-stats-grid">
//         <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
//           <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{allOrders.length}</h3>
//             <p>Total Orders Today</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
//           <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{pendingOrders.length}</h3>
//             <p>Awaiting Prep</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
//           <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{processingOrders.length}</h3>
//             <p>Currently In Oven</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
//           <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{completedOrders.length}</h3>
//             <p>Ready / Delivered</p>
//           </div>
//         </div>
//       </div>

//       {/* ─── Filter Navigation Tab Row ─── */}
//       <div className="ko-tabs-navigation-bar">
//         <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
//           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
//           Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
//           Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
//           Completed <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
//         </button>
//       </div>

//       {/* ─── Active Queue Layout Loop ─── */}
//       {loading ? (
//         <div className="ko-workspace-center-loader">
//           <div className="ko-spinner" />
//           <p>Syncing hot items with kitchen lines...</p>
//         </div>
//       ) : visibleOrders.length === 0 ? (
//         <div className="ko-empty-state">
//           <IconChef size={50} />
//           <h3>No Orders Found</h3>
//           <p>There are no items currently categorized under the "{activeTab}" status loop.</p>
//         </div>
//       ) : (
//         <div className="ko-orders-grid">
//           {visibleOrders.map((order) => {
//             const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//             const currentStatus = (order.status || 'PENDING').toUpperCase();

//             return (
//               <div key={order.id} className="ko-order-card" onClick={() => handleViewOrderDetails(order.id)}>
//                 <div className="ko-card-upper-row">
//                   <div>
//                     <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
//                     <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
//                   </div>
//                   <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
//                     {currentStatus}
//                   </span>
//                 </div>

//                 {/* Products Manifest Block */}
//                 <div className="ko-card-items-preview">
//                   {order.items?.map((item: any, idx: number) => (
//                     <div key={item.id || idx} className="ko-preview-item-line">
//                       <span className="ko-item-quantity">×{item.quantity}</span>
//                       <span className="ko-item-name">{item.product?.name || 'Assorted Item'}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Interactive Workflow Execution Footer Button Row */}
//                 <div className="ko-card-action-bar">
//                   <button className="ko-action-view-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }}>
//                     <IconEye size={14} /> View Items
//                   </button>

//                   {currentStatus === "ASSIGNED_TO_KITCHEN" && (
//                     <button
//                       className="ko-action-primary-btn bg-prep"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleStartPreparation(order.id, e)}
//                     >
//                       {actionLoading === order.id
//                         ? "Starting..."
//                         : "Start Preparation"}
//                     </button>
//                   )}

//                   {(currentStatus === "PROCESSING" || currentStatus === "PREPARING") && (
//                     <button
//                       className="ko-action-primary-btn bg-complete"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleMarkReady(order.id, e)}
//                     >
//                       {actionLoading === order.id
//                         ? "Completing..."
//                         : "Mark Ready"}
//                     </button>
//                   )}

//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
//       {modalOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
//           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>Order Detail Structure</h3>
//               <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
//             </div>

//             <div className="ko-modal-body-area">
//               {modalLoading || !selectedOrder ? (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Pulling full order manifest details...</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="ko-modal-meta-banner">
//                     <div>
//                       <h4>ID: {selectedOrder.order_number || selectedOrder.id}</h4>
//                       <p>Type: <strong>{selectedOrder.order_type?.toUpperCase() || 'STANDARD'}</strong></p>
//                     </div>
//                     <span className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span>
//                   </div>

//                   {/* Expected delivery block */}
//                   {(() => {
//                     const expected = getExpectedDelivery(selectedOrder);
//                     return (
//                       <div className="ko-modal-delivery-info">
//                         <IconCalendar size={16} />
//                         <span className="ko-delivery-label">Expected Delivery:</span>
//                         <span className="ko-delivery-value">
//                           {expected ? expected.label : 'Not specified'}
//                         </span>
//                       </div>
//                     );
//                   })()}

//                   <div className="ko-modal-section-box">
//                     <h5>Line Kitchen Production Items</h5>
//                     <div className="ko-modal-items-table">
//                       {selectedOrder.items?.map((item: any) => {
//                         const flavour = getFlavour(item);
//                         const variant = getVariant(item);
//                         const shape = getShape(item);
//                         const addOns = getAddOns(item);
//                         const itemNotes = getItemNotes(item);
//                         const lineTotal = item.line_total ?? (item.price * item.quantity);

//                         return (
//                           <div key={item.id} className="ko-modal-item-row ko-modal-item-row-detailed">
//                             <div className="ko-modal-item-image-wrap">
//                               {item.product?.image_url ? (
//                                 <img
//                                   className="ko-modal-item-image"
//                                   src={item.product.image_url}
//                                   alt={item.product?.name || 'Product'}
//                                 />
//                               ) : (
//                                 <div className="ko-modal-item-image-fallback">
//                                   <IconImageFallback size={22} />
//                                 </div>
//                               )}
//                             </div>

//                             <div className="ko-modal-item-left">
//                               <div className="ko-modal-item-title-row">
//                                 <span className="ko-modal-qty-bubble">×{item.quantity}</span>
//                                 <p className="item-main-title">{item.product?.name || 'Item'}</p>
//                               </div>

//                               {item.product?.description && (
//                                 <p className="item-sub-desc">{item.product.description}</p>
//                               )}

//                               {/* Variant / flavour / shape chips */}
//                               {(flavour || variant || shape) && (
//                                 <div className="ko-item-meta-chips">
//                                   {flavour && (
//                                     <span className="ko-item-meta-chip chip-flavour">Flavour: {flavour}</span>
//                                   )}
//                                   {variant && (
//                                     <span className="ko-item-meta-chip chip-variant">Variant: {variant}</span>
//                                   )}
//                                   {shape && (
//                                     <span className="ko-item-meta-chip chip-shape">Shape: {shape}</span>
//                                   )}
//                                 </div>
//                               )}

//                               {/* Add-ons */}
//                               {addOns.length > 0 && (
//                                 <div className="ko-modal-item-addons">
//                                   <span className="ko-addons-label">Add-ons:</span>
//                                   <div className="ko-item-meta-chips">
//                                     {addOns.map((addOn, i) => (
//                                       <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               {itemNotes && (
//                                 <p className="item-sub-desc ko-item-custom-note">Note: "{itemNotes}"</p>
//                               )}

//                               <div className="ko-modal-item-price-row">
//                                 <span className="ko-item-unit-price">{fmtMoney(item.price)} each</span>
//                                 <span className="ko-item-line-total">{fmtMoney(lineTotal)}</span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {selectedOrder.delivery_notes && (
//                     <div className="ko-modal-section-box notes-box">
//                       <h5>Special Kitchen Notes / Instructions</h5>
//                       <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
//                     </div>
//                   )}

//                   <div className="ko-modal-action-footer">
//                     <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
//                     {selectedOrder.status === "ASSIGNED_TO_KITCHEN" &&
//                     (
//                       <button className="ko-action-primary-btn bg-prep" onClick={(e) => handleStartPreparation(selectedOrder.id, e)}>
//                         Start Preparation
//                       </button>
//                     )}
//                    {(selectedOrder.status === "PROCESSING" ||
//   selectedOrder.status === "PREPARING") && (
//                       <button className="ko-action-primary-btn bg-complete" onClick={(e) => handleMarkReady(selectedOrder.id, e)}>
//                         Mark Ready
//                       </button>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default KitchenOrder;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './KitchenOrder.css';
import {
  getKitchenPending,
  getKitchenProcessing,
  getKitchenCompleted,
  getKitchenOrderDetails,
  startProcessing,
  completeKitchenOrder,
  filterMyCompletedOrders,
  KitchenOrder as KitchenOrderRecord,
} from '../../services/kitchenService';

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
    <path d="M12 2v3" />
    <path d="M9 3v2" />
    <path d="M15 3v2" />
    <path d="M19 13V7a5 5 0 0 0-10 0v6" />
  </svg>
);

const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconCheckCircle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

const IconEye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const IconImageFallback = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

interface ItemCustomJson {
  variant?: string;
  flavour?: string;
  flavor?: string;
  shape?: string;
  add_ons?: string[];
  addons?: string[];
  add_on_total?: number;
  notes?: string;
}

const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

const getFlavour = (item: any) => {
  const cj = getCustomJson(item);
  return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
};

const getVariant = (item: any) => {
  const cj = getCustomJson(item);
  return cj.variant || item?.variant || null;
};

const getShape = (item: any) => {
  const cj = getCustomJson(item);
  return cj.shape || item?.shape || null;
};

const getAddOns = (item: any): string[] => {
  const cj = getCustomJson(item);
  const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
  return Array.isArray(list) ? list : [];
};

const getItemNotes = (item: any) => {
  const cj = getCustomJson(item);
  return cj.notes || item?.notes || null;
};

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

const fmtDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : null;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const getExpectedDelivery = (order: any): { label: string } | null => {
  if (!order) return null;

  const explicit =
    order.expected_delivery_at ||
    order.expected_delivery_time ||
    order.estimated_delivery_at;
  if (explicit) return { label: fmtDateTime(explicit) as string };

  const date = order.delivery_date;
  const slot = order.delivery_time_slot;
  if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
  if (date) return { label: fmtDate(date) as string };
  if (slot) return { label: slot };

  return null;
};

// The logged-in kitchen staff member's id, used purely to scope the
// Completed tab to "orders I personally started & finished".
const getCurrentUserId = (): number | null => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    return stored?.id ?? null;
  } catch {
    return null;
  }
};

const KitchenOrder: React.FC = () => {
  const currentUserId = useMemo(getCurrentUserId, []);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
  const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Detailed Modal states
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrderRecord | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const fetchAllKitchenData = useCallback(async () => {
    try {
      setLoading(true);

      const [pending, processing, completedAll] = await Promise.all([
        getKitchenPending(),
        getKitchenProcessing(),
        getKitchenCompleted(),
      ]);

      setPendingOrders(pending);
      setProcessingOrders(processing);
      // Completed tab is scoped to "orders I started" — /kitchen/orders/completed
      // returns every kitchen staff member's completed orders, so we filter
      // it down client-side (see filterMyCompletedOrders in kitchenService).
      setCompletedOrders(filterMyCompletedOrders(completedAll, currentUserId));
    } catch (err) {
      console.error('Failed to load kitchen dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAllKitchenData();
  }, [fetchAllKitchenData]);

  const allOrders = useMemo(() => {
    return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [pendingOrders, processingOrders, completedOrders]);

  const visibleOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'processing': return processingOrders;
      case 'completed': return completedOrders;
      default: return allOrders;
    }
  }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      const data = await getKitchenOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error("Could not fetch full order record manifest", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await startProcessing(orderId);
      await fetchAllKitchenData();

      if (modalOpen && selectedOrder?.id === orderId) {
        const updated = await getKitchenOrderDetails(orderId);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Couldn't start preparation — someone may have already claimed this order.";
      setActionError(msg);
      // Refresh so the button/status reflects reality if someone else beat us to it.
      await fetchAllKitchenData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await completeKitchenOrder(orderId);
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        setModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ko-workspace-container">

      {/* ─── Page Title Header ─── */}
      <div className="ko-page-header">
        <div className="ko-page-header-text">
          <h2>Kitchen Dashboard</h2>
          <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
        </div>
      </div>

      {actionError && (
        <div className="ko-action-error-banner">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}

      {/* ─── Counter Metrics Top Row Grid ─── */}
      <div className="ko-stats-grid">
        <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
          <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{allOrders.length}</h3>
            <p>Total Orders Today</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
          <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
          <div className="ko-stat-details">
            <h3>{pendingOrders.length}</h3>
            <p>Awaiting Prep</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
          <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{processingOrders.length}</h3>
            <p>Currently In Oven</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
          <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
          <div className="ko-stat-details">
            <h3>{completedOrders.length}</h3>
            <p>Completed by Me</p>
          </div>
        </div>
      </div>

      {/* ─── Filter Navigation Tab Row ─── */}
      <div className="ko-tabs-navigation-bar">
        <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
          Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
        </button>
      </div>

      {/* ─── Active Queue Layout Loop ─── */}
      {loading ? (
        <div className="ko-workspace-center-loader">
          <div className="ko-spinner" />
          <p>Syncing hot items with kitchen lines...</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="ko-empty-state">
          <IconChef size={50} />
          <h3>No Orders Found</h3>
          <p>
            {activeTab === 'completed'
              ? "You haven't completed any orders yet."
              : `There are no items currently categorized under the "${activeTab}" status loop.`}
          </p>
        </div>
      ) : (
        <div className="ko-orders-grid">
          {visibleOrders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const currentStatus = (order.status || 'PENDING').toUpperCase();
            const isMine = order.preparation_started_by === currentUserId;

            return (
              <div key={order.id} className="ko-order-card" onClick={() => handleViewOrderDetails(order.id)}>
                <div className="ko-card-upper-row">
                  <div>
                    <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
                    <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
                  </div>
                  <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
                    {currentStatus}
                  </span>
                </div>

                {/* {currentStatus === 'PREPARING' && (
                  <span className={`ko-owner-tag ${isMine ? 'mine' : ''}`}>
                    {isMine ? 'You are preparing this' : 'Being prepared by another staff member'}
                  </span>
                )} */}


                {currentStatus === "PREPARING" && (
  <div className="ko-owner-tag">
    <strong>Kitchen Staff:</strong>{" "}
    {order.preparation_started_by?.name || "Unknown"}
    {isMine && " (You)"}
  </div>
)}

                {/* Products Manifest Block */}
                <div className="ko-card-items-preview">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="ko-preview-item-line">
                      <span className="ko-item-quantity">×{item.quantity}</span>
                      <span className="ko-item-name">{item.product?.name || 'Assorted Item'}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Workflow Execution Footer Button Row */}
                <div className="ko-card-action-bar">
                  <button className="ko-action-view-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }}>
                    <IconEye size={14} /> View Items
                  </button>

                  {currentStatus === "ASSIGNED_TO_KITCHEN" && (
                    <button
                      className="ko-action-primary-btn bg-prep"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleStartPreparation(order.id, e)}
                    >
                      {actionLoading === order.id ? "Starting..." : "Start Preparation"}
                    </button>
                  )}

                  {currentStatus === "PREPARING" && (
                    <button
                      className="ko-action-primary-btn bg-complete"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleMarkReady(order.id, e)}
                    >
                      {actionLoading === order.id ? "Completing..." : "Mark Ready"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
      {modalOpen && (
        <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>Order Detail Structure</h3>
              <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="ko-modal-body-area">
              {modalLoading || !selectedOrder ? (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Pulling full order manifest details...</p>
                </div>
              ) : (
                <>
                  <div className="ko-modal-meta-banner">
                    <div>
                      <h4>ID: {selectedOrder.order_number || selectedOrder.id}</h4>
                      <p>Type: <strong>{selectedOrder.order_type?.toUpperCase() || 'STANDARD'}</strong></p>
                    </div>
                    <span className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</span>
                  </div>

                  {selectedOrder.preparation_started_at && (
                    <div className="ko-modal-delivery-info">
                      <IconClock size={16} />
                      <span className="ko-delivery-label">Preparation started:</span>
                      <span className="ko-delivery-value">
                        {fmtDateTime(selectedOrder.preparation_started_at)}
                        {selectedOrder.preparation_started_by === currentUserId ? ' · by you' : ''}
                      </span>
                    </div>
                  )}

                  {/* Expected delivery block */}
                  {(() => {
                    const expected = getExpectedDelivery(selectedOrder);
                    return (
                      <div className="ko-modal-delivery-info">
                        <IconCalendar size={16} />
                        <span className="ko-delivery-label">Expected Delivery:</span>
                        <span className="ko-delivery-value">
                          {expected ? expected.label : 'Not specified'}
                        </span>
                      </div>
                    );
                  })()}

                  {/* <div className="ko-modal-section-box">
                    <h5>Line Kitchen Production Items</h5>
                    <div className="ko-modal-items-table">
                      {selectedOrder.items?.map((item: any) => {
                        const flavour = getFlavour(item);
                        const variant = getVariant(item);
                        const shape = getShape(item);
                        const addOns = getAddOns(item);
                        const itemNotes = getItemNotes(item);
                        const lineTotal = item.line_total ?? (item.price * item.quantity);

                        return (
                          <div key={item.id} className="ko-modal-item-row ko-modal-item-row-detailed">
                            <div className="ko-modal-item-image-wrap">
                              {item.product?.image_url ? (
                                <img
                                  className="ko-modal-item-image"
                                  src={item.product.image_url}
                                  alt={item.product?.name || 'Product'}
                                />
                              ) : (
                                <div className="ko-modal-item-image-fallback">
                                  <IconImageFallback size={22} />
                                </div>
                              )}
                            </div>

                            <div className="ko-modal-item-left">
                              <div className="ko-modal-item-title-row">
                                <span className="ko-modal-qty-bubble">×{item.quantity}</span>
                                <p className="item-main-title">{item.product?.name || 'Item'}</p>
                              </div>

                              {item.product?.description && (
                                <p className="item-sub-desc">{item.product.description}</p>
                              )}

                              {(flavour || variant || shape) && (
                                <div className="ko-item-meta-chips">
                                  {flavour && (
                                    <span className="ko-item-meta-chip chip-flavour">Flavour: {flavour}</span>
                                  )}
                                  {variant && (
                                    <span className="ko-item-meta-chip chip-variant">Variant: {variant}</span>
                                  )}
                                  {shape && (
                                    <span className="ko-item-meta-chip chip-shape">Shape: {shape}</span>
                                  )}
                                </div>
                              )}

                              {addOns.length > 0 && (
                                <div className="ko-modal-item-addons">
                                  <span className="ko-addons-label">Add-ons:</span>
                                  <div className="ko-item-meta-chips">
                                    {addOns.map((addOn, i) => (
                                      <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {itemNotes && (
                                <p className="item-sub-desc ko-item-custom-note">Note: "{itemNotes}"</p>
                              )}

                              <div className="ko-modal-item-price-row">
                                <span className="ko-item-unit-price">{fmtMoney(item.price, selectedOrder?.currency)} each</span>
                                <span className="ko-item-line-total">{fmtMoney(lineTotal, selectedOrder?.currency)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div> */}


                  <div className="ko-modal-section-box">
  <h5 className="ko-section-title">Line Kitchen Production Items</h5>
  
  <div className="ko-modal-items-table">
    {selectedOrder.items?.map((item: any) => {
      const flavour = getFlavour(item);
      const variant = getVariant(item);
      const shape = getShape(item);
      const addOns = getAddOns(item);
      const itemNotes = getItemNotes(item);
      const lineTotal = item.line_total ?? (item.price * item.quantity);

      return (
        <div key={item.id} className="ko-modal-item-row-detailed">
          {/* Left: Product Image Box */}
          <div className="ko-modal-item-image-wrap">
            {item.product?.image_url ? (
              <img
                className="ko-modal-item-image"
                src={item.product.image_url}
                alt={item.product?.name || 'Product'}
              />
            ) : (
              <div className="ko-modal-item-image-fallback">
                <IconImageFallback size={20} />
              </div>
            )}
          </div>

          {/* Right: Detailed Content Area */}
          <div className="ko-modal-item-body">
            
            {/* Header Row: Qty Badge & Title */}
            <div className="ko-modal-item-header">
              <span className="ko-modal-qty-bubble">
                {item.quantity}x
              </span>
              <p className="item-main-title">{item.product?.name || 'Item'}</p>
            </div>

            {/* Description */}
            {item.product?.description && (
              <p className="item-sub-desc">{item.product.description}</p>
            )}

            {/* Specifications (Flavour, Variant, Shape) */}
            {(flavour || variant || shape) && (
              <div className="ko-item-meta-chips">
                {flavour && (
                  <span className="ko-item-meta-chip chip-flavour">
                    Flavour: <strong>{flavour}</strong>
                  </span>
                )}
                {variant && (
                  <span className="ko-item-meta-chip chip-variant">
                    Variant: <strong>{variant}</strong>
                  </span>
                )}
                {shape && (
                  <span className="ko-item-meta-chip chip-shape">
                    Shape: <strong>{shape}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Add-ons */}
            {addOns.length > 0 && (
              <div className="ko-modal-item-addons">
                <span className="ko-addons-label">Add-ons</span>
                <div className="ko-item-meta-chips-small">
                  {addOns.map((addOn, i) => (
                    <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Special Instructions Note */}
            {itemNotes && (
              <div className="ko-item-custom-note-box">
                <span className="note-label">Instruction:</span>
                <p className="item-custom-note-text">"{itemNotes}"</p>
              </div>
            )}

            {/* Price Calculations */}
            <div className="ko-modal-item-price-row">
              <span className="ko-item-unit-price">
                {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
              </span>
              <span className="ko-item-line-total">
                {fmtMoney(lineTotal, selectedOrder?.currency)}
              </span>
            </div>

          </div>
        </div>
      );
    })}
  </div>
</div>

                  {selectedOrder.delivery_notes && (
                    <div className="ko-modal-section-box notes-box">
                      <h5>Special Kitchen Notes / Instructions</h5>
                      <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
                    </div>
                  )}

                  <div className="ko-modal-action-footer">
                    <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
                    {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
                      <button
                        className="ko-action-primary-btn bg-prep"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
                      </button>
                    )}
                    {selectedOrder.status === "PREPARING" && (
                      <button
                        className="ko-action-primary-btn bg-complete"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleMarkReady(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KitchenOrder;