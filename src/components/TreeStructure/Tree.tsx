"use client";

import dynamic from "next/dynamic";
import type { RawNodeDatum } from "react-d3-tree";
import { useCallback, useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { getFormattedId } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { X } from "lucide-react";

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
  const circleData = useSelector((state: RootState) => state.user.circleData);
  const { signer } = useRegister();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [processedData, setProcessedData] = useState<ExtendedNodeDatum | null>(null);
  const [formattedCircleData, setFormattedCircleData] = useState<{
    uplineRewards: string[];
    superUplineRewards: string[];
  }>({ uplineRewards: [], superUplineRewards: [] });

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

  // Step 1: Flatten tree to apply formatted names
  const flattenTree = (node: ExtendedNodeDatum, nodes: ExtendedNodeDatum[] = []): ExtendedNodeDatum[] => {
    nodes.push(node);
    if (node.children) {
      node.children.forEach((child) => flattenTree(child, nodes));
    }
    return nodes;
  };

  // Step 2: Format tree node IDs
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
              node.name = formattedId || rawId.toString();
            } catch (e) {
              console.warn(`Failed to format ID ${rawId}`, e);
              node.name = rawId.toString();
            }
          }
        })
      );

      setProcessedData(clonedData);
    };

    processTree();
  }, [data, userId, signer]);

  // Step 3: Format circleData (upline/superUpline)
  useEffect(() => {
    const formatCircleData = async () => {
      if (!circleData || !signer) return;

      const formatList = async (list: any[]) => {
        return Promise.all(
          list.map(async (id) => {
            try {
              const parsed = parseInt(id);
              const { formattedId } = await getFormattedId(signer, parsed);
              return formattedId || id.toString();
            } catch {
              return id.toString();
            }
          })
        );
      };

      const uplineRewards = await formatList(circleData.uplineRewards || []);
      console.log("uplintreedata", uplineRewards)
      const superUplineRewards = await formatList(circleData.superUplineRewards || []);

      setFormattedCircleData({ uplineRewards, superUplineRewards });
    };

    formatCircleData();
  }, [circleData, signer]);

  // Step 4: Render nodes with correct color
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

      let bgColor = "#6495ED"; // default blue
      const label = isVacant ? "Vacant" : nodeDatum.name;

      if (isRoot) {
        bgColor = "#d7dbdd"; // root
      } else if (isVacant) {
        bgColor = "#FF4C4C"; // vacant
      } else {
        const formattedName = nodeDatum.name;

        if (circleData?.uplineRewards.find(x=>x.fromUserId === nodeDatum.name)) {
          bgColor = "#FFFF00"; // upline - purple
        } else if (circleData?.superUplineRewards.find(x=>x.fromUserId === nodeDatum.name)) {
          bgColor = "#0020C2"; // super-upline - blue
        } else if (circleData?.levelData.find(x=>x.level === nodeDatum.name)) {
          bgColor = "#FFFF00"; // reward
        }
      }

      const textColor = "#facc15";
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
    [isMobile, formattedCircleData]
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
