/**
 * Grille de fond pour le tableau de bord personnalisable - WakeDock
 */

import React from 'react';

interface GridConfig {
    columns: number;
    rows: number;
    gap: number;
    padding: number;
    responsive: boolean;
}

interface GridBackgroundProps {
    gridConfig: GridConfig;
    cellDimensions: { width: number; height: number };
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
    gridConfig,
    cellDimensions
}) => {
    const { columns, rows, gap, padding } = gridConfig;
    const { width: cellWidth, height: cellHeight } = cellDimensions;

    // Générer les lignes de la grille
    const gridLines = [];

    // Lignes verticales
    for (let i = 0; i <= columns; i++) {
        const x = i * (cellWidth + gap) + padding;
        gridLines.push(
            <line
                key={`v-${i}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={rows * (cellHeight + gap) + padding}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.1"
            />
        );
    }

    // Lignes horizontales
    for (let i = 0; i <= rows; i++) {
        const y = i * (cellHeight + gap) + padding;
        gridLines.push(
            <line
                key={`h-${i}`}
                x1={padding}
                y1={y}
                x2={columns * (cellWidth + gap) + padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.1"
            />
        );
    }

    // Générer les cellules de la grille
    const gridCells = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = col * (cellWidth + gap) + padding;
            const y = row * (cellHeight + gap) + padding;

            gridCells.push(
                <rect
                    key={`cell-${row}-${col}`}
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill="currentColor"
                    opacity="0.02"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeOpacity="0.05"
                    rx="4"
                />
            );
        }
    }

    const totalWidth = columns * (cellWidth + gap) + padding * 2;
    const totalHeight = rows * (cellHeight + gap) + padding * 2;

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                width="100%"
                height="100%"
                className="text-gray-400 dark:text-gray-600"
                style={{ minWidth: totalWidth, minHeight: totalHeight }}
            >
                {gridCells}
                {gridLines}

                {/* Indicateurs de colonnes */}
                {Array.from({ length: columns }, (_, i) => (
                    <text
                        key={`col-${i}`}
                        x={i * (cellWidth + gap) + cellWidth / 2 + padding}
                        y={padding - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                        opacity="0.3"
                    >
                        {i + 1}
                    </text>
                ))}

                {/* Indicateurs de lignes */}
                {Array.from({ length: rows }, (_, i) => (
                    <text
                        key={`row-${i}`}
                        x={padding - 8}
                        y={i * (cellHeight + gap) + cellHeight / 2 + padding + 3}
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                        opacity="0.3"
                    >
                        {i + 1}
                    </text>
                ))}
            </svg>

            {/* Overlay d'information */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 shadow-sm">
                <div>Grille: {columns}×{rows}</div>
                <div>Cellule: {Math.round(cellWidth)}×{Math.round(cellHeight)}px</div>
            </div>
        </div>
    );
};
