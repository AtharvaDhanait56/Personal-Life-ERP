import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">

      <Search
        size={18}
        className="absolute left-4 top-3.5 text-muted"
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search notes..."
        className="
          h-11
          w-full
          rounded-lg
          border
          border-white/10
          bg-white/6
          pl-11
          pr-4
          outline-none
          transition
          focus:border-teal
        "
      />

    </div>
  );
}