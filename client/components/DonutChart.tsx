'use client'

import React, { useEffect, useState } from "react";
import styled from "styled-components";

type DataItem = {
  label: string;
  value: number;
  color: string;
};

export default function DonutChart({
  data,
  size = 240,
  strokeWidth = 22,
}: {
  data: DataItem[];
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const cumulativeValues = data.reduce((acc, item) => {
    const percentage = item.value / total;
    acc.push((acc[acc.length - 1] || 0) + percentage);
    return acc;
  }, [] as number[]);

  return (
    <Wrapper>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const cumulative = cumulativeValues[index] - percentage;
            const dash = percentage * circumference;
            const offset = -cumulative * circumference;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={
                  animated ? `${dash} ${circumference}` : `0 ${circumference}`
                }
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "all 0.6s ease" }}
              />
            );
          })}
        </g>
      </svg>

      <Center>
        <strong>{total}</strong>
        <span>Total</span>
      </Center>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  color: #000;
`;

const Center = styled.div`
  position: absolute;
  top: 42%;
  text-align: center;

  strong {
    font-size: 28px;
    display: block;
  }

  span {
    font-size: 12px;
  }
`;