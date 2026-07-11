import { useMemo, useState } from "react";
import LoginScreen from "./components/login/LoginScreen";
import CustomerPortal from "./components/customer/CustomerPortal";
import AdminPanel from "./components/admin/AdminPanel";
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BRANDS,
  INITIAL_CUSTOMERS,
  INITIAL_EXAMS,
  INITIAL_ORDERS,
  INITIAL_STAFF_USERS,
  INITIAL_WAREHOUSE,
  createSeasonMonths,
  getDefaultCurrentMonthId,
  getDefaultSeasonStartYear,
} from "./data/initialData";

const DEFAULT_ADMIN_SETTINGS = {
  businessName: "İşler Kitabevi",
  branchName: "Atalar Şubesi",
  businessType: "Kitabevi",
  city: "Eskişehir",
  district: "Odunpazarı",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  workingHours: "Hafta içi 09:00 - 18:00",
  supportMessage:
    "Sipariş ve ürün desteği için bağlı olduğunuz şube ile iletişime geçebilirsiniz.",
  showBusinessNameInCustomerNavbar: true,
  showContactToCustomers: true,
  orderTakingEnabled: true,
  orderClosedMessage:
    "Şu anda sipariş alımı kapalıdır. Lütfen daha sonra tekrar deneyin.",
  minOrderQuantity: 1,
  maxOrderQuantity: 999,
  customerCanCancelOrder: false,
  orderNoteRequired: false,
  acceptAfterHoursOrders: true,
  orderApprovalMode: "Manuel onay",
  customerCanViewProducts: true,
  customerCanViewPrices: true,
  customerCanViewOrderHistory: true,
  customerCanUseFavorites: true,
  customerCanEditProfile: true,
  customerCanChangePassword: true,
  showAnnouncementsInCustomerPanel: true,
  showOnlyActiveProducts: true,
  hideOutOfStockProducts: false,
  ignoreDiscountOnLockedProducts: true,
  showPublisherOnProducts: true,
  showBarcodeOnProducts: false,
  showListPriceOnProducts: true,
  showcaseSortMode: "Yayınevine göre",
  forceStaffPasswordChange: true,
  forceCustomerPasswordChange: true,
  inactiveCustomerCannotLogin: true,
  inactiveStaffCannotLogin: true,
  lockAfterFailedAttempts: true,
  failedAttemptLimit: 5,
  sessionDurationMinutes: 120,
  confirmSensitiveActions: true,
  notifyNewOrderToStaff: true,
  notifyCustomerOrderApproved: true,
  notifyCustomerOrderCancelled: true,
  notifyCustomersOnAnnouncement: true,
  sendPasswordResetEmail: true,
  maintenanceMessageEnabled: false,
  maintenanceMessage: "Sistem kısa süreli bakım modundadır.",
  aksonEnabled: false,
  aksonApiBaseUrl: "",
  aksonCompanyCode: "",
  aksonBranchCode: "",
  aksonUsername: "",
  aksonApiToken: "",
  aksonInvoiceScenario: "E-arşiv",
  autoSendInvoiceToAkson: true,
  useAksonForProductImport: true,
  syncCustomersWithAkson: false,
  customerMatchField: "Kurum kodu",
  aksonTestMode: true,
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState("customer");
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [demandShowcase, setDemandShowcase] = useState(() =>
    INITIAL_EXAMS.map((exam) => ({ examId: exam.id, active: true })),
  );
  const [warehouseData, setWarehouseData] = useState(INITIAL_WAREHOUSE);
  const [staffUsers, setStaffUsers] = useState(INITIAL_STAFF_USERS);
  const [adminSettings, setAdminSettings] = useState(DEFAULT_ADMIN_SETTINGS);
  const [currentStaffRole, setCurrentStaffRole] = useState("admin");
  const [currentStaffUser, setCurrentStaffUser] = useState(null);
  const [previewCustomerId, setPreviewCustomerId] = useState(1);
  const [seasonStartYear, setSeasonStartYear] = useState(() =>
    getDefaultSeasonStartYear(),
  );
  const [currentMonthId, setCurrentMonthId] = useState(() =>
    getDefaultCurrentMonthId(),
  );
  const months = useMemo(
    () => createSeasonMonths(seasonStartYear, currentMonthId),
    [seasonStartYear, currentMonthId],
  );
  const seasonLabel = `${seasonStartYear}-${seasonStartYear + 1}`;

  const currentCustomer = customers[0] || INITIAL_CUSTOMERS[0];
  const previewCustomer =
    customers.find((customer) => customer.id === previewCustomerId) ||
    currentCustomer;

  const updateCustomerProfile = (customerId, nextProfile) => {
    setCustomers((current) =>
      current.map((customer) =>
        String(customer.id) === String(customerId)
          ? { ...customer, ...nextProfile }
          : customer,
      ),
    );
  };

  if (!isLoggedIn)
    return (
      <LoginScreen
        staffUsers={staffUsers}
        warehouseUsers={warehouseData?.depotUsers || []}
        onLogin={(selectedMode, selectedUser = null) => {
          const nextMode = selectedMode === "customer" ? "customer" : "admin";
          setCurrentStaffRole(
            selectedMode === "customer" ? "customer" : selectedMode,
          );
          setCurrentStaffUser(
            selectedMode === "customer" ? null : selectedUser,
          );
          setMode(nextMode);
          setIsLoggedIn(true);
        }}
      />
    );

  if (mode === "admin") {
    return (
      <AdminPanel
        customers={customers}
        setCustomers={setCustomers}
        exams={exams}
        setExams={setExams}
        orders={orders}
        setOrders={setOrders}
        brands={brands}
        setBrands={setBrands}
        announcements={announcements}
        setAnnouncements={setAnnouncements}
        demandShowcase={demandShowcase}
        setDemandShowcase={setDemandShowcase}
        warehouseData={warehouseData}
        setWarehouseData={setWarehouseData}
        staffUsers={staffUsers}
        setStaffUsers={setStaffUsers}
        currentStaffRole={currentStaffRole}
        currentStaffUser={currentStaffUser}
        adminSettings={adminSettings}
        onAdminSettingsChange={setAdminSettings}
        months={months}
        seasonStartYear={seasonStartYear}
        setSeasonStartYear={setSeasonStartYear}
        currentMonthId={currentMonthId}
        setCurrentMonthId={setCurrentMonthId}
        seasonLabel={seasonLabel}
        previewCustomerId={previewCustomerId}
        setPreviewCustomerId={setPreviewCustomerId}
        onPortalOpen={() => setMode("preview")}
        onLogout={() => {
          setCurrentStaffUser(null);
          setIsLoggedIn(false);
        }}
      />
    );
  }

  if (mode === "preview") {
    return (
      <CustomerPortal
        customer={previewCustomer}
        exams={exams}
        orders={orders}
        setOrders={setOrders}
        onCustomerProfileUpdate={updateCustomerProfile}
        announcements={announcements}
        demandShowcase={demandShowcase}
        months={months}
        seasonLabel={seasonLabel}
        adminSettings={adminSettings}
        onLogout={() => {
          setCurrentStaffUser(null);
          setIsLoggedIn(false);
        }}
        isPreview
        onBackToAdmin={() => setMode("admin")}
      />
    );
  }

  return (
    <CustomerPortal
      customer={currentCustomer}
      exams={exams}
      orders={orders}
      setOrders={setOrders}
      onCustomerProfileUpdate={updateCustomerProfile}
      announcements={announcements}
      demandShowcase={demandShowcase}
      months={months}
      seasonLabel={seasonLabel}
      adminSettings={adminSettings}
      onLogout={() => {
        setCurrentStaffUser(null);
        setIsLoggedIn(false);
      }}
    />
  );
}
