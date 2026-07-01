import { Plus, Trash2 } from "lucide-react";
import type { ChecklistItem } from "../../types";

type Props = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
};

export default function Checklist({
  items,
  onChange,
}: Props) {

  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        text: "",
        checked: false,
      },
    ]);
  };

  const updateItem = (
    id: string,
    value: Partial<ChecklistItem>
  ) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? { ...item, ...value }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(
      items.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">

        <h3 className="font-semibold">
          Checklist
        </h3>

        <button
          type="button"
          onClick={addItem}
          className="rounded-lg bg-teal px-3 py-2 text-black"
        >
          <Plus size={16}/>
        </button>

      </div>

      {items.map((item) => (

        <div
          key={item.id}
          className="flex items-center gap-3"
        >

          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) =>
              updateItem(item.id,{
                checked:e.target.checked,
              })
            }
          />

          <input
            value={item.text}
            onChange={(e)=>
              updateItem(item.id,{
                text:e.target.value,
              })
            }
            placeholder="Checklist item..."
            className="
              flex-1
              rounded-lg
              border
              border-white/10
              bg-white/6
              p-2
              outline-none
            "
          />

          <button
            onClick={() =>
              removeItem(item.id)
            }
          >
            <Trash2
              size={18}
              className="text-red-500"
            />
          </button>

        </div>

      ))}

    </div>
  );
}