// Skeleton React Native entry point. The CI/CD POC mocks the native build,
// so this file exists to represent "the app" — it is not compiled here.
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { APP_VERSION } from "./src/version";
import { HOME_CARDS } from "./src/homeCards";

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.header}>HITL CI/CD POC — v{APP_VERSION}</Text>
      <ScrollView contentContainerStyle={styles.cards}>
        {HOME_CARDS.map((card) => (
          <View key={card.title} style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardBody}>{card.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1c1e",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cards: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: "#3c3c43",
    lineHeight: 20,
  },
});
