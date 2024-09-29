import React, { useState, useReducer, useEffect } from 'react';
import { Keyboard, ScrollView, TouchableOpacity, Button, View, Modal, Text } from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from './components/Task';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressBar from 'react-native-progress/Bar';

// Styled Components
const Container = styled(LinearGradient)`
  flex: 1;
  padding-horizontal: 20px;
`;

const Header = styled.View`
  padding-top: 60px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #FFFFFF;
`;

const ClearBtn = styled.TouchableOpacity`
  background-color: #EF4444;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
`;

const ClearBtnText = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
`;

const FilterWrapper = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: 20px;
  background-color: #F3F4F6;
  border-radius: 30px;
  padding: 10px 0;
`;

const FilterButton = styled.TouchableOpacity`
  padding: 10px 20px;
  border-radius: 20px;
  background-color: ${(props) => (props.selected ? '#3B82F6' : 'transparent')};
`;

const FilterText = styled.Text`
  font-size: 16px;
  color: ${(props) => (props.selected ? '#FFFFFF' : '#374151')};
  font-weight: bold;
`;

const TasksContainer = styled.View`
  margin-top: 20px;
`;

const TaskInputWrapper = styled.View`
  position: absolute;
  bottom: 100px;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: 20px;
`;

const Input = styled.TextInput`
  padding: 15px;
  background-color: #F3F4F6;
  border-radius: 60px;
  border: 1px solid #93C5FD;
  flex: 1;
  margin-right: 10px;
  color: #374151;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const AddButton = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  background-color: #F59E0B;
  border-radius: 60px;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
`;

const AddButtonText = styled.Text`
  font-size: 30px;
  color: #FFFFFF;
`;

// Reducer function to handle tasks state
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, { text: action.payload, done: false }];
    case 'TOGGLE_TASK':
      return state.map((task, index) =>
        index === action.payload ? { ...task, done: !task.done } : task
      );
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
};

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      const saved = await AsyncStorage.getItem('tasks');
      if (saved) dispatch({ type: 'LOAD_TASKS', payload: JSON.parse(saved) });
    };
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      Keyboard.dismiss();
      dispatch({ type: 'ADD_TASK', payload: task });
      setTask('');
    }
  };

  const toggleTask = (index) => {
    dispatch({ type: 'TOGGLE_TASK', payload: index });
  };

  const clearAll = () => setModalVisible(true);

  const confirmClearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    setModalVisible(false);
  };

  const displayedTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    return filter === 'Completed' ? task.done : !task.done;
  });

  const completedTasks = tasks.filter(task => task.done).length;
  const progress = tasks.length ? completedTasks / tasks.length : 0;

  return (
    <Container colors={['#1E3A8A', '#2563EB']}>
      <Header>
        <Title>Today's Tasks</Title>
        <ClearBtn onPress={clearAll}>
          <ClearBtnText>Clear All</ClearBtnText>
        </ClearBtn>
      </Header>

      <FilterWrapper>
        {['All', 'Completed', 'Pending'].map((status) => (
          <FilterButton key={status} selected={filter === status} onPress={() => setFilter(status)}>
            <FilterText selected={filter === status}>{status}</FilterText>
          </FilterButton>
        ))}
      </FilterWrapper>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Are you sure you want to clear all tasks?</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Button title="Cancel" color="#3B82F6" onPress={() => setModalVisible(false)} />
              <Button title="Confirm" color="#EF4444" onPress={confirmClearAll} />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <TasksContainer>
          {displayedTasks.map((task, index) => (
            <TouchableOpacity key={index} onPress={() => toggleTask(index)}>
              <Task text={task.text} done={task.done} />
            </TouchableOpacity>
          ))}
        </TasksContainer>
      </ScrollView>

      <TaskInputWrapper>
        <Input
          placeholder="Write a task"
          placeholderTextColor="#9CA3AF"
          value={task}
          onChangeText={setTask}
        />
        <AddButton onPress={addTask}>
          <AddButtonText>+</AddButtonText>
        </AddButton>
      </TaskInputWrapper>

      <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
        <ProgressBar progress={progress} width={null} color="#10B981" />
        <Text style={{ textAlign: 'center', color: '#FFFFFF', marginTop: 5 }}>
          {Math.round(progress * 100)}% Completed
        </Text>
      </View>
    </Container>
  );
}
