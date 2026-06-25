export default function Navbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6 ml-64">
      <h2 className="font-semibold">Admin Panel</h2>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}