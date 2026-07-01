import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";

const APP_VERSION = "0.1.0";

export default function App() {
  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>HITL CI/CD POC</Text>
        <Text style={styles.sub}>React Native (Expo) · v{APP_VERSION}</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instrumented mobile simulation</Text>
          <Text style={styles.cardBody}>
            Playwright renders this real Expo app at mobile viewports and captures
            it as visual evidence on every PR.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Human-in-the-loop</Text>
          <Text style={styles.cardBody}>
            Reviewers see the actual rendered UI before approving the merge.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Release gates</Text>
          <Text style={styles.cardBody}>
            Every release passes a human approval gate before the (mocked) store
            submit.
          </Text>
        </View>
      </View>

      <View style={styles.cta}>
        <Pressable style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#0f1220" },
  header: { backgroundColor: "#b60205", paddingHorizontal: 16, paddingVertical: 24 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  sub: { color: "#ffffffd0", fontSize: 13, marginTop: 4 },
  main: { padding: 16, gap: 12, flex: 1 },
  card: { backgroundColor: "#1b1f36", borderRadius: 14, padding: 16 },
  cardTitle: { color: "#eef", fontSize: 15, fontWeight: "700", marginBottom: 6 },
  cardBody: { color: "#ccd", fontSize: 13 },
  cta: { padding: 16 },
  button: { backgroundColor: "#b60205", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
