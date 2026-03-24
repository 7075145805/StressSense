// Client-side stress classification model
// Implements a weighted feature scoring system similar to Random Forest output
// Features are normalized and weighted based on stress research literature

const FEATURE_WEIGHTS = {
    movement_intensity: 0.20,
    shake_frequency: 0.20,
    heart_rate: 0.25,
    screen_duration: 0.10,
    orientation_changes: 0.15,
    location_delta: 0.10
};

const FEATURE_THRESHOLDS = {
    movement_intensity: { low: 2, high: 8 },
    shake_frequency: { low: 1, high: 5 },
    heart_rate: { low: 75, high: 95 },
    screen_duration: { low: 300, high: 1800 },
    orientation_changes: { low: 2, high: 8 },
    location_delta: { low: 5, high: 50 }
};

function normalizeFeature(value, thresholds) {
    if (value <= thresholds.low) return 0;
    if (value >= thresholds.high) return 1;
    return (value - thresholds.low) / (thresholds.high - thresholds.low);
}

export function classifyStress(features) {
    let weightedScore = 0;
    const featureScores = {};

    for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
        const value = features[feature] || 0;
        const normalized = normalizeFeature(value, FEATURE_THRESHOLDS[feature]);
        featureScores[feature] = normalized;
        weightedScore += normalized * weight;
    }

    // Convert to 0-100 scale
    const stressScore = Math.min(100, Math.max(0, Math.round(weightedScore * 100)));

    // Classify
    let stressLevel;
    if (stressScore < 35) stressLevel = 'low';
    else if (stressScore < 65) stressLevel = 'medium';
    else stressLevel = 'high';

    return {
        stress_score: stressScore,
        stress_level: stressLevel,
        feature_scores: featureScores
    };
}

export function getStressColor(level) {
    switch (level) {
        case 'low': return '#14b8a6';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        default: return '#6b7280';
    }
}

export function getStressLabel(level) {
    switch (level) {
        case 'low': return 'Low Stress';
        case 'medium': return 'Medium Stress';
        case 'high': return 'High Stress';
        default: return 'Unknown';
    }
}