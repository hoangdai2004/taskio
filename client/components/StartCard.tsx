'use client'

import styled from "styled-components";

export default function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardValue>{value}</CardValue>
      <Progress>
        <Fill color={color} />
      </Progress>
    </Card>
  );
}

const Card = styled.div`
  background: #f5f5f5;
  padding: 24px;
  color: #000;
  border-radius: 6px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CardTitle = styled.div`
  color: #6b7280;
`;

const CardValue = styled.div`
  font-size: 30px;
  font-weight: 600;
`;

const Progress = styled.div`
  height: 6px;
  background: #eee;
  border-radius: 10px;
  margin-top: 16px;
`;

const Fill = styled.div<{ color: string }>`
  height: 100%;
  width: 60%;
  background: ${(p) => p.color};
  border-radius: 10px;
`;
