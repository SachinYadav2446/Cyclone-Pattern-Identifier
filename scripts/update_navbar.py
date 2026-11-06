import os

NAVBAR_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "components", "Navbar.jsx")

with open(NAVBAR_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# Replace imports
text = text.replace(
    "import { Terminal, Menu, X, Upload, Radio, Sparkles } from 'lucide-react';",
    "import { Terminal, Menu, X, Upload, Radio, Sparkles, Bell } from 'lucide-react';"
)

# Replace function signature
text = text.replace(
    "export default function Navbar({ onOpenConsole, onOpenDemo }) {",
    "export default function Navbar({ onOpenConsole, onOpenDemo, onOpenNotifications, unreadCount = 2 }) {"
)

# Add Notification Pill button before Demo button
demo_btn = """          {/* Demo Pill (formerly Interactive Demo) */}
          <button
            onClick={onOpenDemo}"""

alerts_and_demo = """          {/* Meteorological Alerts & Early Warning Pill */}
          <button
            onClick={onOpenNotifications}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#1a0f28] hover:bg-[#251538] text-slate-200 border border-[#B43067]/40 hover:border-[#B43067] font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Early Warning Alerts & Daily Email Reports"
          >
            <Bell className="w-3.5 h-3.5 text-[#E04A31] animate-pulse" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E04A31] text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Demo Pill (formerly Interactive Demo) */}
          <button
            onClick={onOpenDemo}"""

assert demo_btn in text, "demo_btn not found in Navbar.jsx"
text = text.replace(demo_btn, alerts_and_demo, 1)

# Add to mobile menu
mobile_demo = """            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}"""

mobile_alerts_and_demo = """            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNotifications();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1a0f28] border border-[#B43067]/50 text-slate-200 font-bold text-xs"
            >
              <Bell className="w-3.5 h-3.5 text-[#E04A31]" />
              <span>Alerts ({unreadCount})</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}"""

assert mobile_demo in text, "mobile_demo not found in Navbar.jsx"
text = text.replace(mobile_demo, mobile_alerts_and_demo, 1)

with open(NAVBAR_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("Successfully updated Navbar.jsx")
