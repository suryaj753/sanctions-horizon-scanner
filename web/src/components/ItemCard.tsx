import type { Item } from "../content/types";
import { Panel } from "../lib/ui";
import { ItemDetail } from "./ItemDetail";

// A full item as a standalone card (used in Overview and Activity). The
// dense table uses ItemDetail directly in its row expansion.
export function ItemCard({ item }: { item: Item }) {
  return (
    <Panel className="p-4">
      <ItemDetail item={item} />
    </Panel>
  );
}
