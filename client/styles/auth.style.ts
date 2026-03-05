import styled from "styled-components";

export const Wrapper = styled.div`
  background: url("/images/background.jpg") no-repeat center fixed;
  background-size: cover;

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;

  .dark & {
    background:
      linear-gradient(rgba(5, 8, 22, 0.8), rgba(5, 8, 22, 0.8)),
      url("/images/background.jpg") no-repeat center fixed;
    background-size: cover;
  }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
`;

export const Title = styled.h1`
  margin: 0 auto;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
`;

export const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #fff;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #fff;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
`;

export const Input = styled.input`
  padding: 0.6rem 2.5rem 0.6rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  background: #fff;
  color: #000;
  width: 100%;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

export const Button = styled.button`
  padding: 0.6rem;
  background: #2563eb;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ImageWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const AuthRedirect = styled.div`
  margin: 1rem auto 0;
  font-size: 0.9rem;
  color: #fff;
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #fff;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;

  &:hover {
    color: #2563eb;
  }
`;

export const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
`;
