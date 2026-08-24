"""
export_wrc_stages.py
====================
Queries OpenStreetMap Overpass API for road geometry along WRC special stages.
Exports normalised SVG paths to wrc_stage_paths.json.
"""

import requests
import json
import os
import math

SVG_W = 850
SVG_H = 520
PAD = 45

STAGES = [
    {"id": "wrc_finland", "name": "Ouninpohja Finland", "bbox": (62.05, 24.8, 62.35, 25.4)},
    {"id": "wrc_monaco", "name": "Col de Turini Monaco", "bbox": (43.95, 7.35, 44.05, 7.55)},
    {"id": "wrc_kenya", "name": "Naivasha Kenya", "bbox": (-0.85, 36.3, -0.55, 36.7)},
    {"id": "wrc_sweden", "name": "Umeå Sweden", "bbox": (63.7, 19.8, 64.1, 20.4)},
]

def query_osm_roads(bbox):
    south, west, north, east = bbox
    query = f"""
    [out:json][timeout:25];
    (
      way["highway"~"primary|secondary|tertiary|unclassified|track"]({south},{west},{north},{east});
    );
    out geom;
    """
    url = "https://overpass-api.de/api/interpreter"
    try:
        resp = requests.post(url, data={"data": query}, timeout=30)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"  OSM query error: {e}")
    return None

def normalise_points(coords, n_points=120):
    if not coords or len(coords) < 5:
        return ""
    xs = [pt[0] for pt in coords]
    ys = [pt[1] for pt in coords]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    rx = max_x - min_x
    ry = max_y - min_y
    if rx == 0 or ry == 0:
        return ""
    scale = min((SVG_W - 2 * PAD) / rx, (SVG_H - 2 * PAD) / ry)
    
    nx = [PAD + (x - min_x) * scale for x in xs]
    ny = [PAD + (max_y - y) * scale for y in ys]

    x_offset = (SVG_W - (max(nx) - min(nx))) / 2 - min(nx)
    y_offset = (SVG_H - (max(ny) - min(ny))) / 2 - min(ny)
    nx = [x + x_offset for x in nx]
    ny = [y + y_offset for y in ny]

    # Sample points
    step = max(1, len(nx) // n_points)
    sampled_pts = [f"{nx[i]:.1f},{ny[i]:.1f}" for i in range(0, len(nx), step)]
    return "M " + " L ".join(sampled_pts)

def main():
    output = {}
    for stage in STAGES:
        print(f"Exporting {stage['name']}...")
        data = query_osm_roads(stage["bbox"])
        pts = []
        if data and "elements" in data:
            for el in data["elements"]:
                if "geometry" in el:
                    for g in el["geometry"]:
                        pts.append((g["lon"], g["lat"]))
        if pts:
            path_str = normalise_points(pts)
            output[stage["id"]] = {
                "name": stage["name"],
                "pathData": path_str,
                "pointsCount": len(pts)
            }
            print(f"  OK: {len(pts)} road points found")
        else:
            print(f"  No points found for {stage['name']}")

    out_path = os.path.join(os.path.dirname(__file__), "wrc_stage_paths.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print("Done -> wrc_stage_paths.json")

if __name__ == "__main__":
    main()
