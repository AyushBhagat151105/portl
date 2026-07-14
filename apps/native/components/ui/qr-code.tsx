import React, { useMemo } from "react";
import { View } from "react-native";
import QRCode from "qrcode";
import Svg, { Rect } from "react-native-svg";

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export function QRCodeGen({ value, size = 200, bgColor = "#ffffff", fgColor = "#1c1917" }: QRCodeProps) {
  const matrix = useMemo(() => {
    if (!value) return [];
    try {
      const result = QRCode.create(value, { errorCorrectionLevel: "M" });
      const moduleSize = result.modules.size;
      const data = result.modules.data;
      const grid: boolean[][] = [];
      for (let row = 0; row < moduleSize; row++) {
        const rowData: boolean[] = [];
        for (let col = 0; col < moduleSize; col++) {
          rowData.push(data[row * moduleSize + col] === 1);
        }
        grid.push(rowData);
      }
      return grid;
    } catch {
      return [];
    }
  }, [value]);

  if (!value || matrix.length === 0) return null;

  const moduleCount = matrix.length;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Svg width={size - 24} height={size - 24} viewBox={`0 0 ${moduleCount} ${moduleCount}`}>
        {matrix.map((row, rowIdx) =>
          row.map((cell, colIdx) =>
            cell ? (
              <Rect
                key={`${rowIdx}-${colIdx}`}
                x={colIdx}
                y={rowIdx}
                width={1}
                height={1}
                rx={0.15}
                ry={0.15}
                fill={fgColor}
              />
            ) : null
          )
        )}
      </Svg>
    </View>
  );
}
