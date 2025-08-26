import React, { useState, useRef } from "react";

type Corners = { tl: number; tr: number; br: number; bl: number };

type Pill = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  corners: Corners;
};

const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 90%)`;

const MIN_PILL = 40; // original draw min
const MIN_PART = 20; // split part min

export default function PillSplitter() {
  const [pills, setPills] = useState<Pill[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingPillId, setDraggingPillId] = useState<number | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawColor, setDrawColor] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs to avoid click-after-drag split
  const movedWhileDraggingRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);

  const nextIdRef = useRef<number>(1);
  const nextId = () => {
    const id = Date.now() + nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  const handleMouseDownEmpty = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    setIsDrawing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setDrawColor(getRandomColor());
  };

  const handleMouseDownPill = (e: React.MouseEvent, pillId: number) => {
    e.stopPropagation();
    setDraggingPillId(pillId);
    // reset moved flag for this new drag
    movedWhileDraggingRef.current = false;

    const pill = pills.find((p) => p.id === pillId);
    if (pill) {
      setDragOffset({
        x: e.clientX - pill.x,
        y: e.clientY - pill.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (draggingPillId !== null) {
      // We actually moved while dragging → mark it
      movedWhileDraggingRef.current = true;

      setPills((prev) =>
        prev.map((pill) =>
          pill.id === draggingPillId
            ? {
                ...pill,
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
              }
            : pill
        )
      );
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      const width = Math.abs(mousePos.x - startPos.x);
      const height = Math.abs(mousePos.y - startPos.y);

      if (width >= MIN_PILL && height >= MIN_PILL) {
        setPills((prev) => [
          ...prev,
          {
            id: nextId(),
            x: Math.min(startPos.x, mousePos.x),
            y: Math.min(startPos.y, mousePos.y),
            width,
            height,
            color: drawColor,
            corners: { tl: 20, tr: 20, br: 20, bl: 20 },
          },
        ]);
      }
    }

    // If we actually dragged a pill (movedWhileDragging), suppress the immediate next click
    if (movedWhileDraggingRef.current) {
      suppressClickRef.current = true;
      // clear suppress after next event loop tick so normal clicks later still work
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    setIsDrawing(false);
    setDraggingPillId(null);
    movedWhileDraggingRef.current = false;

    if (isDrawing) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  // helper: check intersection of vertical/horizontal lines with pill
  const intersectsVertical = (pill: Pill, x: number) =>
    x > pill.x && x < pill.x + pill.width;
  const intersectsHorizontal = (pill: Pill, y: number) =>
    y > pill.y && y < pill.y + pill.height;

  const makePiece = (
    base: Pill,
    x: number,
    y: number,
    width: number,
    height: number,
    keepCorners: Partial<Corners>
  ): Pill => {
    const corners: Corners = {
      tl: keepCorners.tl ?? 0,
      tr: keepCorners.tr ?? 0,
      br: keepCorners.br ?? 0,
      bl: keepCorners.bl ?? 0,
    };

    return {
      id: nextId(),
      x,
      y,
      width,
      height,
      color: base.color,
      corners,
    };
  };

  const splitPillAt = (pill: Pill, splitX: number, splitY: number) => {
    const leftWidth = splitX - pill.x;
    const rightWidth = pill.x + pill.width - splitX;
    const topHeight = splitY - pill.y;
    const bottomHeight = pill.y + pill.height - splitY;

    const canVertical = leftWidth >= MIN_PART && rightWidth >= MIN_PART;
    const canHorizontal = topHeight >= MIN_PART && bottomHeight >= MIN_PART;

    if (!canVertical && !canHorizontal) return null;

    const pieces: Pill[] = [];

    if (canVertical && canHorizontal) {
      pieces.push(
        makePiece(pill, pill.x, pill.y, leftWidth, topHeight, {
          tl: pill.corners.tl,
        })
      );
      pieces.push(
        makePiece(pill, splitX, pill.y, rightWidth, topHeight, {
          tr: pill.corners.tr,
        })
      );
      pieces.push(
        makePiece(pill, pill.x, splitY, leftWidth, bottomHeight, {
          bl: pill.corners.bl,
        })
      );
      pieces.push(
        makePiece(pill, splitX, splitY, rightWidth, bottomHeight, {
          br: pill.corners.br,
        })
      );
    } else if (canVertical) {
      pieces.push(
        makePiece(pill, pill.x, pill.y, leftWidth, pill.height, {
          tl: pill.corners.tl,
          bl: pill.corners.bl,
        })
      );
      pieces.push(
        makePiece(pill, splitX, pill.y, rightWidth, pill.height, {
          tr: pill.corners.tr,
          br: pill.corners.br,
        })
      );
    } else if (canHorizontal) {
      pieces.push(
        makePiece(pill, pill.x, pill.y, pill.width, topHeight, {
          tl: pill.corners.tl,
          tr: pill.corners.tr,
        })
      );
      pieces.push(
        makePiece(pill, pill.x, splitY, pill.width, bottomHeight, {
          bl: pill.corners.bl,
          br: pill.corners.br,
        })
      );
    }

    return pieces;
  };

  const handleSplitClick = (e: React.MouseEvent) => {
    if (suppressClickRef.current) return;
    if (isDrawing || draggingPillId !== null) return;

    const splitX = e.clientX;
    const splitY = e.clientY;
    const MOVE_GAP = 5;

    setPills((prev) => {
      const newPills: Pill[] = [];

      prev.forEach((pill) => {
        const intersectsV = intersectsVertical(pill, splitX);
        const intersectsH = intersectsHorizontal(pill, splitY);

        if (!intersectsV && !intersectsH) {
          newPills.push(pill);
          return;
        }

        const pieces = splitPillAt(pill, splitX, splitY);

        if (!pieces || pieces.length === 0) {
          // when split is not possible, just move the pill
          const movedPill = { ...pill };

          if (intersectsV && !intersectsH) {
            if (splitX < pill.x + pill.width / 2) {
              movedPill.x = splitX + MOVE_GAP;
            } else {
              movedPill.x = splitX - pill.width - MOVE_GAP;
            }
          } else if (intersectsH && !intersectsV) {
            if (splitY < pill.y + pill.height / 2) {
              movedPill.y = splitY + MOVE_GAP;
            } else {
              movedPill.y = splitY - pill.height - MOVE_GAP;
            }
          } else if (intersectsV && intersectsH) {
            if (splitX < pill.x + pill.width / 2) {
              movedPill.x = splitX + MOVE_GAP;
            } else {
              movedPill.x = splitX - pill.width - MOVE_GAP;
            }

            if (splitY < pill.y + pill.height / 2) {
              movedPill.y = splitY + MOVE_GAP;
            } else {
              movedPill.y = splitY - pill.height - MOVE_GAP;
            }
          }

          newPills.push(movedPill);
        } else {
          newPills.push(...pieces);
        }
      });

      return newPills;
    });
  };

  const cornerToCss = (c: Corners) => `${c.tl}px ${c.tr}px ${c.br}px ${c.bl}px`;

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-gray-100 overflow-hidden"
      onMouseDown={handleMouseDownEmpty}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleSplitClick}
    >
      {/* Crosshair Lines */}
      <div
        className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-[999999]"
        style={{ left: mousePos.x }}
      />
      <div
        className="absolute left-0 right-0 h-px bg-red-500 pointer-events-none z-[999999]"
        style={{ top: mousePos.y }}
      />

      {/* Pills */}
      {pills.map((pill) => (
        <div
          key={pill.id}
          className="absolute cursor-move"
          style={{
            left: pill.x,
            top: pill.y,
            width: pill.width,
            height: pill.height,
            backgroundColor: pill.color,
            border: "1px solid #000",
            borderRadius: cornerToCss(pill.corners),
            opacity: 0.8,
          }}
          onMouseDown={(e) => handleMouseDownPill(e, pill.id)}
        />
      ))}

      {/* Drawing Preview */}
      {isDrawing && (
        <div
          className="absolute rounded-[20px] border-2 border-dashed border-gray-400 pointer-events-none"
          style={{
            left: Math.min(startPos.x, mousePos.x),
            top: Math.min(startPos.y, mousePos.y),
            width: Math.abs(mousePos.x - startPos.x),
            height: Math.abs(mousePos.y - startPos.y),
            backgroundColor: drawColor,
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
}
