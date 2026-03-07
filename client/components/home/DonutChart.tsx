"use client";

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
  strokeWidth = 24,
}: {
  data: DataItem[];
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <Card>No data</Card>;
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const cumulativeValues = data.reduce((acc, item) => {
    const percentage = item.value / total;
    acc.push((acc[acc.length - 1] || 0) + percentage);
    return acc;
  }, [] as number[]);

  return (
    <Card>
      <ChartWrapper>
        <svg width={size} height={size} role="img">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />

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
                  r={activeIndex === index ? radius + 2 : radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={
                    animated
                      ? `${dash} ${circumference}`
                      : `0 ${circumference}`
                  }
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: "all 0.6s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              );
            })}
          </g>
        </svg>

        <Center>
          <strong>{total}</strong>
          <span>Total Tasks</span>
        </Center>
      </ChartWrapper>

      <Legend>
        {data.map((item, i) => (
          <LegendItem key={i}>
            <Left>
              <Dot style={{ background: item.color }} />
              {item.label}
            </Left>

            <b>
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </b>
          </LegendItem>
        ))}
      </Legend>
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`;

const ChartWrapper = styled.div`
  position: relative;
`;

const Center = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  strong {
    font-size: 30px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Legend = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  b {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
`;