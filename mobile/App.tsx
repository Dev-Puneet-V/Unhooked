import { StyleSheet, Text, View } from "react-native";
 
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
});