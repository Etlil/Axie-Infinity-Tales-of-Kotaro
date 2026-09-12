// Local vector scenery for the route and prototype corrupted creatures.
// Animated Kotaro/Buba and painted environments are composed in world.js.
const C = {
  paper: 0xf0efda, grass: 0xd5dfb4, grassLight: 0xe2e8c7,
  moss: 0xa9c690, leaf: 0x72996b, deepLeaf: 0x3b7155,
  ink: 0x315649, sand: 0xf4e9c8, sandEdge: 0xc9cca2,
  water: 0x7bbdb5, waterLight: 0xa2d3c4, waterDeep: 0x609f9e,
};

function random(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function oval(g, color, x, y, w, h, alpha = 1) {
  g.fillStyle(color, alpha).fillEllipse(x, y, w, h);
}

function polygon(g, color, points, alpha = 1) {
  g.fillStyle(color, alpha).fillPoints(points.map(([x, y]) => ({ x, y })), true);
}

// A sampled Catmull-Rom curve keeps every outline soft without bitmap assets.
function curve(points, closed = true, resolution = 10) {
  const list = points.map(([x, y]) => ({ x, y }));
  const result = [];
  const count = closed ? list.length : list.length - 1;
  const at = (i) => list[closed ? (i + list.length) % list.length : Math.max(0, Math.min(list.length - 1, i))];
  for (let i = 0; i < count; i += 1) {
    const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2);
    for (let j = 0; j < resolution; j += 1) {
      const t = j / resolution, t2 = t * t, t3 = t2 * t;
      result.push({
        x: 0.5 * ((2 * b.x) + (-a.x + c.x) * t + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * t2 + (-a.x + 3 * b.x - 3 * c.x + d.x) * t3),
        y: 0.5 * ((2 * b.y) + (-a.y + c.y) * t + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * t2 + (-a.y + 3 * b.y - 3 * c.y + d.y) * t3),
      });
    }
  }
  if (!closed) result.push(list[list.length - 1]);
  return result;
}

function blob(g, color, points, alpha = 1) {
  g.fillStyle(color, alpha).fillPoints(curve(points), true);
}

function line(g, color, width, points, alpha = 1) {
  g.lineStyle(width, color, alpha).strokePoints(curve(points, false), false);
}

function hill(g, x, y, w, h, color) {
  oval(g, color, x, y, w, h);
  line(g, 0xffffff, 1.5, [[x - w * 0.33, y - h * 0.08], [x - w * 0.1, y - h * 0.28], [x + w * 0.2, y - h * 0.26]], 0.28);
}

function tree(g, x, y, size = 1, variant = 0) {
  const greens = [0x769d72, 0x8aac7b, 0x5d8c68, 0x9abb86];
  const color = greens[variant % greens.length];
  oval(g, 0x577553, x + 7 * size, y + 12 * size, 65 * size, 22 * size, 0.12);
  g.fillStyle(0x827b51).fillRoundedRect(x - 3 * size, y - 17 * size, 7 * size, 30 * size, 3 * size);
  oval(g, 0x527957, x, y - 18 * size, 63 * size, 50 * size);
  oval(g, color, x - 19 * size, y - 23 * size, 34 * size, 37 * size);
  oval(g, color, x + 19 * size, y - 25 * size, 35 * size, 36 * size);
  oval(g, color, x, y - 39 * size, 46 * size, 45 * size);
  oval(g, color, x + 1 * size, y - 20 * size, 55 * size, 37 * size);
  oval(g, 0xc9dca2, x - 9 * size, y - 49 * size, 18 * size, 8 * size, 0.35);
  oval(g, 0xc9dca2, x + 20 * size, y - 33 * size, 9 * size, 5 * size, 0.28);
  g.lineStyle(1.25 * size, 0x476e4e, 0.35).lineBetween(x + 8 * size, y - 19 * size, x + 15 * size, y - 27 * size);
}

function fir(g, x, y, size = 1, light = false) {
  oval(g, 0x426e4e, x + 5 * size, y + 4 * size, 42 * size, 13 * size, 0.13);
  g.fillStyle(0x7b7851).fillRect(x - 2 * size, y - 17 * size, 4 * size, 23 * size);
  const color = light ? 0x83a87b : 0x608b67;
  polygon(g, color, [[x, y - 67 * size], [x - 18 * size, y - 31 * size], [x - 11 * size, y - 32 * size], [x - 27 * size, y - 6 * size], [x, y + 3 * size], [x + 26 * size, y - 6 * size], [x + 12 * size, y - 32 * size], [x + 19 * size, y - 31 * size]]);
  polygon(g, 0xc1d39a, [[x, y - 65 * size], [x - 17 * size, y - 32 * size], [x - 9 * size, y - 35 * size], [x - 24 * size, y - 7 * size], [x - 2 * size, y - 3 * size]], 0.22);
}

function bush(g, x, y, size = 1, color = 0x92b47f) {
  oval(g, 0x779366, x, y + 2 * size, 41 * size, 12 * size, 0.16);
  oval(g, color, x - 13 * size, y - 5 * size, 22 * size, 20 * size);
  oval(g, color, x + 10 * size, y - 6 * size, 26 * size, 22 * size);
  oval(g, color, x, y - 13 * size, 25 * size, 26 * size);
  oval(g, 0xd5dfa8, x - 4 * size, y - 21 * size, 8 * size, 4 * size, 0.45);
}

function flowers(g, x, y, scale = 1, color = 0xf6e7a1) {
  for (const [dx, dy] of [[0, 0], [11, 6], [-9, 8]]) {
    g.lineStyle(scale, 0x8ea679, 0.8).lineBetween(x + dx * scale, y + dy * scale, x + dx * scale, y + (dy + 6) * scale);
    oval(g, color, x + dx * scale, y + dy * scale, 5 * scale, 5 * scale);
    oval(g, 0xd2ad66, x + dx * scale, y + dy * scale, 1.5 * scale, 1.5 * scale);
  }
}

function rock(g, x, y, scale = 1) {
  oval(g, 0x6b856b, x + 3 * scale, y + 3 * scale, 28 * scale, 9 * scale, 0.18);
  polygon(g, 0xa9b4a0, [[x - 14 * scale, y], [x - 10 * scale, y - 10 * scale], [x + 1 * scale, y - 16 * scale], [x + 12 * scale, y - 9 * scale], [x + 15 * scale, y + 1 * scale], [x + 4 * scale, y + 5 * scale]]);
  polygon(g, 0xc8ceb5, [[x - 14 * scale, y], [x - 10 * scale, y - 10 * scale], [x + 1 * scale, y - 16 * scale], [x + 2 * scale, y - 3 * scale], [x - 4 * scale, y + 3 * scale]]);
}

function cottage(g, x, y, scale = 1, roof = 0xc58255) {
  const p = (points) => points.map(([dx, dy]) => [x + dx * scale, y + dy * scale]);
  oval(g, 0x647b55, x + 12 * scale, y + 15 * scale, 98 * scale, 31 * scale, 0.17);
  polygon(g, 0xe8d9b4, p([[-36, -34], [25, -34], [25, 15], [-36, 15]]));
  polygon(g, 0xc8b995, p([[25, -34], [46, -44], [46, 4], [25, 15]]));
  polygon(g, 0xf4e6c5, p([[-36, -34], [-6, -61], [25, -34]]));
  polygon(g, 0xa86d48, p([[-43, -34], [-7, -68], [51, -53], [51, -40], [23, -26]]));
  polygon(g, roof, p([[-7, -68], [24, -31], [53, -44], [22, -77]]));
  polygon(g, 0xe0a470, p([[-45, -34], [-7, -71], [26, -32], [21, -28], [-7, -59], [-38, -29]]));
  g.lineStyle(1 * scale, 0x8d674d, 0.35);
  for (let i = 0; i < 4; i += 1) {
    g.lineBetween(x + (2 + i * 5) * scale, y + (-62 + i * 6) * scale, x + (29 + i * 5) * scale, y + (-73 + i * 6) * scale);
  }
  g.fillStyle(0x826948).fillRoundedRect(x - 14 * scale, y - 16 * scale, 17 * scale, 31 * scale, { tl: 8 * scale, tr: 8 * scale, bl: 0, br: 0 });
  oval(g, 0xe8c279, x - 1 * scale, y + 1 * scale, 3 * scale, 3 * scale);
  g.fillStyle(0x819b81).fillRoundedRect(x - 30 * scale, y - 18 * scale, 11 * scale, 14 * scale, 2 * scale);
  g.fillStyle(0xf5e9c9).fillRect(x - 25.5 * scale, y - 18 * scale, 2 * scale, 14 * scale);
  g.fillRect(x - 30 * scale, y - 12 * scale, 11 * scale, 2 * scale);
  polygon(g, 0xf8efcf, p([[33, -23], [40, -26], [40, -12], [33, -9]]));
  polygon(g, 0xd0c6a7, p([[-18, 15], [7, 15], [11, 21], [-24, 21]]));
  bush(g, x - 37 * scale, y + 10 * scale, scale * 0.42, 0x7e9e6b);
  flowers(g, x + 18 * scale, y + 12 * scale, scale * 0.7, 0xf5d49c);
}

function gate(g, x, y, scale = 1) {
  oval(g, 0x607b5f, x, y + 17 * scale, 117 * scale, 30 * scale, 0.16);
  const p = (points) => points.map(([dx, dy]) => [x + dx * scale, y + dy * scale]);
  polygon(g, 0xa3af93, p([[-48, 5], [-48, -56], [-35, -88], [-18, -103], [20, -103], [40, -83], [49, -54], [49, 6], [25, 12], [25, -45], [15, -66], [-13, -66], [-25, -45], [-25, 12]]));
  polygon(g, 0xd1d6b7, p([[-49, 5], [-49, -58], [-35, -89], [-18, -104], [20, -104], [40, -84], [33, -75], [14, -91], [-13, -90], [-26, -76], [-36, -51], [-35, 5]]));
  g.lineStyle(2 * scale, 0x778b74, 0.45);
  for (const [a, b, c, d] of [[-48, -32, -25, -30], [-45, -59, -25, -49], [-32, -91, -15, -68], [-5, -102, -5, -68], [22, -100, 14, -67], [39, -78, 22, -59], [49, -43, 25, -38], [49, -16, 25, -14]]) {
    g.lineBetween(x + a * scale, y + b * scale, x + c * scale, y + d * scale);
  }
  blob(g, 0x719166, p([[-50, -43], [-54, -62], [-40, -86], [-27, -92], [-30, -77], [-42, -63], [-40, -43]]));
  bush(g, x + 44 * scale, y + 6 * scale, scale * 0.62, 0x78976b);
  bush(g, x - 49 * scale, y + 9 * scale, scale * 0.42);
  polygon(g, 0xd9e4b7, p([[-5, -91], [0, -98], [5, -91], [0, -83]]));
  rock(g, x - 31 * scale, y + 16 * scale, scale * 0.8);
  rock(g, x + 28 * scale, y + 18 * scale, scale * 0.6);
}

function bridge(g, x1, y1, x2, y2, width = 23) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / length, ny = (x2 - x1) / length;
  g.lineStyle(width + 5, 0x537e70, 0.2).lineBetween(x1 + 4, y1 + 7, x2 + 4, y2 + 7);
  g.lineStyle(width, 0xba9b6f).lineBetween(x1, y1, x2, y2);
  g.lineStyle(width - 3, 0xd9bd8d).lineBetween(x1, y1, x2, y2);
  for (let d = 2; d < length; d += 8) {
    const x = x1 + ((x2 - x1) * d) / length, y = y1 + ((y2 - y1) * d) / length;
    g.lineStyle(1, 0x967c58, 0.66).lineBetween(x + nx * width / 2, y + ny * width / 2, x - nx * width / 2, y - ny * width / 2);
  }
  for (const side of [-1, 1]) {
    g.lineStyle(2.4, 0x9a815c).lineBetween(x1 + nx * side * (width / 2 - 1), y1 + ny * side * (width / 2 - 1) - 5, x2 + nx * side * (width / 2 - 1), y2 + ny * side * (width / 2 - 1) - 5);
    for (const t of [0, 0.5, 1]) {
      const x = x1 + (x2 - x1) * t + nx * side * width / 2, y = y1 + (y2 - y1) * t + ny * side * width / 2;
      g.lineStyle(3.5, 0x927953).lineBetween(x, y - 9, x, y + 3);
      oval(g, 0xe4c89b, x - 0.5, y - 9, 4, 2);
    }
  }
}

function lily(g, x, y, scale = 1, flower = false) {
  oval(g, 0x497f70, x, y + scale, 19 * scale, 8 * scale, 0.32);
  oval(g, 0x7da985, x, y, 19 * scale, 8 * scale);
  g.lineStyle(scale, 0x578b77).lineBetween(x, y, x + 8 * scale, y - 2 * scale);
  if (flower) {
    oval(g, 0xf7e6c5, x - 2 * scale, y - 3 * scale, 8 * scale, 6 * scale);
    oval(g, 0xeeb5a4, x + 1 * scale, y - 4 * scale, 6 * scale, 7 * scale);
    oval(g, 0xf4d894, x, y - 3 * scale, 3 * scale, 3 * scale);
  }
}

function mapWorld(scene) {
  const g = scene.add.graphics();
  const rand = random(3108);
  g.fillStyle(C.paper).fillRect(0, 0, 1200, 660);
  blob(g, 0xe5e7c9, [[-90, 70], [160, 0], [450, 22], [654, -15], [997, 16], [1270, 80], [1230, 350], [1125, 540], [846, 625], [641, 604], [328, 682], [71, 560], [-80, 393]]);
  blob(g, 0xd6dfb4, [[-34, 212], [138, 119], [367, 152], [481, 105], [650, 148], [898, 121], [1182, 194], [1249, 380], [1103, 540], [891, 566], [681, 555], [471, 606], [188, 552], [30, 420]]);
  blob(g, 0xdfe5bf, [[-20, 260], [158, 223], [360, 249], [507, 205], [674, 247], [651, 424], [498, 472], [339, 566], [167, 507], [3, 450]]);
  hill(g, 315, 161, 278, 116, 0xd0dcb0);
  hill(g, 877, 160, 307, 115, 0xcbd9a9);
  hill(g, 1048, 414, 316, 160, 0xc8d7a5);
  hill(g, 429, 512, 261, 116, 0xcbdbae);
  hill(g, 147, 343, 235, 111, 0xd0ddb0);

  // The lagoon has a softly layered shoreline, a little island, and a bridge.
  const lake = [[593, 311], [662, 260], [780, 259], [849, 274], [941, 294], [1008, 352], [993, 415], [930, 460], [828, 479], [728, 459], [636, 421], [582, 372]];
  const expand = (points, sx, sy) => points.map(([x, y]) => [790 + (x - 790) * sx, 365 + (y - 365) * sy]);
  blob(g, 0xbed2a6, expand(lake, 1.12, 1.2));
  blob(g, C.sand, expand(lake, 1.055, 1.08));
  blob(g, 0xa5cbb5, expand(lake, 1.02, 1.02));
  blob(g, C.water, lake);
  blob(g, 0x6db1aa, expand(lake, 0.91, 0.84), 0.57);
  g.lineStyle(1.7, 0xd2e5cc, 0.68).strokePoints(curve(expand(lake, 0.96, 0.91)), true);
  g.lineStyle(1, 0xc0dfcd, 0.38).strokePoints(curve(expand(lake, 0.84, 0.7)), true);
  for (const [x, y, w] of [[679, 296, 26], [790, 309, 45], [910, 337, 30], [885, 414, 47], [750, 440, 30], [940, 378, 24], [647, 385, 22], [804, 393, 20], [833, 287, 13]]) {
    line(g, 0xe2ecda, 2, [[x - w / 2, y], [x, y + 2], [x + w / 2, y]], 0.56);
    line(g, 0xe2ecda, 1, [[x - w / 3, y + 6], [x, y + 7], [x + w / 4, y + 6]], 0.26);
  }
  blob(g, 0xcbd6a8, [[648, 342], [671, 318], [721, 317], [765, 342], [773, 367], [750, 389], [692, 393], [655, 373]]);
  blob(g, C.sand, [[653, 340], [678, 317], [720, 316], [761, 337], [767, 361], [746, 379], [692, 383], [657, 367]]);
  blob(g, 0xcbdcae, [[658, 338], [682, 320], [720, 320], [755, 338], [760, 357], [740, 371], [694, 376], [662, 364]]);

  // Trails form a readable route from the village through the lagoon to ruins.
  const trails = [
    [[135, 478], [222, 453], [286, 425], [384, 428], [441, 411], [495, 395], [558, 397], [608, 381], [655, 363], [709, 355]],
    [[746, 350], [799, 332], [852, 314], [896, 291], [949, 276], [995, 254], [1045, 200]],
    [[297, 427], [323, 365], [306, 317], [340, 272], [399, 250], [432, 214]],
  ];
  for (const points of trails) {
    line(g, 0xb8bf95, 23, points, 0.38);
    line(g, 0xefe3be, 19, points);
    line(g, 0xf6ebcc, 11, points, 0.9);
  }
  bridge(g, 604, 381, 660, 363, 24);
  bridge(g, 755, 348, 863, 311, 22);

  // Midground woods are intentionally in clusters, leaving the route open.
  const clusters = [[95, 214, 85, 26, 8], [202, 199, 57, 25, 6], [470, 203, 62, 29, 9], [563, 157, 56, 23, 6], [787, 198, 76, 23, 8], [1079, 258, 63, 48, 12], [1090, 454, 70, 39, 11], [551, 516, 69, 28, 8], [128, 519, 75, 31, 10]];
  for (const [cx, cy, spreadX, spreadY, count] of clusters) {
    const trees = [];
    for (let i = 0; i < count; i += 1) trees.push({ x: cx + (rand() - 0.5) * spreadX * 2, y: cy + (rand() - 0.5) * spreadY * 2, size: 0.7 + rand() * 0.48, variant: Math.floor(rand() * 4) });
    trees.sort((a, b) => a.y - b.y).forEach((t, i) => i % 4 === 0 ? fir(g, t.x, t.y, t.size, t.variant > 1) : tree(g, t.x, t.y, t.size, t.variant));
  }

  // The village: terracotta roofs, a garden, a well, and a lantern-lined lane.
  oval(g, 0xd8d9ae, 280, 424, 234, 118, 0.6);
  oval(g, 0xe9dfb8, 293, 424, 184, 84, 0.7);
  cottage(g, 236, 385, 0.73, 0xbd875e);
  cottage(g, 344, 393, 0.82, 0xbc7852);
  cottage(g, 303, 472, 0.97, 0xc88b59);
  cottage(g, 203, 463, 0.61, 0xb48b61);
  // Well beside the village square.
  oval(g, 0x7c8c70, 366, 439, 37, 13, 0.16);
  g.fillStyle(0xb2b59b).fillRoundedRect(350, 421, 29, 17, 5);
  oval(g, 0xd0ccb0, 364.5, 421, 29, 12);
  oval(g, 0x778b7b, 364.5, 421, 18, 7);
  g.lineStyle(3, 0xa08c66).lineBetween(353, 423, 353, 404).lineBetween(376, 423, 376, 404);
  polygon(g, 0xc28f60, [[346, 406], [364, 394], [384, 406], [373, 413], [353, 412]]);
  // A small vegetable bed.
  polygon(g, 0xb7a97d, [[167, 420], [195, 413], [214, 427], [185, 436]]);
  for (let i = 0; i < 3; i += 1) {
    g.lineStyle(2, 0x8f9570).lineBetween(175 + i * 7, 420 + i * 3, 194 + i * 4, 417 + i * 4);
    bush(g, 180 + i * 8, 425 + i * 2, 0.18, 0x8ca773);
  }
  tree(g, 395, 457, 0.9, 1);
  tree(g, 173, 392, 0.72, 2);
  tree(g, 410, 348, 0.85, 1);
  tree(g, 619, 304, 0.73, 0);
  bush(g, 675, 331, 0.7);
  tree(g, 926, 232, 0.77, 2);
  gate(g, 978, 272, 0.91);
  fir(g, 1031, 236, 0.88, true);
  fir(g, 900, 257, 0.65, true);
  bush(g, 489, 362, 0.7, 0x9bb87f);
  rock(g, 521, 423, 0.64);
  rock(g, 529, 427, 0.39);

  for (const [x, y, s, bloom] of [[894, 374, 1, true], [916, 391, 0.7, false], [843, 443, 0.8, true], [861, 449, 0.5, false], [619, 343, 0.65, false], [973, 352, 0.5, true]]) lily(g, x, y, s, bloom);
  // Reeds around the shallow edge.
  for (const [x, y] of [[619, 414], [674, 450], [962, 424], [997, 336], [801, 479]]) {
    for (let i = 0; i < 5; i += 1) {
      const dx = i * 4 - 8;
      g.lineStyle(1.5, 0x87a67b, 0.85).lineBetween(x + dx, y, x + dx * 1.4, y - 12 - (i % 3) * 4);
    }
  }
  for (const [x, y, s] of [[162, 288, 0.8], [392, 294, 0.8], [433, 457, 0.9], [455, 372, 0.8], [573, 344, 0.7], [330, 532, 1], [887, 512, 0.8], [1030, 373, 0.8], [706, 493, 0.8], [933, 304, 0.65], [695, 343, 0.7]]) flowers(g, x, y, s);
  for (const [x, y, s] of [[83, 359, 0.7], [443, 275, 0.65], [889, 218, 0.5], [1042, 334, 0.8], [991, 485, 0.6], [378, 505, 0.75], [495, 544, 0.65]]) rock(g, x, y, s);
  // Tiny grass strokes give the open meadows a drawn-on-paper texture.
  for (let i = 0; i < 110; i += 1) {
    const x = 65 + rand() * 1060, y = 160 + rand() * 420;
    if ((x > 555 && x < 1025 && y > 250 && y < 490) || (x > 180 && x < 398 && y > 355 && y < 490)) continue;
    g.lineStyle(1, 0x92ac79, 0.26).lineBetween(x, y, x - 2, y - 4).lineBetween(x + 3, y, x + 5, y - 5);
  }
  // Four soft clouds make the framed map feel like a living storybook.
  for (const [x, y, s] of [[157, 94, 1], [621, 83, 0.8], [1080, 93, 0.7]]) {
    oval(g, 0xf8f5e5, x, y, 96 * s, 20 * s, 0.68);
    oval(g, 0xf8f5e5, x - 17 * s, y - 7 * s, 42 * s, 27 * s, 0.72);
    oval(g, 0xf8f5e5, x + 11 * s, y - 9 * s, 46 * s, 33 * s, 0.72);
  }
  // A subtle compass rose, drawn without text.
  const cx = 1090, cy = 558;
  g.lineStyle(1, 0x859572, 0.4).strokeCircle(cx, cy, 27);
  g.lineStyle(1, 0x859572, 0.3).strokeCircle(cx, cy, 20);
  polygon(g, 0x6f8665, [[cx, cy - 34], [cx - 6, cy], [cx, cy + 15], [cx + 6, cy]], 0.75);
  polygon(g, 0xf2edcf, [[cx, cy - 34], [cx, cy + 15], [cx + 6, cy]], 0.9);
  polygon(g, 0x91a17a, [[cx - 24, cy], [cx, cy - 4], [cx + 24, cy], [cx, cy + 4]], 0.8);
  oval(g, 0x6f8665, cx, cy, 5, 5);
  return g;
}

function scenicWorld(scene, mode) {
  const g = scene.add.graphics();
  const village = mode === 'village';
  g.fillStyle(0xeeeeda).fillRect(0, 0, 1200, 660);
  oval(g, 0xf8efd2, 955, 111, 113, 113, 0.8);
  blob(g, 0xd7dec1, [[-50, 310], [37, 209], [169, 183], [330, 255], [487, 193], [653, 167], [842, 234], [1031, 175], [1240, 263], [1240, 450], [-40, 450]]);
  blob(g, 0xb8cca7, [[-80, 335], [89, 281], [215, 254], [381, 304], [542, 270], [714, 226], [888, 268], [1090, 216], [1260, 306], [1230, 442], [-40, 449]]);
  blob(g, 0xcad8ad, [[-60, 389], [105, 320], [227, 332], [424, 369], [658, 306], [838, 349], [1016, 295], [1260, 356], [1250, 450], [-70, 450]]);
  if (!village) {
    blob(g, 0x9bcbbb, [[-20, 389], [140, 369], [314, 370], [506, 343], [755, 327], [937, 355], [1231, 363], [1240, 459], [-60, 468]]);
    blob(g, 0x84bab0, [[35, 397], [231, 389], [451, 373], [624, 352], [835, 351], [1037, 375], [1230, 385], [1230, 439], [37, 442]], 0.6);
    for (const [x, y, w] of [[192, 387, 84], [390, 410, 46], [578, 380, 100], [719, 404, 57], [952, 386, 88], [1095, 406, 52], [498, 355, 53]]) line(g, 0xdeead1, 2, [[x, y], [x + w * 0.5, y + 1], [x + w, y]], 0.4);
    lily(g, 836, 410, 1.1, true);
    lily(g, 879, 422, 0.8);
    rock(g, 1045, 370, 1.7);
    gate(g, 983, 318, 0.87);
  } else {
    cottage(g, 297, 392, 2.08, 0xc18b5d);
    cottage(g, 706, 355, 1.12, 0xb8845b);
    cottage(g, 1030, 386, 1.64, 0xb97752);
    line(g, 0xe4d8b2, 64, [[599, 343], [571, 395], [590, 436]]);
  }
  // Detailed edge trees frame a broad, unobstructed fighting space.
  tree(g, 67, 377, 2.45, 2);
  tree(g, 155, 347, 1.55, 1);
  fir(g, 26, 339, 2.8, true);
  tree(g, 1138, 382, 2.14, 0);
  fir(g, 1068, 349, 1.7, true);
  tree(g, 1227, 365, 2.6, 2);
  blob(g, 0xb7cc97, [[-15, 417], [191, 407], [379, 421], [572, 412], [789, 421], [1003, 410], [1220, 417], [1220, 457], [-20, 459]]);
  blob(g, 0xd7ddb5, [[-15, 431], [191, 423], [379, 435], [572, 425], [789, 433], [1003, 424], [1220, 430], [1220, 660], [-20, 660]]);
  g.fillStyle(0xe4e2c4).fillRect(0, 471, 1200, 189);
  g.lineStyle(1, 0xc8cfaa, 0.6).lineBetween(0, 471, 1200, 471);
  // The lower ground is deliberately quiet for timed dodge lanes.
  for (const [x, y, s] of [[85, 431, 1.5], [192, 437, 0.8], [1010, 442, 0.85], [1122, 429, 1.3]]) flowers(g, x, y, s);
  bush(g, 5, 437, 2.4, 0x759866);
  bush(g, 1192, 439, 2, 0x819f69);
  rock(g, 87, 447, 1.1);
  rock(g, 1094, 446, 0.8);
  for (const [x, y] of [[248, 448], [441, 451], [796, 449], [940, 439]]) {
    g.lineStyle(1.3, 0x9eb181, 0.5).lineBetween(x, y, x - 4, y - 6).lineBetween(x + 4, y, x + 5, y - 8);
  }
  for (const [x, y, s] of [[273, 110, 1], [697, 127, 0.74], [1081, 84, 0.65]]) {
    oval(g, 0xf9f6e7, x, y, 130 * s, 26 * s, 0.7);
    oval(g, 0xf9f6e7, x - 25 * s, y - 10 * s, 56 * s, 34 * s, 0.8);
    oval(g, 0xf9f6e7, x + 8 * s, y - 15 * s, 57 * s, 44 * s, 0.8);
  }
  return g;
}

/** Paint a complete 1200 × 660 world beneath the scene's interactions. */
export function renderWorld(scene, mode = 'map') {
  return mode === 'map' ? mapWorld(scene) : scenicWorld(scene, mode);
}

/** A friendly Axie. Its returned container can be moved, flipped, or tweened. */
export function drawAxie(scene, x, y, { kind = 'traveler', scale = 1, flip = false, idle = false } = {}) {
  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  container.add(g);
  container.setScale(flip ? -scale : scale, scale);
  const aqua = kind === 'aqua', mob = kind === 'mob';
  const body = aqua ? 0x91d2b4 : mob ? 0xb6a6cf : 0xe8b96d;
  const dark = aqua ? 0x5ca78f : mob ? 0x8d7dac : 0xc39450;
  const light = aqua ? 0xc0e7c5 : mob ? 0xd5c9e3 : 0xf7d99a;
  const ink = aqua ? 0x356958 : mob ? 0x5d4e75 : 0x765a36;
  oval(g, 0x547651, 1, 39, 77, 15, 0.18);
  if (!aqua && !mob) {
    // A little leather pack, complete with flap and rolled blanket.
    g.fillStyle(0x8d7750).fillRoundedRect(-51, -14, 27, 45, 10);
    g.fillStyle(0xa68b5e).fillRoundedRect(-51, -17, 26, 24, 8);
    g.lineStyle(2, 0x786948).strokeRoundedRect(-51, -14, 27, 44, 9);
    g.fillStyle(0xc5c398).fillRoundedRect(-54, -22, 31, 13, 6);
    g.lineStyle(2, 0x927c56).lineBetween(-46, -22, -46, -10).lineBetween(-32, -22, -32, -10);
    g.fillStyle(0xd8bb7d).fillRoundedRect(-41, 2, 6, 7, 2);
  }
  if (aqua) {
    // Fan-shaped sea fins and a small coral crown.
    polygon(g, dark, [[-35, -6], [-62, -23], [-59, 2], [-46, 17], [-32, 11]]);
    polygon(g, light, [[-39, -5], [-57, -17], [-51, 2], [-39, 10]]);
    polygon(g, dark, [[32, -7], [58, -25], [57, 2], [43, 16], [30, 11]]);
    polygon(g, light, [[38, -5], [53, -18], [49, 2], [38, 10]]);
    blob(g, dark, [[-17, -28], [-27, -49], [-17, -44], [-10, -56], [-2, -38], [8, -52], [15, -45], [16, -30]]);
    blob(g, light, [[-14, -29], [-20, -44], [-15, -40], [-10, -47], [-4, -30]]);
  } else if (mob) {
    polygon(g, dark, [[-31, -25], [-46, -49], [-43, -18], [-32, -9]]);
    polygon(g, dark, [[26, -27], [44, -50], [42, -15], [31, -10]]);
    polygon(g, light, [[-33, -23], [-42, -41], [-39, -21]]);
    polygon(g, light, [[29, -24], [40, -42], [37, -20]]);
    oval(g, dark, -51, 14, 27, 24);
    oval(g, body, -54, 9, 23, 20);
    polygon(g, 0xe4e2c4, [[-61, 0], [-52, 10], [-53, -3]]);
    oval(g, dark, 51, 14, 27, 24);
    oval(g, body, 54, 9, 23, 20);
    polygon(g, 0xe4e2c4, [[61, 0], [52, 10], [53, -3]]);
  } else {
    polygon(g, dark, [[-30, -20], [-35, -44], [-18, -32], [-14, -19]]);
    polygon(g, body, [[-29, -22], [-31, -37], [-18, -28]]);
    polygon(g, dark, [[24, -24], [36, -43], [36, -18], [24, -13]]);
    polygon(g, light, [[28, -23], [33, -35], [33, -20]]);
  }
  oval(g, dark, -25, 32, 26, 16);
  oval(g, dark, 24, 32, 26, 16);
  oval(g, light, -24, 30, 22, 13);
  oval(g, light, 24, 30, 22, 13);
  oval(g, dark, 0, 1, 96, 74);
  oval(g, body, 0, -2, 95, 71);
  oval(g, light, 4, 13, 72, 40, 0.45);
  oval(g, 0xffffff, -17, -22, 27, 9, 0.13);
  if (!aqua && !mob) {
    // Signature Lunacian sprout.
    g.lineStyle(4, 0x6d925d).lineBetween(-5, -32, -4, -51);
    blob(g, 0x739b63, [[-5, -45], [-26, -58], [-16, -61], [-3, -55]]);
    blob(g, 0x9db66e, [[-5, -49], [1, -64], [20, -63], [12, -51]]);
    g.lineStyle(1, 0xc2d096, 0.65).lineBetween(-4, -51, 12, -59);
    // Pack strap curves across its shoulder.
    line(g, 0x9b8256, 4, [[-34, -23], [-28, -5], [-31, 19]], 0.85);
  }
  if (mob) {
    oval(g, dark, -8, -23, 9, 6, 0.6);
    oval(g, dark, 8, -23, 9, 6, 0.6);
    oval(g, dark, 0, -31, 7, 5, 0.6);
  }
  // White catchlights, soft cheeks, a tiny cat-mouth and little arm flippers.
  oval(g, ink, -15, -1, 9, 12);
  oval(g, ink, 17, -1, 9, 12);
  oval(g, 0xfffbeb, -16.5, -4, 3, 3);
  oval(g, 0xfffbeb, 15.5, -4, 3, 3);
  oval(g, aqua ? 0xf0bd9c : mob ? 0xd9afc5 : 0xe49875, -27, 10, 12, 6, 0.68);
  oval(g, aqua ? 0xf0bd9c : mob ? 0xd9afc5 : 0xe49875, 29, 10, 12, 6, 0.68);
  line(g, ink, 1.8, [[-6, 12], [-2, 15], [2, 12], [6, 15], [10, 12]], 0.8);
  if (!mob) {
    oval(g, dark, -36, 16, 10, 18, 0.54);
    oval(g, body, -38, 13, 10, 17);
    oval(g, dark, 36, 16, 10, 18, 0.54);
    oval(g, body, 38, 13, 10, 17);
  }
  if (aqua) {
    for (const [sx, sy] of [[-28, -13], [-33, -6], [28, -14]]) oval(g, light, sx, sy, 4, 3, 0.8);
  }
  container.setSize(110, 100);
  if (idle) {
    container.idleTween = scene.tweens.add({ targets: container, y: y - 3 * scale, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  return container;
}
