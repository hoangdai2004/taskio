import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;

  background:
    linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)),
    url("/images/background.jpg") center/cover no-repeat;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Container = styled.div`
  width: 950px;
  background: ${({ theme }) => theme.colors.card};

  display: flex;
  border-radius: 14px;
  overflow: hidden;

  box-shadow: 0 25px 50px rgba(0,0,0,0.12);

  @media (max-width: 768px) {
    width: 100%;
    margin: 20px;
  }
`;

export const ImageWrapper = styled.div`
  flex: 1;

  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  img {
    width: 100%;
    max-width: 360px;
    height: auto;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Form = styled.form`
  flex: 1;
  padding: 50px;

  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
`;

export const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 10px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 14px;

  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: white;

  transition: 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderLight};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Icon = styled.div`
  position: absolute;

  right: 12px;
  top: 50%;

  transform: translateY(-50%);
  cursor: pointer;

  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  div {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  button {
    background: none;
    border: none;

    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px;

  border-radius: 8px;
  border: none;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  font-weight: 600;
  font-size: 15px;

  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.primaryLight};
    cursor: not-allowed;
  }
`;

export const AuthRedirect = styled.div`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  button {
    background: none;
    border: none;

    margin-left: 6px;

    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;

    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ErrorMessage = styled.div`
  background: #fee2e2;
  color: ${({ theme }) => theme.colors.danger};

  padding: 10px;
  border-radius: 6px;

  font-size: 14px;
  text-align: center;
`;