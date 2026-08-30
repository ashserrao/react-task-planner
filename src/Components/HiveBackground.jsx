import React, { useMemo } from "react";

// Traced outline of the Ashtro Dev mark (star + "A" glyph). Source bitmap is
// 1000x714; the path is rendered stroke-only so it reads as a watermark, not
// a filled logo.
const LOGO_WIDTH = 1000;
const LOGO_HEIGHT = 714;
const LOGO_PATH_D =
  "M 502.728 95 L 501.955 95 494.688 110.250 L 487.422 125.500 469.961 162.730 L 452.500 199.959 451.250 199.511 L 450 199.063 450 200.531 L 450 202 336.500 202 L 223 202 223.016 203.250 L 223.033 204.500 225.266 208.160 L 227.500 211.821 230.446 216.660 L 233.391 221.500 241.488 234 L 249.584 246.500 255.017 255.500 L 260.449 264.500 264.043 269.500 L 267.637 274.500 268.250 276 L 268.864 277.500 274.682 286.734 L 280.500 295.969 287.500 307.077 L 294.500 318.185 298.741 324.343 L 302.981 330.500 304.336 333.500 L 305.690 336.500 307.345 337.872 L 309 339.245 309 340.170 L 309 341.096 312.500 346.567 L 316 352.039 316 352.677 L 316 353.315 319.900 358.408 L 323.800 363.500 325.870 367.227 L 327.940 370.954 332.138 377.727 L 336.336 384.500 338.074 386.500 L 339.812 388.500 342.656 393.217 L 345.500 397.933 350.872 406.539 L 356.244 415.145 355.726 418.822 L 355.209 422.500 351.604 430.135 L 348 437.769 348 438.378 L 348 438.988 343.500 448.554 L 339 458.120 339 458.490 L 339 458.860 335.912 465.680 L 332.825 472.500 328.856 481 L 324.888 489.500 323.444 492.154 L 322 494.809 322 496.266 L 322 497.723 317.926 506.612 L 313.852 515.500 312.471 518.500 L 311.090 521.500 304.105 538 L 297.119 554.500 285.500 581 L 273.881 607.500 273.239 608.997 L 272.596 610.495 275.048 608.923 L 277.500 607.351 317.155 581.570 L 356.810 555.790 376.550 513.895 L 396.290 472 397.569 472 L 398.848 472 401.010 474.750 L 403.171 477.500 410.836 489.858 L 418.500 502.215 423.500 510.247 L 428.500 518.279 430.222 520.890 L 431.944 523.500 433.982 527 L 436.021 530.500 437.260 532.448 L 438.500 534.395 442.750 540.640 L 447 546.885 447 547.777 L 447 548.668 450.769 554.084 L 454.538 559.500 461.769 571.295 L 469 583.089 469 583.650 L 469 584.211 471.456 587.130 L 473.912 590.049 479.706 599.668 L 485.500 609.287 487.032 611.805 L 488.564 614.323 490.311 615.411 L 492.057 616.500 492.778 615.427 L 493.500 614.354 532.590 560.427 L 571.679 506.500 630.664 425 L 689.650 343.500 738.483 276 L 787.316 208.500 789.859 205.142 L 792.403 201.783 667.644 202.313 L 542.886 202.843 542.015 200.672 L 541.145 198.500 536.029 184 L 530.913 169.500 517.207 132.250 L 503.500 95.001 502.728 95 M 499.250 240.673 L 498.500 240.227 461.192 324.864 L 423.885 409.500 423.272 410.914 L 422.660 412.328 423.737 411.663 L 424.813 410.997 424.343 412.797 L 423.872 414.596 456.532 466.548 L 489.192 518.500 489.913 519.267 L 490.634 520.034 505.554 500.767 L 520.473 481.500 550.124 443.304 L 579.774 405.108 579.205 404.538 L 578.635 403.969 512.084 404.650 L 445.532 405.332 451.016 399.303 L 456.500 393.274 474.998 373.743 L 493.496 354.212 512.498 353.554 L 531.500 352.896 534.259 352.367 L 537.017 351.837 536.509 351.014 L 536 350.192 518 297.945 L 500 245.699 500 243.408 L 500 241.118 499.250 240.673 M 615.598 265 L 565 265 565 265.935 L 565 266.870 566.105 269.685 L 567.210 272.500 582.658 317.500 L 598.105 362.500 598.950 363.347 L 599.794 364.194 630.938 317.847 L 662.082 271.500 664.139 268.250 L 666.196 265 615.598 265 M 377.917 266.500 L 332.833 266.500 332.531 266.802 L 332.229 267.104 351.227 297.802 L 370.225 328.500 377.255 339.871 L 384.285 351.241 385.142 349.711 L 385.998 348.180 399.386 318.840 L 412.773 289.500 417.886 278.611 L 423 267.721 423 267.111 L 423 266.500 377.917 266.500 Z";

const buildHexPoints = (cx, cy, r) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
};

const useHiveGrid = (hexRadius, viewWidth, viewHeight) =>
  useMemo(() => {
    const horizSpacing = hexRadius * 1.5;
    const vertSpacing = hexRadius * Math.sqrt(3);
    const cols = Math.ceil(viewWidth / horizSpacing) + 2;
    const rows = Math.ceil(viewHeight / vertSpacing) + 2;
    const centerX = viewWidth / 2;
    const centerY = viewHeight / 2;
    const maxDist = Math.hypot(centerX, centerY);

    const cells = [];
    for (let col = -1; col < cols; col++) {
      for (let row = -1; row < rows; row++) {
        const cx = col * horizSpacing;
        const cy = row * vertSpacing + (col % 2 !== 0 ? vertSpacing / 2 : 0);
        const dist = Math.hypot(cx - centerX, cy - centerY);
        cells.push({
          key: `${col}-${row}`,
          points: buildHexPoints(cx, cy, hexRadius - 2),
          delay: (dist / maxDist) * 1.6,
        });
      }
    }
    return cells;
  }, [hexRadius, viewWidth, viewHeight]);

// Shared hive backdrop. `animated` reproduces the hero's pulsing cells;
// the static variant (larger, fewer cells) is used as a quiet watermark
// on the content sections so the whole site reads as one motif.
const HiveBackground = ({
  animated = false,
  hexRadius = 34,
  viewWidth = 800,
  viewHeight = 500,
}) => {
  const hiveCells = useHiveGrid(hexRadius, viewWidth, viewHeight);

  // Fit the logo inside the shorter axis of the viewBox, then center it.
  const logoScale =
    (Math.min(viewWidth, viewHeight) * 0.6) / Math.max(LOGO_WIDTH, LOGO_HEIGHT);
  const logoX = (viewWidth - LOGO_WIDTH * logoScale) / 2;
  const logoY = (viewHeight - LOGO_HEIGHT * logoScale) / 2;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {hiveCells.map(({ key, points, delay }) =>
          animated ? (
            <polygon
              key={key}
              points={points}
              fill="#8cfcfb"
              fillOpacity={0.12}
              stroke="#67C7EB"
              strokeWidth={1}
              className="hive-cell"
              style={{ animationDelay: `${delay}s` }}
            />
          ) : (
            <polygon
              key={key}
              points={points}
              fill="none"
              stroke="#67C7EB"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          )
        )}
        <g transform={`translate(${logoX}, ${logoY}) scale(${logoScale})`}>
          <path
            d={LOGO_PATH_D}
            fill="none"
            stroke="#67C7EB"
            strokeOpacity={animated ? 0.55 : 0.35}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default HiveBackground;
