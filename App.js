// Skeleton React Native entry point. The CI/CD POC mocks the native build,
// so this file exists to represent "the app" — it is not compiled here.
import React from "react";
import { SafeAreaView, Text } from "react-native";
import { APP_VERSION } from "./src/version";

export default function App() {
  return (
    <SafeAreaView>
      <Text>HITL CI/CD POC — v{APP_VERSION}</Text>
    </SafeAreaView>
  );
}
