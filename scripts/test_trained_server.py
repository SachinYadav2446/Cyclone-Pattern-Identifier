import urllib.request
import json
import base64
import os

# Test health
req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health")
print("Health:", req.status, req.read().decode())

# Test with a test image from dataset/val/images
val_dir = os.path.join(os.path.dirname(__file__), "..", "dataset", "val", "images")
val_imgs = [f for f in os.listdir(val_dir) if f.endswith(".png")]
if val_imgs:
    test_img_path = os.path.join(val_dir, val_imgs[0])
    with open(test_img_path, "rb") as f:
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
        print("\n--- Localize Eye Result ---")
        print("Status:", res.get("status"))
        print("Predicted Eye:", res.get("predicted_eye"))
        print("Neural Prediction:", res.get("neural_net_prediction"))

    # Test estimate-intensity
    int_req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/models/estimate-intensity",
        data=post_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(int_req) as resp:
        res = json.loads(resp.read().decode())
        print("\n--- Intensity Estimation Result ---")
        print("Status:", res.get("status"))
        print("Model:", res.get("model_architecture"))
        print("Intensity Metrics:", res.get("intensity_metrics"))
