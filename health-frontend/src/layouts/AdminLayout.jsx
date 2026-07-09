import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const T = {
  cream: "#F5F0E8",
};

export default function AdminLayout() {
  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: 268,
          minHeight: "100vh",
          background: T.cream,
        }}
      >
        <Navbar />

        <main
          style={{
            paddingTop: 68,
            minHeight: "calc(100vh - 68px)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}