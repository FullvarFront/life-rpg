import { Brain, Dumbbell, Palette, type LucideIcon } from "lucide-react";
import type { Attribute } from "@/types/game";

export interface AttributeMeta {
  key: Attribute;
  name: string;
  Icon: LucideIcon;
  /** Класс цвета текста/иконки. */
  text: string;
  /** Класс заливки полосы. */
  bar: string;
  /** Класс заливки точки-тега. */
  dot: string;
}

export const ATTRIBUTE_META: readonly AttributeMeta[] = [
  {
    key: "intellect",
    name: "Интеллект",
    Icon: Brain,
    text: "text-attr-intellect",
    bar: "bg-attr-intellect",
    dot: "bg-attr-intellect",
  },
  {
    key: "strength",
    name: "Сила",
    Icon: Dumbbell,
    text: "text-attr-strength",
    bar: "bg-attr-strength",
    dot: "bg-attr-strength",
  },
  {
    key: "creativity",
    name: "Творчество",
    Icon: Palette,
    text: "text-attr-creativity",
    bar: "bg-attr-creativity",
    dot: "bg-attr-creativity",
  },
];

export const ATTRIBUTE_BY_KEY: Record<Attribute, AttributeMeta> = {
  intellect: ATTRIBUTE_META[0],
  strength: ATTRIBUTE_META[1],
  creativity: ATTRIBUTE_META[2],
};
