import os

APP_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "App.jsx")

with open(APP_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# Add import
if "import NotificationCenterModal" not in text:
    text = text.replace(
        "import GISConsoleModal from './components/GISConsoleModal';",
        "import GISConsoleModal from './components/GISConsoleModal';\nimport NotificationCenterModal from './components/NotificationCenterModal';"
    )

# Add state
old_state = "const [isConsoleOpen, setIsConsoleOpen] = useState(false);\n  const [isDemoOpen, setIsDemoOpen] = useState(false);"
new_state = """const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadAlertCount, setUnreadAlertCount] = useState(2);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadAlertCount(data.unread_count || 0);
        }
      } catch (e) {
        // quiet fallback
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);"""

assert old_state in text, "old_state not found in App.jsx"
text = text.replace(old_state, new_state, 1)

# Update Navbar props
old_navbar = """      {/* Top Navbar */}
      <Navbar 
        onOpenConsole={() => setIsConsoleOpen(true)} 
        onOpenDemo={() => setIsDemoOpen(true)}
      />"""

new_navbar = """      {/* Top Navbar */}
      <Navbar 
        onOpenConsole={() => setIsConsoleOpen(true)} 
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadAlertCount}
      />"""

assert old_navbar in text, "old_navbar not found in App.jsx"
text = text.replace(old_navbar, new_navbar, 1)

# Add NotificationCenterModal before closing </div>
old_closing = """      {/* GIS Command Console Modal */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onOpenInWorkbench={handleOpenInWorkbench}
      />
    </div>"""

new_closing = """      {/* GIS Command Console Modal */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onOpenInWorkbench={handleOpenInWorkbench}
      />

      {/* Meteorological Early Warning & Email Dispatch Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectStorm={(stormId) => {
          setIsNotificationsOpen(false);
          setSelectedWorkbenchStormId(stormId);
          setIsDemoOpen(true);
        }}
      />
    </div>"""

assert old_closing in text, "old_closing not found in App.jsx"
text = text.replace(old_closing, new_closing, 1)

with open(APP_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("Successfully updated App.jsx with NotificationCenterModal")
