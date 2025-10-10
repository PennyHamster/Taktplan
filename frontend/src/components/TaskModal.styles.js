import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled.div`
  background: white;
  width: 500px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

export const ModalTitle = styled.h2`
  margin: 0;
`;

export const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

export const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const TextArea = styled.textarea`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 100px;
`;

export const Select = styled.select`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ primary }) => (primary ? '#007bff' : '#f0f0f0')};
  color: ${({ primary }) => (primary ? 'white' : '#333')};
  margin-left: 10px;

  &:hover {
    opacity: 0.9;
  }
`;