"use client";

import dynamic from "next/dynamic";
import type { RawNodeDatum } from "react-d3-tree";
import { useCallback, useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { getFormattedId } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

export interface ExtendedNodeDatum extends RawNodeDatum {
  children?: ExtendedNodeDatum[];
  rewardHighlight?: boolean;
}

interface OrgChartTreeProps {
  data: ExtendedNodeDatum;
}

export default function Trees({ data }: OrgChartTreeProps) {
  const userId = useSelector((state: RootState) => state.user.userId);
  const { signer } = useRegister();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [processedData, setProcessedData] = useState<ExtendedNodeDatum | null>(null);
  const circleData = useSelector((state: RootState) => state.user.circleData);

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

  const renderNode = useCallback(
    ({
      nodeDatum,
      hierarchyPointNode,
    }: {
      nodeDatum: ExtendedNodeDatum;
      hierarchyPointNode: { depth: number };
    }) => {
      const isRoot = hierarchyPointNode.depth === 0;
      const isVacant = nodeDatum.name === "0" || nodeDatum.name === "";

      const formattedName = nodeDatum.name;
      let bgColor = "#6495ED"; // default

      if (isRoot) {
        bgColor = "#d7dbdd"; // root - white
      } else if (isVacant) {
        bgColor = "#FF4C4C"; // vacant - red
      } else if (!isVacant) {
        const uplineList = circleData?.uplineRewards || [];
        const superUplineList = circleData?.superUplineRewards || [];
        const levelList =
          circleData?.levelData?.flatMap((lvl: any) => lvl.levelData.map((d: any) => d.fromUserId)) || [];

        // Match priority: upline > superUpline > level
        if (uplineList.includes(formattedName)) {
          bgColor = "#6E1A7F"; // upline - purple
        } else if (superUplineList.includes(formattedName)) {
          bgColor = "#0020C2"; // superUpline - blue
        } else if (levelList.includes(formattedName)) {
          bgColor = "#FFFF00"; // level - yellow
        } else if (nodeDatum.rewardHighlight) {
          bgColor = "#facc15"; // reward highlight if no other match
        }
      }

      const textColor = "#ffffff";
      const label = isVacant ? "Vacant" : formattedName;
      const radius = isMobile ? 35 : 45;

      return (
        <g>
          <circle r={radius} fill={bgColor} stroke="#00000050" strokeWidth={4} />
          <text
            x={0}
            y={5}
            textAnchor="middle"
            fill={textColor}
            fontSize={isMobile ? 12 : 14}
            style={{ pointerEvents: "none" }}
          >
            {label}
          </text>
        </g>
      );
    },
    [isMobile, circleData]
  );

  const flattenTree = (node: ExtendedNodeDatum, nodes: ExtendedNodeDatum[] = []): ExtendedNodeDatum[] => {
    nodes.push(node);
    if (node.children) {
      node.children.forEach((child) => flattenTree(child, nodes));
    }
    return nodes;
  };

  useEffect(() => {
    const processTree = async () => {
      if (!data || !userId || !signer) return;
      const clonedData = structuredClone(data);
      const allNodes = flattenTree(clonedData);

      await Promise.all(
        allNodes.map(async (node) => {
          const rawId = node.name;
          if (rawId && rawId !== "0") {
            try {
              const parsedId = parseInt(rawId);
              const { formattedId } = await getFormattedId(signer, parsedId);
              node.name = formattedId || rawId;
            } catch (e) {
              console.warn(`Failed to format ID ${rawId}`, e);
            }
          }
        })
      );

      setProcessedData(clonedData);
    };

    processTree();
  }, [data, userId, signer]);

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
