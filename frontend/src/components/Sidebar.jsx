// src/components/Sidebar.jsx
import { HomeIcon, KeyIcon, ChatAlt2Icon } from "@heroicons/react/outline"; // ✅ Chat ikonu eklendi
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Ana Sayfa", path: "/dashboard", icon: HomeIcon },
  { name: "API Anahtarları", path: "/dashboard/api-keys", icon: KeyIcon },
  { name: "Chat Paneli", path: "/dashboard/chat", icon: ChatAlt2Icon }, // ✅ Yeni eklenen chat paneli
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">LLM Proxy</h2>
      <ul className="space-y-2">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <li key={path}>
            <Link
              to={path}
              className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                location.pathname === path ? "bg-gray-800" : ""
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
