import type { Level } from "../data/messages";

export interface Palette {
  sky: string[];
  sun: string;
  far: string;
  mid: string;
  near: string;
  water: string[];
  glint: string;
  bird: string;
  /** Thunderhead: lit side, shaded side, flat base, rain curtain. */
  cloud: [string, string, string, string];
  /** Tree islands out in the slough. */
  dome: string;
  /** Near sawgrass clumps. */
  grass: [string, string];
}

const CLOUD: Palette["cloud"] = ["#f6e8c6", "#d6c8a8", "#5b6d70", "#4f7078"];

const CLASSIC: Record<Level, Palette> = {
  // Gator Hole: first light, hazy, cypress dome on still green-brown water.
  pond: {
    sky: ["#6f9c92", "#8fb19f", "#b2c2a4", "#d3cfa2", "#eadaa0", "#f6e3a8"],
    sun: "#fff4cf",
    far: "#86a283",
    mid: "#4c6f55",
    near: "#1c3329",
    water: ["#b9b782", "#7f8d5e", "#55694a", "#39503c", "#243a30", "#162822"],
    glint: "#f6e9b6",
    bird: "#f6f1df",
    cloud: CLOUD,
    dome: "#345244",
    grass: ["#1c3329", "#1c3329"],
  },
  // Shark River Slough: hot afternoon, thunderhead building, tea-colored water.
  river: {
    sky: ["#2b5a68", "#3a7078", "#558a86", "#83a693", "#b8bd93", "#e2c98c"],
    sun: "#fbeec4",
    far: "#5a7a63",
    mid: "#b08a39",
    near: "#5f4a1b",
    water: ["#d6b56c", "#a2823f", "#73592a", "#4f3e1e", "#352a15", "#211a0d"],
    glint: "#f7e2a4",
    bird: "#16282a",
    cloud: CLOUD,
    dome: "#345244",
    grass: ["#4a3a14", "#6e5620"],
  },
  // Florida Bay: sundown over the mangrove keys.
  ocean: {
    sky: ["#33294d", "#672c4f", "#a63d4c", "#d85e3e", "#ee8d3d", "#f8c05f"],
    sun: "#ffe7a8",
    far: "#6c2b47",
    mid: "#2f1a33",
    near: "#150d1e",
    water: ["#f4ad59", "#dc6841", "#a43f4c", "#652a4a", "#3a1e3c", "#1f1228"],
    glint: "#ffd98c",
    bird: "#20142a",
    cloud: CLOUD,
    dome: "#345244",
    grass: ["#150d1e", "#150d1e"],
  },
};

// Bought themes repaint every water the same way.
export const THEME_PALETTES: Record<string, Palette> = {
  moon: {
    sky: ["#070d24", "#0c1633", "#142244", "#1f3158", "#2d4470", "#435e8c"],
    sun: "#f4f2dc",
    far: "#1c2c50",
    mid: "#101c3a",
    near: "#060b1b",
    water: ["#4f6c9a", "#2e4570", "#1d3056", "#14233f", "#0c172c", "#060d1c"],
    glint: "#dbe7ff",
    bird: "#dbe7ff",
    cloud: ["#8097bf", "#5a7199", "#27375a", "#1e2c4c"],
    dome: "#0d1730",
    grass: ["#060b1b", "#0c1530"],
  },
  storm: {
    sky: ["#2a3531", "#3a4a3f", "#52654c", "#73855a", "#9ba567", "#c6c178"],
    sun: "#e6e2a4",
    far: "#3e5046",
    mid: "#25362d",
    near: "#101a15",
    water: ["#8e9a68", "#5f7253", "#435742", "#2e4033", "#1e2c24", "#111c17"],
    glint: "#d6d69a",
    bird: "#0d1411",
    cloud: ["#8c9a88", "#62726a", "#2a3633", "#34443f"],
    dome: "#1d2b24",
    grass: ["#101a15", "#1e2c1f"],
  },
  postcard: {
    sky: ["#14a0b5", "#30b8c2", "#6fd0c8", "#f3e0a8", "#ffb48a", "#ff8a8a"],
    sun: "#fff6c2",
    far: "#1e9c8a",
    mid: "#0f6f62",
    near: "#07423e",
    water: ["#ffb48a", "#3fc4c2", "#17a0ad", "#0c7e92", "#075c74", "#043f54"],
    glint: "#fff6d8",
    bird: "#ff5f8f",
    cloud: ["#fffaf0", "#ffd9c7", "#ff9fa0", "#7fd4d4"],
    dome: "#0f6f62",
    grass: ["#07423e", "#0f6f62"],
  },
  redtide: {
    sky: ["#3a1016", "#5e1a1c", "#872a22", "#ad4426", "#cf6c30", "#e89c4c"],
    sun: "#ffd9a0",
    far: "#5a1c20",
    mid: "#34100f",
    near: "#160606",
    water: ["#d96a3c", "#b23a2a", "#8c2424", "#661a1f", "#431218", "#26090e"],
    glint: "#ffb98a",
    bird: "#160606",
    cloud: ["#e0a584", "#b37460", "#4f1c1c", "#6e2a26"],
    dome: "#2a0d0d",
    grass: ["#160606", "#2a0d0d"],
  },
};

export function paletteFor(level: Level, theme: string): Palette {
  return THEME_PALETTES[theme] ?? CLASSIC[level];
}
