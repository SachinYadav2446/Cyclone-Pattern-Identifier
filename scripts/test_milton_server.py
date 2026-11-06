import urllib.request
import json
import base64
import os

milton_path = r"C:\Users\yadav\.gemini\antigravity\brain\a0f602b8-d812-4af7-8553-78ed8efe63d6\.user_uploaded\media_1793985572173_c3205c67.png"
if os.path.exists(milton_path):
    with open(milton_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    # Test localize-eye
    post_data = json.dumps({"image_base64": b64}).encode()
    loc_req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/models/localize-eye",
        data=post_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(loc_req) as resp:
        res = json.loads(resp.read().decode())
        print("--- Localize Eye Milton Result ---")
        print("Status:", res.get("status"))
        pe = res.get("predicted_eye")
        if pe:
            print(f"Predicted Eye: x={pe.get('pixel_x_percent')}%, y={pe.get('pixel_y_percent')}%")
            print("Detection mode:", pe.get("detection_mode"))
        print("Neural Prediction:", res.get("neural_net_prediction"))

    # Test estimate-intensity
    int_req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/models/estimate-intensity",
        data=post_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(int_req) as resp:
        res = json.loads(resp.read().decode())
        print("\n--- Intensity Estimation Milton Result ---")
        print("Model:", res.get("model_architecture"))
        print("Intensity Metrics:", res.get("intensity_metrics"))
