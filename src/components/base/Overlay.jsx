export function Overlay() {
return (
  <div
  className="fixed inset-0 z-[1] pointer-events-none bg-black/5 sm:bg-black/6 md:bg-black/7 lg:bg-black/8"
  aria-hidden="true"
  />
);
}
export default Overlay;