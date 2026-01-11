import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import CitizenRegister from "./pages/CitizenRegister";
import WardOfficerRegister from "./pages/WardOfficerRegister";
import DepartmentOfficerRegister from "./pages/DepartmentOfficerRegister";

function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/citizen") return <CitizenRegister />;
  if (path === "/admin/ward-officer") return <WardOfficerRegister />;
  if (path === "/ward/department-officer") return <DepartmentOfficerRegister />;

  return <Home />;
}

export default App;
