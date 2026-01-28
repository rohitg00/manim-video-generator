
import { v4 as uuidv4 } from 'uuid';
import type { Shape } from './types';

export function normalizeShapeType(input: string): Shape['type'] {
  const normalized = input.toLowerCase().trim();

  const typeMap: Record<string, Shape['type']> = {
    circle: 'circle',
    oval: 'ellipse',
    ellipse: 'ellipse',
    square: 'square',
    rectangle: 'rectangle',
    rect: 'rectangle',
    box: 'rectangle',
    triangle: 'triangle',
    polygon: 'polygon',
    line: 'line',
    arrow: 'arrow',
    arc: 'arc',
    curve: 'curve',
    bezier: 'curve',
  };

  return typeMap[normalized] || 'rectangle';
}

export function calculateShapeArea(shape: Shape): number {
  return shape.boundingBox.width * shape.boundingBox.height;
}

export function calculateDistance(shape1: Shape, shape2: Shape): number {
  const dx = shape1.center.x - shape2.center.x;
  const dy = shape1.center.y - shape2.center.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function shapesOverlap(shape1: Shape, shape2: Shape): boolean {
  const bb1 = shape1.boundingBox;
  const bb2 = shape2.boundingBox;

  return !(
    bb1.x + bb1.width < bb2.x ||
    bb2.x + bb2.width < bb1.x ||
    bb1.y + bb1.height < bb2.y ||
    bb2.y + bb2.height < bb1.y
  );
}

export function isShapeInside(inner: Shape, outer: Shape): boolean {
  const ibb = inner.boundingBox;
  const obb = outer.boundingBox;

  return (
    ibb.x >= obb.x &&
    ibb.y >= obb.y &&
    ibb.x + ibb.width <= obb.x + obb.width &&
    ibb.y + ibb.height <= obb.y + obb.height
  );
}

export function sortShapesByPosition(shapes: Shape[]): Shape[] {
  return [...shapes].sort((a, b) => {
    const yDiff = a.center.y - b.center.y;
    if (Math.abs(yDiff) > 0.1) return yDiff;

    return a.center.x - b.center.x;
  });
}

export function groupShapesByProximity(shapes: Shape[], threshold = 0.15): Shape[][] {
  if (shapes.length === 0) return [];

  const groups: Shape[][] = [];
  const used = new Set<string>();

  for (const shape of shapes) {
    if (used.has(shape.id)) continue;

    const group: Shape[] = [shape];
    used.add(shape.id);

    for (const other of shapes) {
      if (used.has(other.id)) continue;

      if (calculateDistance(shape, other) < threshold) {
        group.push(other);
        used.add(other.id);
      }
    }

    groups.push(group);
  }

  return groups;
}

export const MANIM_COLORS: Record<string, string> = {
  BLUE: '#58c4dd',
  BLUE_A: '#c7e9f1',
  BLUE_B: '#9cdceb',
  BLUE_C: '#58c4dd',
  BLUE_D: '#29abca',
  BLUE_E: '#1c758a',
  GREEN: '#83c167',
  GREEN_A: '#c9e2ae',
  GREEN_B: '#a6cf8c',
  GREEN_C: '#83c167',
  GREEN_D: '#77b05d',
  GREEN_E: '#699c52',
  YELLOW: '#ffff00',
  YELLOW_A: '#fff1b6',
  YELLOW_B: '#ffea94',
  YELLOW_C: '#ffff00',
  YELLOW_D: '#f4d345',
  YELLOW_E: '#e8c11c',
  RED: '#fc6255',
  RED_A: '#f7a1a3',
  RED_B: '#ff8080',
  RED_C: '#fc6255',
  RED_D: '#e65a4c',
  RED_E: '#cf5044',
  PURPLE: '#9a72ac',
  PURPLE_A: '#caa3e8',
  PURPLE_B: '#b189c6',
  PURPLE_C: '#9a72ac',
  PURPLE_D: '#715582',
  PURPLE_E: '#644172',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#888888',
  GREY: '#888888',
  ORANGE: '#ff862f',
  PINK: '#d147bd',
  TEAL: '#5cd0b3',
  GOLD: '#c78d46',
  MAROON: '#c55f73',
};

export function findClosestManimColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  let closestName = 'WHITE';
  let closestDist = Infinity;

  for (const [name, colorHex] of Object.entries(MANIM_COLORS)) {
    const cr = parseInt(colorHex.slice(1, 3), 16);
    const cg = parseInt(colorHex.slice(3, 5), 16);
    const cb = parseInt(colorHex.slice(5, 7), 16);

    const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);

    if (dist < closestDist) {
      closestDist = dist;
      closestName = name;
    }
  }

  return closestName;
}

export function createShape(
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Shape> = {}
): Shape {
  return {
    id: options.id || `shape_${uuidv4().slice(0, 8)}`,
    type: normalizeShapeType(type),
    boundingBox: { x, y, width, height },
    center: { x: x + width / 2, y: y + height / 2 },
    confidence: options.confidence ?? 0.8,
    color: options.color,
    fillColor: options.fillColor,
    label: options.label,
    rotation: options.rotation,
    scale: options.scale,
    vertices: options.vertices,
    direction: options.direction,
  };
}

export function shapeToManimCode(shape: Shape): string {
  const colorName = shape.color ? findClosestManimColor(shape.color) : 'BLUE';

  const x = (shape.center.x - 0.5) * 14;
  const y = (0.5 - shape.center.y) * 8;

  switch (shape.type) {
    case 'circle':
      return `Circle(radius=1, color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    case 'square':
      return `Square(side_length=2, color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    case 'rectangle':
      return `Rectangle(width=3, height=2, color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    case 'triangle':
      return `Triangle(color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    case 'line':
      return `Line(start=LEFT, end=RIGHT, color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    case 'arrow':
      return `Arrow(start=LEFT, end=RIGHT, color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
    default:
      return `Dot(color=${colorName}).move_to([${x.toFixed(2)}, ${y.toFixed(2)}, 0])`;
  }
}
