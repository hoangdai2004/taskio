"use client";

import React, { useState } from "react";
import styled, { css } from "styled-components";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  title?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  fallback,
  title,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayFallback = fallback || getInitials(alt || "User");
  const showFallback = !src || hasError;

  return (
    <AvatarWrapper $size={size} title={title || alt} {...props}>
      {showFallback ? (
        <Fallback>{displayFallback}</Fallback>
      ) : (
        <Image
          src={src as string}
          alt={alt}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      )}
    </AvatarWrapper>
  );
};

// Styled Components

const AvatarWrapper = styled.div<{ $size: AvatarSize }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  flex-shrink: 0;

  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return css`
          width: 24px;
          height: 24px;
          font-size: 10px;
        `;
      case "lg":
        return css`
          width: 48px;
          height: 48px;
          font-size: 18px;
        `;
      case "xl":
        return css`
          width: 64px;
          height: 64px;
          font-size: 24px;
        `;
      case "md":
      default:
        return css`
          width: 32px;
          height: 32px;
          font-size: 12px;
        `;
    }
  }}
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const Fallback = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  user-select: none;
`;
