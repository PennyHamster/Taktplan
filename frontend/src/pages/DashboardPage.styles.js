import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.h1`
  color: #333;
`;

export const NewTaskButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

export const Board = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
`;