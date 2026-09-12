import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import IssueCertificate from "./pages/IssueCertificate";
import VerifyCertificate from "./pages/VerifyCertificate";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import "./App.css";


function ProtectedAdminRoute({ children }) {

  const isAuthenticated =
    sessionStorage.getItem(
      "adminAuthenticated"
    ) === "true";

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return children;
}


function App() {

  return (
    <BrowserRouter>

      <nav className="navbar">

        <div className="logo">
          CertChain
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/issue">
            Issue Certificate
          </Link>

          <Link to="/verify">
            Verify Certificate
          </Link>

          <Link
            to="/admin"
            className="nav-admin"
          >
            Admin
          </Link>

        </div>

      </nav>


      <Routes>

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/issue"
          element={<IssueCertificate />}
        />


        <Route
          path="/verify"
          element={<VerifyCertificate />}
        />


        <Route
          path="/verify/:certificateId"
          element={<VerifyCertificate />}
        />


        <Route
          path="/admin"
          element={<AdminLogin />}
        />


        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;