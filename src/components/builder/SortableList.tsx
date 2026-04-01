import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { DraggableItem } from "./DraggableItem";

interface SortableListProps {
  ids: string[];
  labelMap: Map<string, string>;
  sublabelMap?: Map<string, string>;
  onRemove: (id: string) => void;
  onReorder: (newIds: string[]) => void;
  colorVariant: "green" | "amber" | "blue" | "purple";
  emptyMessage: string;
}

export function SortableList({
  ids,
  labelMap,
  sublabelMap,
  onRemove,
  onReorder,
  colorVariant,
  emptyMessage,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      onReorder(arrayMove(ids, oldIndex, newIndex));
    }
  }

  if (ids.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] py-6 text-xs text-[hsl(var(--muted-foreground))] italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {ids.map((id) => (
            <DraggableItem
              key={id}
              id={id}
              label={labelMap.get(id) ?? id}
              sublabel={sublabelMap?.get(id)}
              onRemove={onRemove}
              colorVariant={colorVariant}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
