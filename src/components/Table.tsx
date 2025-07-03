"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getFormattedId } from "./registerUser";
import { useRegister } from "./usehooks/usehook";

type Column = {
  label: string;
  accessor: string;
};

type DynamicTableProps = {
  title: string;
  circle: string;
  columns: Column[];
  data: Record<string, any>[];
  showLevelSelector?: boolean;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
  showEntriesSelector?: boolean;
  entriesCount?: number;
  onEntriesChange?: (count: number) => void;
  isCurrentCircle?: boolean;
};

const DynamicTable: React.FC<DynamicTableProps> = ({
  title,
  circle,
  columns,
  data,
  showLevelSelector = false,
  selectedLevel = 1,
  onLevelChange,
  showEntriesSelector = false,
  entriesCount = 5,
  onEntriesChange,
  isCurrentCircle = false,
}) => {
  const { signer } = useRegister();
  const [formattedIdMap, setFormattedIdMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const totalAmount = data.reduce((sum, row) => {
    const raw = row?.amount?.toString().replace(/[^0-9.]/g, "") || "0";
    return sum + parseFloat(raw);
  }, 0);

  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const rawValue = String(row[col?.accessor] || "").toLowerCase();
      const formattedValue =
        (col.accessor === "fromUserId" || col.accessor === "userId") &&
        formattedIdMap[row[col.accessor]]
          ? formattedIdMap[row[col.accessor]].toLowerCase()
          : "";
      return (
        rawValue.includes(searchQuery.toLowerCase()) ||
        formattedValue.includes(searchQuery.toLowerCase())
      );
    })
  );

  const visibleRows = filteredData.slice(0, entriesCount);

  useEffect(() => {
    const formatIds = async () => {
      if (!signer) return;

      const idsToFormat = new Set<string>();
      data.forEach((row) => {
        const id = row.fromUserId || row.userId;
        if (id && !formattedIdMap[id]) {
          idsToFormat.add(id);
        }
      });

      const newMap: Record<string, string> = {};
      for (const id of idsToFormat) {
        try {
          const res = await getFormattedId(signer, Number(id));
          newMap[id] = res.formattedId || `Error: ${res.error}`;
        } catch (err) {
          newMap[id] = "Formatting failed";
        }
      }

      setFormattedIdMap((prev) => ({ ...prev, ...newMap }));
    };

    formatIds();
  }, [data, signer]);

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between mb-2">
        <Link
          href="/dashboards"
          className="flex-shrink-0 flex items-center text-white hover:text-purple-300 font-bold text-xl"
        >
          Back
        </Link>

        <div className="flex-1 flex justify-center mt-2 md:mt-0">
          <div className="font-bold md:text-2xl text-xl text-white text-center">
            {title}
          </div>
        </div>

        <div className="w-[60px] md:w-[100px] flex-shrink-0" />
      </div>

      {/* Filter Controls */}
      <div className="bg-purple-900 p-4 rounded-t-xl mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs md:text-sm text-white font-medium">
          {/* Left: Level Selector or Circle Info */}
          <div className="flex items-center gap-2">
            {isCurrentCircle ? (
              <span className="whitespace-nowrap">Circle :- {circle}</span>
            ) : showLevelSelector ? (
              <>
                <span className="whitespace-nowrap">Level:</span>
                <select
                  className="bg-purple-900 text-white rounded border border-white/60 px-1 py-0.5"
                  value={selectedLevel}
                  onChange={(e) => onLevelChange?.(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>

          {/* Center: Search Field */}
          {!isCurrentCircle && (
            <div className="flex justify-center w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs px-2 py-1 rounded border border-white/60 bg-purple-800 text-white text-sm"
              />
            </div>
          )}

          {/* Right: Entries Selector */}
          {showEntriesSelector && (
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <label htmlFor="entriesSelect" className="text-sm">
                Show:
              </label>
              <select
                id="entriesSelect"
                className="border border-white/60 text-white text-sm bg-purple-900 rounded px-1 py-0.5"
                value={entriesCount}
                onChange={(e) => onEntriesChange?.(Number(e.target.value))}
              >
                {[5, 10, 25, 50, 100].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              <span className="text-sm">entries</span>
            </div>
          )}
          <div>Total Amount :- {totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#220128] shadow-md scrollbar-hide rounded-b-xl">
        <table className="min-w-full text-sm text-left text-white border-separate border-spacing-0">
          <thead className="bg-[#220128]">
            <tr>
              <th
                className="sticky left-0 z-30 bg-[#220128] px-3 py-2 min-w-[60px] border-b border-purple-800 shadow-md"
                style={{ boxShadow: "2px 0 5px rgba(0,0,0,0.6)" }}
              >
                Sr. No
              </th>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-3 py-2 border-b border-purple-800 min-w-[150px]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-purple-800">
                <td
                  className="sticky left-0 z-20 bg-[#220128] px-3 py-2 min-w-[60px] border-b border-purple-800 shadow-md"
                  style={{ boxShadow: "2px 0 5px rgba(0,0,0,0.4)" }}
                >
                  {rowIndex + 1}
                </td>
                {columns.map((col, colIndex) => {
                  let cellData = row[col.accessor];
                  if (
                    (col.accessor === "fromUserId" || col.accessor === "userId") &&
                    formattedIdMap[cellData]
                  ) {
                    cellData = formattedIdMap[cellData];
                  }

                  return (
                    <td
                      key={colIndex}
                      className="px-3 py-2 min-w-[150px] border-b border-purple-800"
                    >
                      {typeof cellData === "object" && cellData?.href ? (
                        <Link
                          href={cellData.href}
                          className="text-blue-400 hover:underline"
                        >
                          {cellData.label}
                        </Link>
                      ) : (
                        cellData
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
