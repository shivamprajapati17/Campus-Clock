#!/usr/bin/env python3
"""Generate Campus Clock launcher icons (no third-party imaging library)."""

import math
import os
import struct
import zlib

CREAM = (255, 245, 235)
CORAL = (255, 107, 112)
BUTTER = (255, 230, 109)
INK = (23, 23, 23)

SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}


def inside_round_rect(x, y, inset, radius):
    left = inset
    top = inset
    right = 1.0 - inset
    bottom = 1.0 - inset
    if x < left or x > right or y < top or y > bottom:
        return False
    cx = min(max(x, left + radius), right - radius)
    cy = min(max(y, top + radius), bottom - radius)
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2


def segment_distance(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    length2 = vx * vx + vy * vy
    t = 0.0 if length2 == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / length2))
    dx, dy = px - (ax + t * vx), py - (ay + t * vy)
    return math.hypot(dx, dy)


def sample(x, y):
    """Colour of one sample point in 0..1 icon space."""
    # Background plate with rounded corners.
    if not inside_round_rect(x, y, 0.015, 0.20):
        return (0, 0, 0, 0)

    border = not inside_round_rect(x, y, 0.055, 0.17)
    if border:
        return INK + (255,)

    colour = CORAL + (255,)

    # Clock face.
    cx, cy = 0.5, 0.5
    radius = 0.255
    dist = math.hypot(x - cx, y - cy)

    if dist <= radius:
        colour = BUTTER + (255,)

    # Clock ring.
    if radius - 0.050 <= dist <= radius:
        colour = INK + (255,)

    # Hands: 12 o'clock and 4 o'clock, plus the centre pin.
    if dist <= radius - 0.050:
        if segment_distance(x, y, cx, cy, cx, cy - 0.155) <= 0.024:
            colour = INK + (255,)
        if segment_distance(x, y, cx, cy, cx + 0.120, cy + 0.088) <= 0.020:
            colour = INK + (255,)
        if dist <= 0.032:
            colour = INK + (255,)

    return colour


def render(size):
    ss = 4
    pixels = bytearray()
    for py in range(size):
        for px in range(size):
            r = g = b = a = 0
            for sy in range(ss):
                for sx in range(ss):
                    x = (px + (sx + 0.5) / ss) / size
                    y = (py + (sy + 0.5) / ss) / size
                    sr, sg, sb, sa = sample(x, y)
                    if sa:
                        r += sr
                        g += sg
                        b += sb
                        a += sa
            n = ss * ss
            opaque = a / 255
            if opaque:
                # Average only the opaque samples, then apply coverage alpha so
                # the rounded corners stay clean instead of darkening.
                pixels += bytes((
                    round(r / opaque),
                    round(g / opaque),
                    round(b / opaque),
                    round(255 * opaque / n),
                ))
            else:
                pixels += bytes((0, 0, 0, 0))
    return bytes(pixels)


def write_png(path, size, rgba):
    def chunk(tag, data):
        payload = tag + data
        return struct.pack(">I", len(data)) + payload + struct.pack(
            ">I", zlib.crc32(payload) & 0xFFFFFFFF
        )

    raw = b"".join(
        b"\x00" + rgba[y * size * 4:(y + 1) * size * 4] for y in range(size)
    )
    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as handle:
        handle.write(png)


if __name__ == "__main__":
    root = os.path.join(os.path.dirname(__file__), "..", "app", "res")
    for density, size in SIZES.items():
        target = os.path.join(root, f"mipmap-{density}", "ic_launcher.png")
        write_png(target, size, render(size))
        print(f"{target} ({size}x{size})")
