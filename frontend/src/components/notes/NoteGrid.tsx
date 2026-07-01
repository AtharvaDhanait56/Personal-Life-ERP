import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function NoteGrid({
  children,
}: Props) {
  return (
    <section
      className="
      columns-1
      md:columns-2
      xl:columns-3
      gap-4
      space-y-4
    "
    >
      {children}
    </section>
  );
}