// Long, smooth transition from the black splash into the white project
// grid. Solid black for the first quarter, then a slow multi-step ease
// through dark and mid greys into stone-50.
export const FadeBand: React.FC = () => (
  <div
    aria-hidden
    className="h-[60vh]"
    style={{
      backgroundImage:
        "linear-gradient(to bottom, #000 0%, #000 25%, #1c1917 45%, #57534e 65%, #d6d3d1 85%, #fafaf9 100%)",
    }}
  />
);
