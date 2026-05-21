import { useMemo, useState } from "react";
import LoginScreen from "./components/login/LoginScreen";
import CustomerPortal from "./components/customer/CustomerPortal";
import AdminPanel from "./components/admin/AdminPanel";
import { INITIAL_ANNOUNCEMENTS, INITIAL_BRANDS, INITIAL_CUSTOMERS, INITIAL_EXAMS, INITIAL_ORDERS, INITIAL_STAFF_USERS, INITIAL_WAREHOUSE, createSeasonMonths, getDefaultCurrentMonthId, getDefaultSeasonStartYear } from "./data/initialData";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState("customer");
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [demandShowcase, setDemandShowcase] = useState(() => INITIAL_EXAMS.map((exam) => ({ examId: exam.id, active: true })));
  const [warehouseData, setWarehouseData] = useState(INITIAL_WAREHOUSE);
  const [staffUsers, setStaffUsers] = useState(INITIAL_STAFF_USERS);
  const [currentStaffRole, setCurrentStaffRole] = useState("admin");
  const [previewCustomerId, setPreviewCustomerId] = useState(1);
  const [seasonStartYear, setSeasonStartYear] = useState(() => getDefaultSeasonStartYear());
  const [currentMonthId, setCurrentMonthId] = useState(() => getDefaultCurrentMonthId());
  const months = useMemo(() => createSeasonMonths(seasonStartYear, currentMonthId), [seasonStartYear, currentMonthId]);
  const seasonLabel = `${seasonStartYear}-${seasonStartYear + 1}`;

  const currentCustomer = customers[0] || INITIAL_CUSTOMERS[0];
  const previewCustomer = customers.find((customer) => customer.id === previewCustomerId) || currentCustomer;

  if (!isLoggedIn) return <LoginScreen onLogin={(selectedMode) => { const nextMode = selectedMode === "customer" ? "customer" : "admin"; setCurrentStaffRole(selectedMode === "customer" ? "customer" : selectedMode); setMode(nextMode); setIsLoggedIn(true); }} />;

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
        months={months}
        seasonStartYear={seasonStartYear}
        setSeasonStartYear={setSeasonStartYear}
        currentMonthId={currentMonthId}
        setCurrentMonthId={setCurrentMonthId}
        seasonLabel={seasonLabel}
        previewCustomerId={previewCustomerId}
        setPreviewCustomerId={setPreviewCustomerId}
        onPortalOpen={() => setMode("preview")}
        onLogout={() => setIsLoggedIn(false)}
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
        announcements={announcements}
        demandShowcase={demandShowcase}
        months={months}
        seasonLabel={seasonLabel}
        onLogout={() => setIsLoggedIn(false)}
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
      announcements={announcements}
      demandShowcase={demandShowcase}
      months={months}
      seasonLabel={seasonLabel}
      onLogout={() => setIsLoggedIn(false)}
    />
  );
}
