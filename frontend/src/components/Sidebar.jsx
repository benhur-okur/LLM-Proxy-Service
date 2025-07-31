// Sidebar.jsx
import { HomeIcon, KeyIcon, ChatAlt2Icon } from "@heroicons/react/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConversationList from "./chat/ConversationList";

const menuItems = [
  { name: "Ana Sayfa", path: "/dashboard", icon: HomeIcon },
  { name: "API Anahtarları", path: "/dashboard/api-keys", icon: KeyIcon },
  { name: "Chat Paneli", path: "/dashboard/chat", icon: ChatAlt2Icon },
];

export default function Sidebar({ conversations, onSelectConversation }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Eğer prop yoksa fallback olarak navigate fonksiyonu kullanılabilir.
  const handleSelectConversation = (conversationId) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    } else {
      navigate(`/dashboard/chat?conversation_id=${conversationId}`);
    }
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6">LLM Proxy</h2>

        <ul className="space-y-2 mb-6">
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

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Sohbetler</h3>
          <div className="overflow-y-auto max-h-[300px] pr-1">
            <ConversationList
              conversations={conversations}
              onSelect={handleSelectConversation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
