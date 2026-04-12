import math


def generate_field_svg(left_line=330, left_center=375, center=400,
                       right_center=375, right_line=330,
                       roof_type=None, turf_type=None):
    """Generate an SVG illustration of a baseball field with dimensions."""
    SCALE = 0.50
    CX = 155
    HOME_Y = 268
    W, H = 310, 278

    def to_xy(dist, angle_deg):
        r = math.radians(angle_deg)
        x = CX + dist * math.sin(r) * SCALE
        y = HOME_Y - dist * math.cos(r) * SCALE
        return (round(x, 1), round(y, 1))

    def f(pt):
        return f"{pt[0]},{pt[1]}"

    # Wall points (LF=−45°, LC=−22.5°, CF=0°, RC=+22.5°, RF=+45°)
    lf = to_xy(left_line, -45)
    lc = to_xy(left_center, -22.5)
    cf = to_xy(center, 0)
    rc = to_xy(right_center, 22.5)
    rf = to_xy(right_line, 45)

    # Infield geometry
    home = (CX, HOME_Y)
    b1 = to_xy(90, 45)         # 1st base
    b2 = to_xy(127.3, 0)       # 2nd base
    b3 = to_xy(90, -45)        # 3rd base
    mound = to_xy(60.5, 0)     # pitcher's mound

    # Build smooth wall path using catmull-rom → cubic bezier
    wall_pts = [lf, lc, cf, rc, rf]
    # Phantom endpoints: extend the curve naturally at each end
    p_start = (lf[0] - (lc[0] - lf[0]) * 0.5,
               lf[1] - (lc[1] - lf[1]) * 0.5)
    p_end = (rf[0] + (rf[0] - rc[0]) * 0.5,
             rf[1] + (rf[1] - rc[1]) * 0.5)
    pts = [p_start] + wall_pts + [p_end]

    tension = 0.4
    wall_segs = ""
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        c1x = p1[0] + tension * (p2[0] - p0[0]) / 3
        c1y = p1[1] + tension * (p2[1] - p0[1]) / 3
        c2x = p2[0] - tension * (p3[0] - p1[0]) / 3
        c2y = p2[1] - tension * (p3[1] - p1[1]) / 3
        wall_segs += f" C {c1x:.1f},{c1y:.1f} {c2x:.1f},{c2y:.1f} {f(p2)}"

    # wall_segs goes from lf to rf (catmull-rom from lf→lc→cf→rc→rf)
    wall_d = f"M {f(lf)}{wall_segs}"

    # Fair territory polygon: home → lf → [wall] → rf → home
    fair_poly = f"M {f(home)} L {f(lf)}{wall_segs} L {f(home)} Z"

    # Infield dirt: approximate D-shape (arc from ~1B to ~3B side)
    # Centered at midpoint between home and 2nd, radius ≈ 55px
    dirt_cy = (HOME_Y + b2[1]) / 2
    dirt_r = 52

    # Dimension label positions (20ft beyond wall)
    def label(dist, angle_deg, extra=22):
        return to_xy(dist + extra, angle_deg)

    lf_lbl = label(left_line, -45, 18)
    lc_lbl = label(left_center, -22.5, 20)
    cf_lbl = label(center, 0, 18)
    rc_lbl = label(right_center, 22.5, 20)
    rf_lbl = label(right_line, 45, 18)

    # Base square size
    bs = 4

    # Clamp label x to stay within SVG
    def clamp_x(x, margin=10):
        return max(margin, min(W - margin, x))

    # Surface/roof info line
    surface_parts = []
    if roof_type and roof_type.lower() not in ("unknown", ""):
        surface_parts.append(roof_type.capitalize())
    if turf_type and turf_type.lower() not in ("unknown", ""):
        surface_parts.append(turf_type.capitalize())
    surface_line = " · ".join(surface_parts)

    svg = f"""<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:8px;overflow:hidden;">
  <!-- Background (foul territory) -->
  <rect width="{W}" height="{H}" fill="#0a2e0a"/>

  <!-- Fair territory -->
  <path d="{fair_poly}" fill="#1a5c1a"/>

  <!-- Infield dirt -->
  <ellipse cx="{CX}" cy="{dirt_cy:.1f}" rx="{dirt_r}" ry="{dirt_r * 0.85:.1f}" fill="#8b6810" opacity="0.75"/>

  <!-- Foul lines -->
  <line x1="{home[0]}" y1="{home[1]}" x2="{lf[0]}" y2="{lf[1]}" stroke="white" stroke-width="1" opacity="0.5"/>
  <line x1="{home[0]}" y1="{home[1]}" x2="{rf[0]}" y2="{rf[1]}" stroke="white" stroke-width="1" opacity="0.5"/>

  <!-- Outfield wall -->
  <path d="{wall_d}" fill="none" stroke="#e8c040" stroke-width="2.5"/>

  <!-- Infield diamond (base paths) -->
  <polygon points="{f(home)} {f(b1)} {f(b2)} {f(b3)}" fill="none" stroke="white" stroke-width="1.5"/>

  <!-- Pitcher's mound -->
  <ellipse cx="{mound[0]}" cy="{mound[1]}" rx="5" ry="4" fill="#c8a050"/>

  <!-- Bases -->
  <polygon points="{home[0]-bs},{home[1]} {home[0]},{home[1]-bs} {home[0]+bs},{home[1]} {home[0]},{home[1]+bs}" fill="white"/>
  <rect x="{b1[0]-bs/2:.1f}" y="{b1[1]-bs/2:.1f}" width="{bs}" height="{bs}" fill="white" transform="rotate(45 {b1[0]} {b1[1]})"/>
  <rect x="{b2[0]-bs/2:.1f}" y="{b2[1]-bs/2:.1f}" width="{bs}" height="{bs}" fill="white" transform="rotate(45 {b2[0]} {b2[1]})"/>
  <rect x="{b3[0]-bs/2:.1f}" y="{b3[1]-bs/2:.1f}" width="{bs}" height="{bs}" fill="white" transform="rotate(45 {b3[0]} {b3[1]})"/>

  <!-- Dimension labels -->
  <text x="{clamp_x(lf_lbl[0]):.1f}" y="{lf_lbl[1]:.1f}" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="600">{left_line}'</text>
  <text x="{clamp_x(lc_lbl[0]):.1f}" y="{lc_lbl[1]:.1f}" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="600">{left_center}'</text>
  <text x="{cf_lbl[0]:.1f}" y="{cf_lbl[1]:.1f}" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="600">{center}'</text>
  <text x="{clamp_x(rc_lbl[0]):.1f}" y="{rc_lbl[1]:.1f}" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="600">{right_center}'</text>
  <text x="{clamp_x(rf_lbl[0]):.1f}" y="{rf_lbl[1]:.1f}" fill="white" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="600">{right_line}'</text>

  <!-- Surface info -->
  {f'<text x="{CX}" y="{H - 5}" fill="#aaa" font-size="9" font-family="sans-serif" text-anchor="middle">{surface_line}</text>' if surface_line else ''}
</svg>"""
    return svg


if __name__ == "__main__":
    # Test with default Coors Field-ish dimensions
    svg = generate_field_svg(347, 390, 415, 375, 350,
                             roof_type="open", turf_type="grass")
    with open("test_field.html", "w") as f:
        f.write(f"<html><body style='background:#222'>{svg}</body></html>")
    print("Wrote test_field.html")
