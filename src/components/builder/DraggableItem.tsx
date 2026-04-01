import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
  id: string;
  label: string;
  sublabel?: string;
  onRemove: (id: string) => void;
  colorVariant: "green" | "amber" | "blue" | "purple";
}

const variantStyles = {
  green:
    "bg-[hsl(var(--green)/0.12)]  border-[hsl(var(--green)/0.25)]  text-[hsl(var(--green))]",
  amber:
    "bg-[hsl(var(--amber)/0.12)]  border-[hsl(var(--amber)/0.25)]  text-[hsl(var(--amber))]",
  blue: "bg-[hsl(var(--primary)/0.12)] border-[hsl(var(--primary)/0.25)] text-[hsl(var(--primary))]",
  purple:
    "bg-[hsl(var(--purple)/0.12)] border-[hsl(var(--purple)/0.25)] text-[hsl(var(--purple))]",
};

const gripStyles = {
  green: "text-[hsl(var(--green)/0.5)]  hover:text-[hsl(var(--green))]",
  amber: "text-[hsl(var(--amber)/0.5)]  hover:text-[hsl(var(--amber))]",
  blue: "text-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--primary))]",
  purple: "text-[hsl(var(--purple)/0.5)] hover:text-[hsl(var(--purple))]",
};

export function DraggableItem({
  id,
  label,
  sublabel,
  onRemove,
  colorVariant,
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium select-none",
        "transition-shadow duration-150",
        variantStyles[colorVariant],
        isDragging
          ? "opacity-80 shadow-xl scale-[1.02] ring-2 ring-[hsl(var(--ring)/0.4)]"
          : "opacity-100 shadow-none",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors",
          gripStyles[colorVariant],
        )}
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <GripVertical size={14} />
      </button>

      <div className="flex-1 min-w-0">
        <span className="block truncate leading-tight">{label}</span>
        {sublabel && (
          <span className="block truncate text-[10px] opacity-60 leading-tight mt-0.5">
            {sublabel}
          </span>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(id)}
        className="cursor-pointer p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        aria-label={`Remove ${label}`}
      >
        <X size={13} />
      </button>
    </div>
  );
}
