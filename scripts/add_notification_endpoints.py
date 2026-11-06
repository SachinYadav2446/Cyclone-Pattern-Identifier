import os

SERVER_PY_PATH = os.path.join(os.path.dirname(__file__), "..", "ai_engine", "server.py")

with open(SERVER_PY_PATH, "r", encoding="utf-8") as f:
    text = f.read()

original_crlf = "\r\n" in text
text_norm = text.replace("\r\n", "\n")

# Add import if not present
if "from ai_engine.services.notification_service import notification_service" not in text_norm:
    text_norm = text_norm.replace(
        "from ai_engine.services.bulletin_generator import generate_cyclone_bulletin_pdf",
        "from ai_engine.services.bulletin_generator import generate_cyclone_bulletin_pdf\nfrom ai_engine.services.notification_service import notification_service"
    )

# Add endpoints before if __name__ == "__main__":
target = 'if __name__ == "__main__":'
assert target in text_norm, "main target not found"

new_code = '''class SubscribeEmailRequest(BaseModel):
    email: str
    frequency: Optional[str] = "daily"
    realtime_critical: Optional[bool] = True
    daily_digest: Optional[bool] = True
    pass_updates: Optional[bool] = False
    min_category: Optional[str] = "SCS"

class SendReportEmailRequest(BaseModel):
    recipient_email: str
    storm_data: Optional[Dict[str, Any]] = None

@app.get("/api/v1/notifications")
def get_basin_notifications():
    """Returns active real-time and synoptic notifications with unread counts."""
    return notification_service.get_notifications()

@app.post("/api/v1/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    """Marks an alert notification as read."""
    return notification_service.mark_as_read(notif_id)

@app.post("/api/v1/notifications/mark-all-read")
def mark_all_notifications_read():
    """Marks all alert notifications as read."""
    return notification_service.mark_all_read()

@app.post("/api/v1/notifications/subscribe")
def subscribe_to_alerts(payload: SubscribeEmailRequest):
    """Subscribes an email to real-time or daily meteorological advisories."""
    return notification_service.subscribe_email(payload.dict())

@app.post("/api/v1/notifications/send-report-email")
def send_report_email(payload: SendReportEmailRequest):
    """Dispatches official PDF Advisory Bulletin and HTML briefing to target email."""
    return notification_service.send_report_email(
        recipient_email=payload.recipient_email,
        storm_data=payload.storm_data
    )


''' + target

text_norm = text_norm.replace(target, new_code, 1)

final_text = text_norm.replace("\n", "\r\n") if original_crlf else text_norm
with open(SERVER_PY_PATH, "w", encoding="utf-8") as f:
    f.write(final_text)

print("Successfully added notification endpoints to server.py")
