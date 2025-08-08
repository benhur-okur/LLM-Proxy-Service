// src/components/Sidebar.jsx
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

  const handleSelectConversation = (conversationId) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    } else {
      navigate(`/dashboard/chat?conversation_id=${conversationId}`);
    }
  };

  return (
    <aside className="relative w-60 shrink-0 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-r border-gray-200/70 dark:border-gray-800/70 p-5 overflow-y-auto">
      <div className="mb-8 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,.6)]" />
        <h1 className="text-2xl font-extrabold tracking-tight">
          LLM <span className="text-primary">Proxy</span>
        </h1>
      </div>

      {/* Menü */}
      <ul className="space-y-2 mb-6">
        {menuItems.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <li key={path}>
              <Link
                to={path}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-3 transition-all border",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(99,102,241,.15),0_8px_24px_-8px_rgba(99,102,241,.35)]"
                    : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-white/5",
                ].join(" ")}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-medium">{name}</span>
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,.8)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Sohbetler – Chat Paneli’nin hemen altında */}
      <section>
        <h3 className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          SOHBETLER
        </h3>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-white/5">
          <ConversationList conversations={conversations} onSelect={handleSelectConversation} />
        </div>
      </section>
    </aside>
  );
}