import styled from 'styled-components';

const priorityColors = {
  1: '#ff4d4f', // Red for high priority
  2: '#faad14', // Orange for medium priority
  3: '#52c41a', // Green for low priority
};

export const CardContainer = styled.div`
  background: white;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardTitle = styled.h4`
  margin: 0;
  font-weight: 500;
`;

export const PriorityIndicator = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ priority }) => priorityColors[priority] || '#ccc'};
`;