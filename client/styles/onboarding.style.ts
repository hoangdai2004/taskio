import styled from "styled-components";

export const Wrapper = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Container = styled.section`
  width: 100%;
  max-width: 520px;

  background: ${({ theme }) => theme.colors.surface};

  border-radius: 16px;
  padding: 32px;

  display: flex;
  flex-direction: column;
  gap: 24px;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
`;

export const Header = styled.header`
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 6px;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Input = styled.input`
  height: 46px;
  border-radius: 10px;
  padding: 0 14px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};

  outline: none;
  transition: 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.borderLight};
    cursor: not-allowed;
  }
`;

export const SlugWrapper = styled.div`
  display: flex;
  align-items: center;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  overflow: hidden;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

export const Prefix = styled.span`
  padding: 0 12px;
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const HelperText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Button = styled.button`
  height: 48px;
  border-radius: 12px;

  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  height: 48px;
  border-radius: 12px;

  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;

  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ErrorMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
`;

export const Footer = styled.footer`
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  button {
    margin-left: 6px;
    background: none;
    border: none;

    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;

    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;