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
  background: ${({ theme }) => theme.colors.card};
  padding: 24px;

  color: ${({ theme }) => theme.colors.textPrimary};

  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 10px;
`;

const CardTitle = styled.div`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.textMuted};
`;

const CardValue = styled.div`
  font-size: 30px;
  font-weight: 700;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Progress = styled.div`
  height: 6px;

  background: ${({ theme }) => theme.colors.border};

  border-radius: 10px;
  margin-top: 16px;

  overflow: hidden;
`;

const Fill = styled.div<{ color: string }>`
  height: 100%;
  width: 60%;

  background: ${({ color }) => color};

  border-radius: 10px;
`;