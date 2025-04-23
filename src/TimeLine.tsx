import React from "react";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

/** ************************************************************** */
/* TimeLine Component */
export default function TimeLine({
    marker,
    time,
    passKey,
}: {
    marker: number;
    time: string;
    passKey: string;
}): React.JSX.Element {
    /** ************************************************************** */
    /* Render */
    return (
        <Svg
            key={passKey}
            height="100%"
            width="100%"
            style={{
                position: "absolute",
                left: 0,
            }}
        >
            <Line
                x1={marker}
                y1={0}
                x2={marker}
                y2={185}
                stroke="#ccc"
                strokeWidth={2}
            />
            <Rect
                x={marker - 33}
                y={80}
                width="66"
                height="19"
                fill="#45576a"
                rx="5"
                ry="5"
            />
            <SvgText
                x={marker}
                y={90}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {time}
            </SvgText>
        </Svg>
    );
}
