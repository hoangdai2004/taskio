"use client";

import React from "react";
import styled, { css } from "styled-components";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  hideTextOnMobile?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      icon,
      hideTextOnMobile = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $hideTextOnMobile={hideTextOnMobile}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && icon && <IconWrapper className="button-icon">{icon}</IconWrapper>}
        {children && <span className="button-text">{children}</span>}
      </StyledButton>
    );
  }
);

Button.displayName = "Button";

export default Button;

// Styled Components

const LoadingSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $hideTextOnMobile: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return css`
          padding: 6px 12px;
          font-size: 13px;
        `;
      case "lg":
        return css`
          padding: 12px 24px;
          font-size: 16px;
        `;
      case "icon":
        return css`
          width: 32px;
          height: 32px;
          padding: 0;
          ${IconWrapper} {
            margin-right: 0;
          }
        `;
      case "md":
      default:
        return css`
          padding: 10px 18px;
          font-size: 14px;
        `;
    }
  }}

  ${({ theme, $variant }) => {
    switch ($variant) {
      case "secondary":
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.textPrimary};
          border: 1px solid ${theme.colors.border};

          &:hover:not(:disabled) {
            background: ${theme.colors.borderLight};
          }
        `;
      case "danger":
        return css`
          background: ${theme.colors.danger};
          color: white;
          border: none;

          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: none;

          &:hover:not(:disabled) {
            background: ${theme.colors.borderLight};
            color: ${theme.colors.textPrimary};
          }
        `;
      case "outline":
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary}15;
          }
        `;
      case "icon":
        return css`
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: none;

          &:hover:not(:disabled) {
            background: ${theme.colors.borderLight};
            color: ${theme.colors.primary};
          }
        `;
      case "primary":
      default:
        return css`
          background: ${theme.colors.primary};
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  ${({ $hideTextOnMobile }) =>
    $hideTextOnMobile &&
    css`
      @media (max-width: 640px) {
        padding: 0;
        width: 34px;
        height: 34px;
        
        .button-text {
          display: none;
        }
        
        .button-icon {
          margin-right: 0;
        }
      }
    `}
`;
