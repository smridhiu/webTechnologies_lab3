import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editTaskId, setEditTaskId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    async function loadTasks() {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }
    loadTasks();
  }, []);

  useEffect(() => {
    async function saveTasks() {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    }
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks([...tasks, newTask]);
      setTask('');
      animateTaskAddition();
    }
  };

  const deleteTask = taskId => {
    setTasks(tasks.filter(item => item.id !== taskId));
    animateTaskAddition();
  };

  const toggleTaskCompletion = taskId => {
    setTasks(tasks.map(item =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleEditTask = (taskId, text) => {
    setEditTaskId(taskId);
    setTask(text);
  };

  const updateTask = () => {
    if (task.trim() && editTaskId) {
      setTasks(tasks.map(item =>
        item.id === editTaskId ? { ...item, text: task } : item
      ));
      setTask('');
      setEditTaskId(null);
    }
  };

  const animateTaskAddition = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add or edit a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={editTaskId ? updateTask : addTask}
        >
          <Text style={styles.addButtonText}>{editTaskId ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
              <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditTask(item.id, item.text)}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Text>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        style={{ opacity: fadeAnim }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#5C5CFF",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
  },
  taskCompleted: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFDD44",
    borderRadius: 5,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FF5C5C",
    borderRadius: 5,
  },
});
