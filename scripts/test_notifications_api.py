import urllib.request
import json

# Test GET /api/v1/notifications
resp = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/notifications")
data = json.loads(resp.read().decode())
print("GET Notifications:", data.get("status"), f"Total: {data.get('total_count')}, Unread: {data.get('unread_count')}")

# Test Subscribe
sub_payload = json.dumps({
    "email": "meteorologist@test.gov",
    "frequency": "daily",
    "realtime_critical": True,
    "daily_digest": True,
    "min_category": "SCS"
}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/v1/notifications/subscribe", data=sub_payload, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
print("Subscribe response:", json.loads(resp.read().decode()))

# Test Send Report Email
send_payload = json.dumps({
    "recipient_email": "chief_forecaster@imd.gov.in",
    "storm_data": {
        "storm_name": "CYCLONE REMAL",
        "category": "Severe Cyclonic Storm (SCS)",
        "msw_knots": 65.0,
        "pressure_hpa": 978.0,
        "lat": 21.95,
        "lon": 89.20,
        "landfall_location": "Sagar Island / Khepupara Coast",
        "landfall_eta": "18 Hours (26-May-2024 18:00 UTC)"
    }
}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/v1/notifications/send-report-email", data=send_payload, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
print("Send Email response:", json.loads(resp.read().decode()))
