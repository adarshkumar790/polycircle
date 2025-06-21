// Tree.tsx
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

  useEffect(() => {
    const processTree = async () => {
      if (!data || !signer) return;
      const clonedData = structuredClone(data);
      const allNodes = flattenTree(clonedData);

      await Promise.all(
        allNodes.map(async (node) => {
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
      let bgColor = "#e9d5ff"; // fallback lilac
      switch (nodeDatum.rewardType) {
        case "DIRECT":
          bgColor = "#facc15"; // yellow
          break;
        case "UPLINE":
          bgColor = "#60a5fa"; // blue
          break;
        case "SUPER_UPLINE":
          bgColor = "#a78bfa"; // purple
          break;
        case "SUPER_UPLINE_REBIRTH":
        case "UPLINE_REBIRTH":
          bgColor = "#4ade80"; // green
          break;
        default:
          bgColor = "#e9d5ff";
      }

      const radius = isMobile ? 35 : 45;
      return (
        <g>
          <circle r={radius} fill={bgColor} stroke="#00000050" strokeWidth={4} />
          <text
            x={0}
            y={5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#4c1d95"
            fontSize={isMobile ? 12 : 14}
            fontWeight="bold"
            style={{ pointerEvents: "none", fontFamily: "sans-serif" }}
          >
            {nodeDatum.name}
          </text>
        </g>
      );
    },
    [isMobile]
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
