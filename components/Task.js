import React from 'react';
import styled from 'styled-components/native';

const TaskContainer = styled.View`
  background-color: #F3F4F6;
  padding: 15px;
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TaskText = styled.Text`
  color: ${(props) => (props.done ? '#9CA3AF' : '#374151')};
  text-decoration-line: ${(props) => (props.done ? 'line-through' : 'none')};
`;

const Task = ({ text, done }) => {
  return (
    <TaskContainer>
      <TaskText done={done}>{text}</TaskText>
    </TaskContainer>
  );
};

export default Task;
