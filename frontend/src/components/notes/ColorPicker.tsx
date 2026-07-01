const colors = [
  "#ffffff",
  "#fecaca",
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#ddd6fe",
  "#fbcfe8",
];

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export default function ColorPicker({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex gap-3">

      {colors.map((color) => (

        <button
          key={color}
          onClick={() => onChange(color)}
          className="h-7 w-7 rounded-full border-2"
          style={{
            background: color,
            borderColor:
              value === color
                ? "#2dd4bf"
                : "transparent",
          }}
        />

      ))}

    </div>
  );
}