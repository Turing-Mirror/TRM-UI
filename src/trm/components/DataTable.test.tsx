// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, pressKey, type Mounted } from "../test/dom";
import { DataTable, type DataColumn } from "./DataTable";

let view: Mounted;
afterEach(() => view?.unmount());
const rows = [{ id: "first", count: 12 }, { id: "second", count: 34 }];
const columns: DataColumn<(typeof rows)[number]>[] = [
  { key: "id", label: "Name", render: (row) => row.id, width: "60%" },
  { key: "count", label: "Count", render: (row) => row.count, align: "end" },
];

it("renders semantic headers and rows with column alignment", () => {
  view = mount(<DataTable rows={rows} columns={columns} keyOf={(row) => row.id} label="Records" />);
  expect(view.container.querySelector("table")?.getAttribute("aria-label")).toBe("Records");
  expect([...view.container.querySelectorAll("th")].map((cell) => cell.textContent)).toEqual(["Name", "Count"]);
  expect(view.container.querySelectorAll('th[scope="col"]')).toHaveLength(2);
  expect(view.container.querySelectorAll("tbody tr")).toHaveLength(2);
  expect([...view.container.querySelectorAll("td")].map((cell) => cell.textContent)).toEqual(["first", "12", "second", "34"]);
  expect(view.container.querySelectorAll("td")[1].style.textAlign).toBe("end");
});

it("activates a row by click, Enter and Space without consuming nested controls", () => {
  const clicked = vi.fn();
  const nested = vi.fn();
  view = mount(<DataTable rows={rows} columns={[
    ...columns, { key: "action", label: "Action", render: () => <button onClick={nested}>Open</button> },
  ]} keyOf={(row) => row.id} label="Records" onRowClick={clicked} />);
  const row = view.container.querySelector<HTMLTableRowElement>("tbody tr")!;
  act(() => row.click());
  pressKey(row, "Enter");
  pressKey(row, " ");
  expect(clicked).toHaveBeenCalledTimes(3);
  expect(clicked).toHaveBeenLastCalledWith(rows[0]);
  act(() => row.querySelector("button")!.click());
  pressKey(row.querySelector("button")!, "Enter");
  expect(nested).toHaveBeenCalledOnce();
  expect(clicked).toHaveBeenCalledTimes(3);
});
