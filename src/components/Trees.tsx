"use client";

import dynamic from "next/dynamic";
import type { RawNodeDatum } from "react-d3-tree";
import { useCallback, useRef, useEffect, useState } from "react";
import { getFormattedId } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

export interface ExtendedNodeDatum extends RawNodeDatum {
  children?: ExtendedNodeDatum[];
  rewardType?: string;
  bgColor?: string;
}

interface OrgChartTreeProps {
  data: ExtendedNodeDatum;
}

export default function Trees({ data }: OrgChartTreeProps) {
  const { signer } = useRegister();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [processedData, setProcessedData] = useState<ExtendedNodeDatum | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const isMobile = dimensions.width < 600;
  const nodeSize = isMobile ? { x: 140, y: 100 } : { x: 180, y: 120 };
  const translate = { x: dimensions.width / 2, y: 80 };

  const flattenTree = (node: ExtendedNodeDatum, nodes: ExtendedNodeDatum[] = []) => {
    nodes.push(node);
    if (node.children) {
      node.children.forEach((child) => flattenTree(child, nodes));
    }
    return nodes;
  };

  const getColorFromRewardType = (type?: string): string => {
    switch (type) {
      case "DIRECT":
        return "#c084fc"; // Tailwind: bg-purple-400
      case "UPLINE":
        return "#60a5fa"; // Tailwind: bg-blue-400
      case "SUPER_UPLINE":
        return "#facc15"; // Tailwind: bg-yellow-400
      case "UPLINE_REBIRTH":
      case "SUPER_UPLINE_REBIRTH":
      case "DIRECT_REBIRTH":
        return "#4ade80"; // Tailwind: bg-green-400
      default:
        return "#e5e7eb"; // Tailwind: bg-gray-200
    }
  };

  useEffect(() => {
    const processTree = async () => {
      if (!data || !signer) return;
      const clonedData = structuredClone(data);
      const allNodes = flattenTree(clonedData);

      // Assign color and formatted ID
      await Promise.all(
        allNodes.map(async (node) => {
          node.bgColor = getColorFromRewardType(node.rewardType);

          const rawId = node.name;
          if (rawId && rawId !== "0") {
            try {
              const parsedId = parseInt(rawId);
              const { formattedId } = await getFormattedId(signer, parsedId);
              node.name = formattedId || rawId.toString();
            } catch (e) {
              node.name = rawId.toString();
            }
          }
        })
      );

      setProcessedData(clonedData);
    };

    processTree();
  }, [data, signer]);

  const renderNode = useCallback(
    ({ nodeDatum }: { nodeDatum: ExtendedNodeDatum }) => {
      let bgColor = nodeDatum.bgColor || "#e5e7eb";

      const isEmptyNode =
        !nodeDatum.name || nodeDatum.name === "0" || nodeDatum.name.trim() === "";

      if (isEmptyNode) {
        bgColor = "#f87171"; // Tailwind: bg-red-400
      }

      return (
        <g>
          <circle r={30} fill={bgColor} stroke="#000" strokeWidth={1} />
          {!isEmptyNode && (
            <text
              fill="#000"
              stroke="none"
              x={0}
              y={5}
              textAnchor="middle"
              fontSize="16"
            >
              {nodeDatum.name}
            </text>
          )}
        </g>
      );
    },
    []
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      {processedData ? (
        <Tree
          data={processedData}
          orientation="vertical"
          nodeSize={nodeSize}
          translate={translate}
          renderCustomNodeElement={renderNode}
          collapsible
        />
      ) : (
        <div className="text-white">Loading tree...</div>
      )}
    </div>
  );
}
