import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from "react-native";

const APP_VERSION = "0.1.0";
const PARK_NAME = "Thunderloop Park";

// Featured coasters shown on the home screen.
const COASTERS = [
  { emoji: "🎢", name: "The Screaming Comet", blurb: "0 to 120 km/h in 2.8s — hands up!" },
  { emoji: "🌀", name: "Cyclone Twister", blurb: "Seven inversions of pure chaos." },
  { emoji: "💦", name: "Splash Canyon", blurb: "The wettest drop in the park." },
];

// Every ride's category maps to a themed color, reused for its thumbnail block
// and its category chip. (The Figma uses per-ride gradients; the baseline uses a
// solid category color — an accepted simplification, see specs/attractions-list.md.)
const CATEGORY_COLOR = {
  Thrill: "#f637ec",
  Water: "#37b6f6",
  Family: "#34d399",
  Dark: "#7b2ff7",
};

// The park's rides shown on the Attractions tab. `thrill` (0–5) drives the dot meter.
const ATTRACTIONS = [
  { emoji: "🎢", name: "The Screaming Comet", category: "Thrill", stat: "⚡ 120 km/h", thrill: 5 },
  { emoji: "🌀", name: "Cyclone Twister", category: "Thrill", stat: "🔁 7 loops", thrill: 5 },
  { emoji: "💦", name: "Splash Canyon", category: "Water", stat: "💧 22 m drop", thrill: 3 },
  { emoji: "🎠", name: "Grand Carousel", category: "Family", stat: "🎵 all ages", thrill: 1 },
  { emoji: "🎡", name: "Skyline Wheel", category: "Family", stat: "🌇 85 m views", thrill: 2 },
  { emoji: "👻", name: "Haunted Mine", category: "Dark", stat: "🕯️ indoor", thrill: 3 },
];

// Filter chips above the list. "All" clears the filter and shows every ride.
const ATTRACTION_FILTERS = ["All", "Thrill", "Water", "Family"];

// Primary navigation tabs. Home is active by default.
const TABS = [
  { key: "home", label: "Home", icon: "🎡" },
  { key: "attractions", label: "Attractions", icon: "🎠" },
  { key: "about", label: "About Us", icon: "ℹ️" },
];

// Opening hours shown on the About Us screen.
const PARK_HOURS = [
  { days: "Mon – Thu", hours: "10:00 – 20:00" },
  { days: "Fri – Sat", hours: "10:00 – 23:00" },
  { days: "Sunday", hours: "10:00 – 21:00" },
];

function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎢</Text>
        <Text style={styles.heroTitle}>{PARK_NAME}</Text>
        <Text style={styles.heroSub}>Where the thrills never stop!</Text>
      </View>

      <Text style={styles.sectionTitle}>Featured Coasters</Text>
      {COASTERS.map((c) => (
        <View key={c.name} style={styles.card}>
          <Text style={styles.cardEmoji}>{c.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{c.name}</Text>
            <Text style={styles.cardBody}>{c.blurb}</Text>
          </View>
        </View>
      ))}

      <Pressable style={styles.button} accessibilityRole="button">
        <Text style={styles.buttonText}>🎟️  Buy Day Passes</Text>
      </Pressable>
    </ScrollView>
  );
}

// One ride: a solid category-colored thumbnail + name + category chip + a stat
// line ending in a 5-dot thrill meter (● filled / ○ empty).
function AttractionCard({ attraction }) {
  const color = CATEGORY_COLOR[attraction.category];
  const meter = "●".repeat(attraction.thrill) + "○".repeat(5 - attraction.thrill);
  return (
    <View style={styles.attractionCard}>
      <View style={[styles.thumb, { backgroundColor: color }]}>
        <Text style={styles.thumbEmoji}>{attraction.emoji}</Text>
      </View>
      <View style={styles.attractionText}>
        <Text style={styles.attractionName}>{attraction.name}</Text>
        <View style={[styles.categoryChip, { backgroundColor: color }]}>
          <Text style={styles.categoryChipText}>{attraction.category}</Text>
        </View>
        <Text style={styles.attractionStat}>
          {attraction.stat} · Thrill {meter}
        </Text>
      </View>
    </View>
  );
}

function AttractionsScreen() {
  const [filter, setFilter] = useState("All");
  const rides =
    filter === "All" ? ATTRACTIONS : ATTRACTIONS.filter((a) => a.category === filter);

  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <Text style={styles.attractionsTitle}>Attractions</Text>
      <Text style={styles.attractionsSub}>{ATTRACTIONS.length} rides & attractions</Text>

      <View style={styles.chipRow}>
        {ATTRACTION_FILTERS.map((c) => {
          const active = c === filter;
          return (
            <Pressable
              key={c}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(c)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{c}</Text>
            </Pressable>
          );
        })}
      </View>

      {rides.map((a) => (
        <AttractionCard key={a.name} attraction={a} />
      ))}
    </ScrollView>
  );
}

function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenBody}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>ℹ️</Text>
        <Text style={styles.heroTitle}>About Us</Text>
        <Text style={styles.heroSub}>Spinning smiles since 1974</Text>
      </View>

      <Text style={styles.sectionTitle}>Our Story</Text>
      <View style={styles.card}>
        <Text style={styles.cardBody}>
          {PARK_NAME} opened its gates in 1974 with a single wooden coaster and a
          big dream: to be the friendliest thrill on Earth. Fifty years and more
          than a dozen record-breaking rides later, three generations of families
          have thrown their hands in the air with us. From the first click of the
          lift hill to the last splash of the day, we live for that unforgettable
          moment when the ground drops away and the whole park screams as one.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Park Hours</Text>
      <View style={styles.card}>
        <View style={styles.cardText}>
          {PARK_HOURS.map((row) => (
            <View key={row.days} style={styles.hoursRow}>
              <Text style={styles.hoursDays}>{row.days}</Text>
              <Text style={styles.hoursTime}>{row.hours}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Find Us</Text>
      <View style={styles.card}>
        <Text style={styles.cardEmoji}>📍</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Thunderloop Park</Text>
          <Text style={styles.cardBody}>
            1 Coaster Way, Thrillsville, CA 90210
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Get in Touch</Text>
      <View style={styles.card}>
        <Text style={styles.cardEmoji}>✉️</Text>
        <View style={styles.cardText}>
          <Text style={styles.cardBody}>hello@thunderloop.park</Text>
          <Text style={styles.cardBody}>+1 (555) 843-7767</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const SCREENS = {
  home: HomeScreen,
  attractions: AttractionsScreen,
  about: AboutScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const Screen = SCREENS[activeTab];

  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🎢 {PARK_NAME}</Text>
        <Text style={styles.topBarSub}>React Native (Expo) · v{APP_VERSION}</Text>
      </View>

      <View style={styles.main}>
        <Screen />
      </View>

      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#1a0b2e" },
  topBar: { backgroundColor: "#7b2ff7", paddingHorizontal: 16, paddingVertical: 20 },
  topBarTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  topBarSub: { color: "#ffffffcc", fontSize: 12, marginTop: 4 },

  main: { flex: 1 },
  screenBody: { padding: 16, gap: 12 },

  hero: {
    backgroundColor: "#f637ec",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  heroEmoji: { fontSize: 52 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 8, textAlign: "center" },
  heroSub: { color: "#fff", fontSize: 15, fontWeight: "600", marginTop: 4 },

  sectionTitle: { color: "#ffd93d", fontSize: 18, fontWeight: "800", marginTop: 8 },
  card: {
    backgroundColor: "#2d1b4e",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardEmoji: { fontSize: 34 },
  cardText: { flex: 1 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardBody: { color: "#d6c7f0", fontSize: 13, lineHeight: 20 },

  hoursRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  hoursDays: { color: "#fff", fontSize: 14, fontWeight: "600" },
  hoursTime: { color: "#ffd93d", fontSize: 14, fontWeight: "700" },

  button: {
    backgroundColor: "#ffd93d",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#1a0b2e", fontSize: 17, fontWeight: "800" },

  attractionsTitle: { color: "#ffd93d", fontSize: 26, fontWeight: "900" },
  attractionsSub: { color: "#d6c7f0", fontSize: 14, marginTop: 2, marginBottom: 4 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  filterChip: { backgroundColor: "#2d1b4e", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  filterChipActive: { backgroundColor: "#ffd93d" },
  filterChipText: { color: "#9a8bb8", fontSize: 13, fontWeight: "700" },
  filterChipTextActive: { color: "#1a0b2e" },

  attractionCard: {
    backgroundColor: "#2d1b4e",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  thumb: { width: 72, height: 72, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  thumbEmoji: { fontSize: 38 },
  attractionText: { flex: 1, gap: 4 },
  attractionName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  categoryChip: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  categoryChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  attractionStat: { color: "#d6c7f0", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0f0620",
    borderTopWidth: 1,
    borderTopColor: "#7b2ff7",
    paddingVertical: 8,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 6 },
  tabIcon: { fontSize: 22, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: "#9a8bb8", fontSize: 12, fontWeight: "600", marginTop: 2 },
  tabLabelActive: { color: "#ffd93d", fontWeight: "800" },
});
