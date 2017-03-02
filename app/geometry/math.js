const TO_RADIANS = Math.PI / 180;

export function toRadians(degrees) {
    return degrees * TO_RADIANS;
}

export function toDegrees(radians) {
    return radians / TO_RADIANS;
}

export function clampRadians(radians) {
    let clamped = radians;
    while (clamped < 0) {
        clamped += 2 * Math.PI;
    }
    while (clamped > 2 * Math.PI) {
        clamped -= 2 * Math.PI;
    }
    return clamped;
}

export function fastPow2(power) {
    if (power < 0) {
        return 1 / (1 << -power);
    }
    return 1 << power;
}

export function lerp(start, end, inter) {
    return start + (end - start) * inter;
}

export function invLerp(start, end, value) {
    return (value - start) / (end - start);
}

