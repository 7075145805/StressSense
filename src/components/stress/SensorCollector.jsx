// Utility module for collecting sensor data from mobile browser APIs
// Falls back to simulated data when real sensors are unavailable

const SENSOR_INTERVAL = 100; // ms

export function createSensorCollector() {
    let accel = { x: 0, y: 0, z: 0 };
    let gyro = { alpha: 0, beta: 0, gamma: 0 };
    let gps = { lat: null, lng: null };
    let prevGps = { lat: null, lng: null };
    let heartRate = 72;
    let screenStart = Date.now();
    let orientationChangeCount = 0;
    let shakeCount = 0;
    let lastAccelMag = 0;
    let listeners = [];
    let geoWatchId = null;
    let sensorsAvailable = { accelerometer: false, gyroscope: false, gps: false };

    // Accelerometer
    function handleMotion(e) {
        const a = e.accelerationIncludingGravity || e.acceleration;
        if (a) {
            sensorsAvailable.accelerometer = true;
            accel = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
            const mag = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
            if (Math.abs(mag - lastAccelMag) > 15) shakeCount++;
            lastAccelMag = mag;
        }
    }

    // Gyroscope
    function handleOrientation(e) {
        const newGyro = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 };
        if (Math.abs(newGyro.beta - gyro.beta) > 30 || Math.abs(newGyro.gamma - gyro.gamma) > 30) {
            orientationChangeCount++;
        }
        sensorsAvailable.gyroscope = true;
        gyro = newGyro;
    }

    function startGPS() {
        if ('geolocation' in navigator) {
            geoWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    sensorsAvailable.gps = true;
                    prevGps = { ...gps };
                    gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                },
                () => { },
                { enableHighAccuracy: true, maximumAge: 5000 }
            );
        }
    }

    // Simulated heart rate (slight random variation around baseline)
    function simulateHeartRate(stressFactor = 0) {
        const base = 72 + stressFactor * 30;
        heartRate = base + (Math.random() - 0.5) * 10;
        return Math.round(heartRate);
    }

    // Simulate sensor data when real sensors unavailable
    function getSimulatedData() {
        const t = Date.now() / 1000;
        const stressWave = (Math.sin(t * 0.05) + 1) / 2; // 0-1 oscillation

        if (!sensorsAvailable.accelerometer) {
            const noise = stressWave * 5;
            accel = {
                x: Math.sin(t * 2) * noise + (Math.random() - 0.5) * 2,
                y: Math.cos(t * 1.5) * noise + (Math.random() - 0.5) * 2,
                z: 9.8 + Math.sin(t * 3) * noise * 0.5
            };
            if (Math.random() < stressWave * 0.3) shakeCount++;
        }

        if (!sensorsAvailable.gyroscope) {
            gyro = {
                alpha: Math.sin(t * 0.3) * 180,
                beta: Math.sin(t * 0.5) * 45 * (1 + stressWave),
                gamma: Math.cos(t * 0.4) * 30 * (1 + stressWave)
            };
            if (Math.random() < stressWave * 0.2) orientationChangeCount++;
        }

        if (!sensorsAvailable.gps) {
            const baseLat = 37.7749;
            const baseLng = -122.4194;
            prevGps = { ...gps };
            gps = {
                lat: baseLat + Math.sin(t * 0.01) * 0.001 * (1 + stressWave),
                lng: baseLng + Math.cos(t * 0.01) * 0.001 * (1 + stressWave)
            };
        }
    }

    function getLocationDelta() {
        if (!prevGps.lat || !gps.lat) return 0;
        const dlat = gps.lat - prevGps.lat;
        const dlng = gps.lng - prevGps.lng;
        return Math.sqrt(dlat * dlat + dlng * dlng) * 111000; // approx meters
    }

    function start() {
        screenStart = Date.now();
        shakeCount = 0;
        orientationChangeCount = 0;

        if (typeof DeviceMotionEvent !== 'undefined') {
            // Request permission on iOS 13+
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission().then((state) => {
                    if (state === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                    }
                }).catch(() => { });
            } else {
                window.addEventListener('devicemotion', handleMotion);
            }
        }

        if (typeof DeviceOrientationEvent !== 'undefined') {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then((state) => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                }).catch(() => { });
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        }

        startGPS();
    }

    function stop() {
        window.removeEventListener('devicemotion', handleMotion);
        window.removeEventListener('deviceorientation', handleOrientation);
        if (geoWatchId !== null) {
            navigator.geolocation.clearWatch(geoWatchId);
            geoWatchId = null;
        }
    }

    function collect() {
        getSimulatedData();

        const movementIntensity = Math.sqrt(accel.x ** 2 + accel.y ** 2 + (accel.z - 9.8) ** 2);
        const screenDuration = (Date.now() - screenStart) / 1000;
        const locationDelta = getLocationDelta();
        const hr = simulateHeartRate(movementIntensity / 15);

        const reading = {
            timestamp: Date.now(),
            accelerometer_x: +accel.x.toFixed(3),
            accelerometer_y: +accel.y.toFixed(3),
            accelerometer_z: +accel.z.toFixed(3),
            gyroscope_alpha: +gyro.alpha.toFixed(2),
            gyroscope_beta: +gyro.beta.toFixed(2),
            gyroscope_gamma: +gyro.gamma.toFixed(2),
            gps_latitude: gps.lat,
            gps_longitude: gps.lng,
            heart_rate: hr,
            screen_on_duration: +screenDuration.toFixed(1),
            movement_intensity: +movementIntensity.toFixed(3),
            shake_frequency: shakeCount,
            orientation_changes: orientationChangeCount,
            location_delta: +locationDelta.toFixed(2)
        };

        // Reset counters for next interval
        shakeCount = 0;
        orientationChangeCount = 0;

        return reading;
    }

    function getSensorsAvailable() {
        return sensorsAvailable;
    }

    return { start, stop, collect, getSensorsAvailable };
}