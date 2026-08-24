"""
export_circuits.py
==================
Exports real GPS-derived SVG circuit paths from FastF1 telemetry data.
Run: pip install fastf1 numpy && python export_circuits.py

Output: circuit_paths.json  — paste pathData + keyCoordinates into circuitData.ts
"""

import fastf1
import numpy as np
import json
import os

os.makedirs('cache', exist_ok=True)
fastf1.Cache.enable_cache('cache/')

SVG_W = 850
SVG_H = 520
PAD   = 45

# (circuitData.ts key, year, GP name, session type)
CIRCUITS = [
    ("silverstone",   2024, "British",      "R"),
    ("monaco",        2024, "Monaco",       "R"),
    ("spa",           2024, "Belgian",      "R"),
    ("spa_wec",       2024, "Belgian",      "R"),   # same track, WEC category
    ("monza",         2024, "Italian",      "R"),
    ("suzuka",        2024, "Japanese",     "R"),
    ("interlagos",    2024, "Brazilian",    "R"),
    ("bahrain",       2024, "Bahrain",      "R"),
    ("cota_f1",       2024, "United States","R"),
    ("mugello",       2023, "Tuscan",       "R"),
    ("assen",         2022, "Dutch",        "R"),
    ("nurburgring",   2023, "Eifel",        "R"),  # GP layout (not Nordschleife)
    ("misano",        2020, "Emilia Romagna","R"),
    ("jerez_motogp",  2023, "Spanish",      "R"),
    ("fuji_wec",      2022, "Japanese",     "R"),
]


def normalise_and_path(x_arr: np.ndarray, y_arr: np.ndarray, n_points: int = 150) -> str:
    """Scale GPS coordinates to SVG canvas preserving aspect ratio, return path string."""
    rx = x_arr.max() - x_arr.min()
    ry = y_arr.max() - y_arr.min()
    if rx == 0 or ry == 0:
        return ""
    scale = min((SVG_W - 2 * PAD) / rx, (SVG_H - 2 * PAD) / ry)
    nx = PAD + (x_arr - x_arr.min()) * scale
    ny = PAD + (y_arr.max() - y_arr) * scale   # flip Y: GPS Y increases up, SVG Y increases down

    # Centre within canvas
    x_offset = (SVG_W - (nx.max() - nx.min())) / 2 - nx.min()
    y_offset = (SVG_H - (ny.max() - ny.min())) / 2 - ny.min()
    nx += x_offset
    ny += y_offset

    # Downsample evenly
    idx = np.linspace(0, len(nx) - 1, n_points, dtype=int)
    pts = [f"{nx[i]:.1f},{ny[i]:.1f}" for i in idx]
    return "M " + " L ".join(pts) + " Z"


def extract_corners(x_arr: np.ndarray, y_arr: np.ndarray,
                    speed_arr: np.ndarray, n_corners: int = 8) -> list:
    """Find n lowest-speed points (corners/braking zones) and return SVG coords + speed."""
    rx = x_arr.max() - x_arr.min()
    ry = y_arr.max() - y_arr.min()
    scale = min((SVG_W - 2 * PAD) / rx, (SVG_H - 2 * PAD) / ry)

    # Downsample first, then find corners in downsampled set
    idx = np.linspace(0, len(x_arr) - 1, 150, dtype=int)
    x_s = x_arr[idx]
    y_s = y_arr[idx]
    sp_s = speed_arr[idx]

    # Sort by speed ascending, pick lowest n, then sort by track position
    corner_order = np.argsort(sp_s)[:n_corners]
    corner_order = sorted(corner_order)

    result = []
    for ci in corner_order:
        cx = PAD + (x_s[ci] - x_arr.min()) * scale
        cy = PAD + (y_arr.max() - y_s[ci]) * scale

        # Centre offset
        nx_full = PAD + (x_arr - x_arr.min()) * scale
        ny_full = PAD + (y_arr.max() - y_arr) * scale
        x_off = (SVG_W - (nx_full.max() - nx_full.min())) / 2 - nx_full.min()
        y_off = (SVG_H - (ny_full.max() - ny_full.min())) / 2 - ny_full.min()
        cx += x_off
        cy += y_off

        result.append({
            "x": round(float(cx), 1),
            "y": round(float(cy), 1),
            "speed": int(float(sp_s[ci])),
            "distancePct": round(float(ci) / 150, 2)
        })
    return result


output = {}
failed = []

for circuit_id, year, gp, session_type in CIRCUITS:
    print(f"\n[{circuit_id}] Loading {year} {gp} {session_type}...")
    try:
        sess = fastf1.get_session(year, gp, session_type)
        sess.load(telemetry=True, laps=True)

        lap = sess.laps.pick_fastest()
        if lap is None or lap.empty:
            raise ValueError("No fastest lap found")

        tel = lap.get_telemetry()
        if 'X' not in tel.columns or 'Y' not in tel.columns:
            raise ValueError("No X/Y telemetry columns")

        x = tel['X'].dropna().values.astype(float)
        y = tel['Y'].dropna().values.astype(float)
        spd = tel['Speed'].dropna().values.astype(float)

        # Align lengths
        min_len = min(len(x), len(y), len(spd))
        x, y, spd = x[:min_len], y[:min_len], spd[:min_len]

        if len(x) < 10:
            raise ValueError(f"Too few telemetry points: {len(x)}")

        path_str = normalise_and_path(x, y, n_points=150)
        corners  = extract_corners(x, y, spd, n_corners=8)

        output[circuit_id] = {
            "pathData":       path_str,
            "keyCoordinates": corners,
            "_meta": {
                "source":     "FastF1 GPS telemetry",
                "year":       year,
                "gp":         gp,
                "raw_points": len(x),
                "svg_points": 150,
            }
        }
        print(f"  OK — {len(x)} raw points -> 150 SVG points")

    except Exception as e:
        print(f"  FAILED — {e}")
        failed.append((circuit_id, str(e)))

# Write output
out_path = os.path.join(os.path.dirname(__file__), "circuit_paths.json")
with open(out_path, "w") as f:
    json.dump(output, f, indent=2)

print(f"\n{'='*50}")
print(f"Done. Exported {len(output)} circuits to circuit_paths.json")
if failed:
    print(f"Failed ({len(failed)}):")
    for cid, err in failed:
        print(f"  {cid}: {err}")
