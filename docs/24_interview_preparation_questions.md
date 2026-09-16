# 24 Interview Preparation Questions

## Product Questions (20)
1. **What problem does this solve for operational meteorologists versus disaster management teams?**  
   Meteorologists get automated, objective intensity readings and rapid trajectory forecasts; disaster teams receive actionable district-level evacuation priorities and storm surge estimates.
2. **Why is multi-source satellite data required instead of standard visible-light satellite imagery?**  
   Visible imagery only works during the daytime. Thermal infrared and water vapor channels allow continuous 24/7 tracking through day and night.
3. **What is the operational MVP for an active cyclone event?**  
   Ingesting fresh 15-minute satellite rasters, detecting the eye center, calculating wind speed/category, forecasting 24-hour path with uncertainty cones, and exporting an advisory PDF.
4. **What is the primary life-safety metric of this platform?**  
   Maximizing evacuation lead time (48 hours in advance) with accurate coastal landfall targeting and population hazard mapping.
5. **How does the system handle storms that develop at night when visible imagery is unavailable?**  
   It uses Thermal Infrared Band 13 and Water Vapor Band 8, which measure emitted heat radiation and atmospheric moisture independently of sunlight.
6. **What is the difference between Maximum Sustained Wind Speed (MSW) and gust speed?**  
   MSW is the average wind speed sustained over a 3-minute period (IMD standard); gusts are brief, 3-second peak surges.
7. **What does the "Cone of Uncertainty" actually represent mathematically?**  
   It represents the area enclosing a 67% statistical probability of where the cyclone's center will travel, expanding with forecast lead time based on historical model error.
8. **What is explicitly out of scope for this decision-support platform?**  
   Autonomous triggering of sirens or evacuations without human duty officer verification; physical weather modification; direct sensor hardware maintenance.
9. **How do you validate the system's economic and life-safety value before operational deployment?**  
   By running retrospective backtesting on past major Indian cyclones (Fani, Amphan, Biparjoy) and comparing forecast lead times against historical evacuation schedules.
10. **How does the platform assist port authorities and maritime shipping?**  
    By predicting quadrant-wise gale wind radii (34, 50, and 64 knots) to establish marine danger zones and order fishing vessels back to harbor.
11. **What is the single biggest operational risk during an active cyclone?**  
    Missed detection of Rapid Intensification (RI) right before landfall, causing inadequate coastal evacuations.
12. **How does the system handle ambiguous or sheared pre-cyclone tropical depressions?**  
    CenterNet uses the mathematical curvature of outer spiral rainbands and water vapor rotation vectors to triangulate the circulation center even without an open eye.
13. **How does the Automated IMD Advisory Bulletin generator reduce disaster response latency?**  
    It automates drafting, table formatting, and map rendering of official bulletins, reducing publishing time from 45 minutes to under 2 seconds.
14. **How do you monitor model performance after deployment during live monsoon seasons?**  
    By comparing automated AI predictions against real-time coastal radar observations, coastal weather stations, and post-storm best-track reanalysis.
15. **What features are required to transition this system to full national-scale IMD operations?**  
    Integration with Doppler Weather Radar feeds, direct coupling with high-performance numerical models (WRF/GFS), and government SMS gateway integration.
16. **How does the platform prevent false alarms on Rapid Intensification alerts?**  
    By requiring both satellite convective cloud signatures and supportive environmental conditions (warm sea surface temperatures and low wind shear).
17. **Why is sub-pixel eye localization critical for downstream trajectory accuracy?**  
    A small 20 km error in initial center placement compounds over time, leading to over 100 km of landfall position error 48 hours later.
18. **How are multi-lingual public emergency warnings structured for non-technical citizens?**  
    They use clear, bulleted safety directives (evacuation timings, shelter locations, drinking water precautions) in regional languages without complex meteorological jargon.
19. **How does the system integrate coastal bathymetry for storm surge estimation?**  
    By mapping storm central pressure deficits and wind radii onto shallow coastal shelf bathymetry profiles in PostGIS to estimate surge water piling.
20. **What is the fallback protocol if satellite data feeds experience a temporary outage?**  
    The system falls back to climatological persistence extrapolation and last-known radar fixes until satellite streaming resumes.

---

## Technical Questions (20)
1. **Why use ConvNeXt-V2 over traditional ResNets for cyclone intensity estimation?**  
   ConvNeXt-V2 incorporates large 7x7 depthwise filters and inverted bottlenecks, allowing it to capture wide spiral rainbands and subtle thermal gradients more accurately.
2. **How does the ConvLSTM architecture capture cloud rotational kinematics?**  
   It replaces matrix multiplications with convolution operations inside recurrent LSTM cells, maintaining spatial 2D relationships across sequential time frames.
3. **What is the physical principle behind the classical Dvorak Technique?**  
   A stronger cyclone creates colder, higher thunderstorm clouds in the eyewall and a warmer, clearer sinking eye, resulting in a large temperature contrast.
4. **How is multi-channel early fusion implemented across Thermal IR and Water Vapor bands?**  
   By modifying the first convolutional layer of the network to accept a 4-channel input tensor ([TIR1, TIR2, WV, VIS]) rather than standard 3-channel RGB.
5. **How does CenterNet perform anchor-free keypoint localization for the cyclone eye?**  
   It generates a 2D probability heatmap where the local maximum peak indicates the center point, accompanied by an offset head for sub-pixel precision.
6. **Why is Mean Absolute Track Error in km used instead of standard Euclidean loss?**  
   Because Earth is spherical, the Haversine formula converts latitude and longitude differences into true geographic kilometers across the ocean surface.
7. **How does the Grad-CAM algorithm compute gradients with respect to convolutional feature maps?**  
   It computes the gradient of the predicted wind score with respect to feature activations in the final convolutional layer, producing a weighted spatial attention map.
8. **Why use PostGIS for geospatial queries rather than processing GeoJSON in Python memory?**  
   PostGIS uses spatial R-Tree indexing to perform complex polygon intersections with millions of census and district boundary geometries in milliseconds.
9. **How do you prevent data leakage when training spatio-temporal sequence models on weather data?**  
   By using a storm-independent temporal split (entire cyclone seasons grouped into train, validation, and test sets) so the model never trains and tests on the same storm.
10. **How is the Rapid Intensification (RI) threshold defined mathematically?**  
    An increase in maximum sustained wind speed of 30 knots (approximately 55 km/h) or more within a 24-hour period.
11. **How does Celery and Redis manage asynchronous multi-spectral raster transformations?**  
    Redis queues incoming raster download tasks, and background Celery workers process calibrations and model inference asynchronously without blocking API responses.
12. **Why is GPU memory management critical when processing multi-dimensional satellite cubes?**  
    Full-disk satellite rasters can exceed 5000x5000 pixels. Cropping a 512x512 storm patch beforehand keeps GPU VRAM usage below 2GB.
13. **How do you evaluate intensity estimation when historical category labels have class imbalance?**  
    By evaluating Mean Absolute Error per category stage and using weighted loss functions during training to account for the rarity of Super Cyclones.
14. **What does Cohen's Quadratic Weighted Kappa measure in meteorological category verification?**  
    It measures agreement across ordered storm categories, penalizing severe misclassifications (e.g., Depression vs. Super Cyclone) far more than adjacent categories.
15. **How are quadrant wind radii (34, 50, 64 knots) constrained to prevent physical impossibilities?**  
    By enforcing post-processing constraints where the destructive 64-knot radius cannot mathematically exceed the outer 50-knot or 34-knot radii.
16. **Why is ONNX Runtime used for CPU-optimized inference during deployment?**  
    It fuses operator layers and applies quantization, allowing the deep learning models to execute in under 1.5 seconds on low-cost CPU instances.
17. **How does Deck.gl render GPU-accelerated wind vector particle flows in the browser?**  
    It uses WebGL shader buffers to animate thousands of dynamic particle positions directly on the user's graphics card at 60 frames per second.
18. **How do you calibrate model confidence probabilities for Rapid Intensification predictions?**  
    Using Platt scaling or isotonic regression to align raw classifier probabilities with real historical occurrence frequencies.
19. **What is the method for generating the 2D cone of uncertainty?**  
    By calculating historical forecast error standard deviations at each lead time, generating circular buffers around predicted coordinates, and drawing their convex boundary.
20. **How are sensor calibration formulas applied to raw digital numbers?**  
    By converting raw sensor counts to radiance using calibration slope/intercept values, then inverting Planck's radiation equation to calculate Brightness Temperature in Kelvin.

---

## Architecture & Scenario Questions (20)
1. **Explain the full data flow from raw satellite download to React GIS dashboard display.**  
   Celery downloads the NetCDF raster -> xarray extracts 4 channels -> CenterNet locates eye -> ConvNeXt predicts wind speed -> ConvLSTM predicts 48h track -> PostGIS computes district risk -> FastAPI serves GeoJSON to Mapbox.
2. **How would you scale the ingestion pipeline if given 5-minute rapid-scan satellite feeds?**  
   Scale Celery worker pools horizontally and write intermediate cropped tensors to a distributed MinIO object store.
3. **What investigation steps do you take if the model mislocalizes an eye center by over 100 km?**  
   Inspect the raw input channels for scanline corruption, check the Grad-CAM heatmap to see if convection was sheared, and evaluate if multi-vortex interaction occurred.
4. **What happens if the primary satellite channel (TIR-1) has corrupted scan lines?**  
   The pre-processing pipeline detects missing data masks and falls back to Channel 2 (TIR-2) and Water Vapor channels with an uncertainty warning flag.
5. **How does the system handle a cyclone that splits into multiple circulation vortices?**  
   CenterNet outputs top-K keypoint peaks; the primary vortex is selected based on maximum surrounding convective cloud thickness and wind speed.
6. **How do you maintain database query speeds when millions of historical track points are stored?**  
   By partitioning spatial tables by year/basin and maintaining GiST spatial indexes on all geometry columns.
7. **Where would a Numerical Weather Prediction (NWP) physics model couple into this neural network?**  
   As an auxiliary input tensor supplying background atmospheric wind steering vectors and sea surface temperature grids to the ConvLSTM forecaster.
8. **How does the frontend handle smooth rendering of large multi-spectral raster overlays?**  
   By tiling rasters into standard web map tiles (XYZ / Cloud Optimized GeoTIFF) rendered progressively by Mapbox GL JS.
9. **What is your response if a senior meteorologist disputes an AI-generated intensity score?**  
   Open "Doctor Mode" in the UI to display the Grad-CAM thermal gradient analysis and comparative historical storm analogs.
10. **How do you ensure the Automated Bulletin PDF strictly conforms to government formatting standards?**  
    By using fixed ReportLab layout templates matching the exact header, typography, tables, and color-coded warning formats of the India Meteorological Department.
11. **How do you handle API request surges during active major cyclone events?**  
    By placing Cloudflare CDN caching in front of static GeoJSON track files and decoupling telemetry reads from backend inference workers.
12. **Why is point-based keypoint detection preferred over bounding-box object detection for cyclones?**  
    Cyclones are round, rotating fluid systems; pinpointing the geometric center of rotation directly is more accurate than drawing rectangular boxes.
13. **How does the system calculate storm heading and translational speed?**  
    By computing the geographic bearing and distance between the two most recent 6-hour observed center coordinates.
14. **How do you prevent data corruption during simultaneous satellite file downloads?**  
    By using atomic file writes and unique task UUIDs in Celery worker temporary directories.
15. **What changes if you want to deploy this system for Atlantic hurricanes instead of Indian cyclones?**  
    Switch the geographic bounding box to the Atlantic basin and map wind speed outputs to the Saffir-Simpson Hurricane Wind Scale.
16. **How is the district evacuation ranking calculated?**  
    A weighted index combining total census population inside the 50-knot wind cone, estimated storm surge height, and available relief shelter capacity.
17. **How does the system ensure zero code execution when parsing uploaded satellite files?**  
    Files are opened strictly using read-only numerical array readers (`xarray`/`h5py`) without executing any embedded scripts or macros.
18. **How do you evaluate whether a new model architecture is ready to replace the current production model?**  
    Run shadow-mode inference across a full historical cyclone season and verify that wind speed error is lower and track error does not regress.
19. **What monitoring metrics indicate that the live satellite ingestion worker has failed?**  
    A Prometheus alert triggering if no new satellite observation timestamp is recorded in PostgreSQL for over 45 minutes.
20. **How does the system ensure high availability during power or internet instability?**  
    By hosting the backend on cloud infrastructure with automatic failover and local browser caching of active advisory data.
