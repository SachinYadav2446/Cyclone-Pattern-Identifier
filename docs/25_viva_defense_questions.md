# 25 Viva / Project Defense Questions

## Beginner Concepts (20)
1. **What is a Tropical Cyclone?** A rapidly rotating, low-pressure storm system with a warm core and organized thunderstorms originating over warm tropical oceans.
2. **What is the Cyclone Eye?** The calm, clear, roughly circular center of a mature cyclone characterized by light winds and sinking warm air.
3. **What is the Eyewall?** The dense ring of violent thunderstorms surrounding the eye where the strongest winds and heaviest rains occur.
4. **What is Central Dense Overcast (CDO)?** The large, thick, circular shield of cold thunderstorm clouds surrounding the cyclone's center.
5. **What is Maximum Sustained Wind Speed (MSW)?** The highest average wind speed measured over a specific time interval (3 minutes for IMD, 1 minute for NOAA).
6. **What is Central Pressure Deficit (CPD)?** The difference in atmospheric pressure between the ambient environment and the lowest pressure at the cyclone center.
7. **What is the Dvorak Technique?** A satellite-based method that estimates cyclone intensity by evaluating cloud patterns and temperature differences between the eye and cloud tops.
8. **What is a Dvorak T-Number?** A numerical rating from T1.0 to T8.0 (in steps of 0.5) that directly correlates with storm wind speed and central pressure.
9. **What is a Knot?** A nautical unit of speed equal to 1 nautical mile per hour (approximately 1.852 km/h).
10. **What is a NetCDF (.nc) file?** A self-describing, multi-dimensional scientific file format used to store gridded weather and satellite data.
11. **What is an HDF5 (.h5) file?** A hierarchical data format designed to store complex, large-scale scientific raster and sensor arrays.
12. **What is Thermal Infrared (TIR) radiation?** Invisible heat radiation emitted by Earth and clouds, allowing satellites to measure temperature day and night.
13. **What is the Water Vapor (WV) satellite channel?** A channel measuring moisture in the upper troposphere, revealing atmospheric winds and dry air intrusions.
14. **What is PostGIS?** A spatial database extension for PostgreSQL that enables geographic queries and location calculations.
15. **What is Mapbox GL JS?** A JavaScript library that uses WebGL to render interactive, high-performance vector and raster maps in web browsers.
16. **What does Mean Absolute Error (MAE) measure?** The average absolute difference between predicted values (e.g., wind speed) and actual measured values.
17. **What is a Confusion Matrix?** A table used to evaluate classification models by displaying True Positives, False Positives, True Negatives, and False Negatives.
18. **What is PyTorch?** An open-source deep learning framework used for building and training neural networks.
19. **What is FastAPI?** A modern, high-performance Python web framework for building REST APIs with automatic data validation.
20. **What is Docker?** A platform that packages software and its dependencies into isolated containers to ensure reproducible execution across environments.

---

## Intermediate Concepts (20)
1. **Why is multi-spectral fusion necessary for nighttime storm tracking?** Visible light is absent at night; combining Thermal Infrared 1, Infrared 2, and Water Vapor channels provides complete thermal and motion visibility 24/7.
2. **How does the Dvorak Technique correlate cloud-top temperatures with central pressure?** Colder, higher cloud tops indicate stronger convective updrafts, which draw more air upward and lower the surface atmospheric pressure.
3. **How does CenterNet detect keypoints without anchor boxes?** It uses a convolutional backbone to output a probability heatmap where the highest peak represents the center coordinates directly.
4. **What makes ConvLSTM superior to standard LSTMs for meteorological rasters?** ConvLSTM replaces matrix multiplications with convolutions, preserving 2D spatial relationships and cloud rotation across time frames.
5. **How does Grad-CAM produce spatial attention heatmaps?** It calculates the gradients of the predicted intensity score with respect to feature maps in the final convolutional layer to highlight important pixels.
6. **How does PostGIS execute spatial intersections for coastal district risk?** By using spatial indexing to test whether the predicted cone polygon intersects district boundary polygons (`ST_Intersects`).
7. **How does Celery manage background raster transformations?** It offloads heavy download and calibration tasks to worker processes via a Redis message broker, keeping the web API fast and responsive.
8. **Why does a temporal storm-independent dataset split prevent data leakage?** Because consecutive satellite images of the same cyclone are highly correlated; testing on images from a storm used in training would yield falsely inflated accuracy.
9. **How is Rapid Intensification triggered by warm ocean heat content?** Sea surface temperatures above 28°C provide abundant heat and moisture, fueling massive convective bursts that rapidly lower central pressure.
10. **Why does the Cone of Uncertainty expand with forecast lead time?** Because atmospheric chaos and small initial position errors compound over time, increasing forecast uncertainty.
11. **Why is Quadratic Weighted Kappa used for ordinal category evaluation?** It penalizes large category classification errors (e.g., Depression vs. Super Cyclone) much more heavily than small errors between adjacent stages.
12. **How does Deck.gl leverage WebGL for particle rendering?** It passes wind vector arrays directly to GPU shader memory, animating thousands of particles simultaneously without CPU lag.
13. **What does sensor calibration do to raw digital counts?** It applies linear gain/offset conversions and Planck's radiation law to convert raw sensor numbers into real Brightness Temperature in Kelvin.
14. **How does ReportLab compile dynamic PDF documents?** It builds a document flow using structured Python canvas objects, rendering tables, typography, and charts programmatically.
15. **What is Brightness Temperature in satellite meteorology?** The temperature an ideal physical object would need to emit the specific amount of infrared radiation detected by the satellite sensor.
16. **Why is the 512x512 crop size optimal for storm input tensors?** It covers an area of approximately 2000x2000 km, capturing the entire storm core and outer bands while fitting efficiently in GPU memory.
17. **What is the purpose of the split-window difference (TIR1 - TIR2)?** It isolates atmospheric moisture absorption to remove thin cirrus cloud haze and provide clean ocean surface temperatures.
18. **How does the Rapid Intensification classifier use tabular environmental data?** It combines cloud thermal metrics with ERA5 sea surface temperatures and vertical wind shear values in a gradient-boosted decision tree.
19. **What is the difference between a geostationary and polar-orbiting satellite?** Geostationary satellites stay fixed over one location at 36,000 km altitude for continuous monitoring; polar satellites orbit closer and pass periodically.
20. **How does the system ensure reproducible model training runs?** By fixing random seed numbers across PyTorch, NumPy, and CUDA, and documenting exact dataset version tags in the model card.

---

## Advanced Concepts (20)
1. **What are the loss function components for multi-task Deep Dvorak training?** A weighted combination of Mean Squared Error for continuous wind speed and pressure regression, and Cross-Entropy loss for category classification.
2. **How do severe vertical wind shears affect optical-infrared intensity estimation?** High wind shear tilts the storm, displacing the upper cloud shield away from the surface center; water vapor channels help locate the true low-level circulation.
3. **How do you mitigate class imbalance for rare Super Cyclonic Storms?** Using focal loss, class-weighted loss penalties, physics-guided data augmentation (rotations and scaling), and transfer learning from global hurricane datasets.
4. **What are the information-theoretic limits of 48-hour satellite-only track forecasting?** Satellite images show current and past cloud dynamics, but 48-hour forecasts eventually require coupling with large-scale atmospheric pressure fields from NWP models.
5. **How can deep learning models couple with dynamical NWP boundary conditions?** By feeding gridded atmospheric pressure and wind vectors from models like GFS/WRF as auxiliary channels alongside satellite rasters.
6. **How is the Brier Skill Score used to evaluate Rapid Intensification probability?** It measures the accuracy of probabilistic forecasts compared to a climatological reference baseline, with positive scores indicating superior skill.
7. **How is coastal bathymetry integrated for storm surge modeling?** Shallow coastal ocean shelves amplify surge waves; bathymetric depth profiles combined with central pressure deficit yield accurate coastal water rise estimates.
8. **How can uncertainty quantification be implemented in deep track forecasting?** Using Monte Carlo Dropout or Deep Ensembles during inference to produce a distribution of predicted track lines rather than a single deterministic path.
9. **What fail-safe operational fallbacks are necessary for national disaster warning systems?** Automated fallback to extrapolation from the last three radar/satellite fixes and standard climatological models if deep learning inference times out.
10. **What ethical and governance considerations apply to automated disaster alerting?** Ensuring an authorized human duty officer signs off before high-level public evacuation alerts are broadcast to prevent panic from potential false alarms.
11. **How does log-spiral fitting mathematically verify cyclone centers?** By fitting logarithmic spiral equations ($r = a e^{b \theta}$) to edge-detected rainbands to calculate the geometric origin.
12. **Why is sub-pixel offset regression necessary in CenterNet?** Because downsampling the image by a factor of 4 creates discretization steps; offset regression restores exact floating-point pixel accuracy.
13. **How does self-supervised pre-training benefit satellite computer vision?** Pre-training ConvNeXt models using masked autoencoders on millions of unlabeled satellite scans teaches the network cloud representations before fine-tuning on labeled storms.
14. **How are spatial attention maps validated for meteorological consistency?** By measuring the percentage of attention energy falling within the radius of maximum wind compared to surrounding background ocean.
15. **What is the effect of the Coriolis force on Northern vs. Southern Hemisphere cyclones?** The Coriolis force causes counter-clockwise rotation in the Northern Hemisphere (Bay of Bengal/Arabian Sea) and clockwise rotation in the Southern Hemisphere.
16. **How do microwave scatterometers complement geostationary infrared sensors?** Microwave frequencies penetrate through dense cloud shields to measure surface ocean roughness and surface wind vectors directly.
17. **How does the system maintain data integrity against adversarial or corrupted inputs?** By enforcing strict Pydantic input schemas, validating checksums on downloaded satellite files, and rejecting out-of-range sensor readings.
18. **How does the interactive canvas synchronize edits with the backend PostGIS database?** Using REST API update endpoints with optimistic UI updates and server-side spatial validation before persisting modified track fixes.
19. **What architectural pattern ensures that live streaming feeds do not block API clients?** An asynchronous publisher-subscriber model using Celery workers, Redis queues, and WebSocket event broadcasting.
20. **How do you design human evaluation rubrics to assess AI advisory bulletin quality?** By having experienced meteorologists score generated bulletins on a 1-to-5 scale across factual accuracy, clarity, and adherence to IMD warning standards.
