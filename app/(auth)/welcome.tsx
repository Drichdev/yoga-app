import { useRouter } from "expo-router";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = Dimensions.get("window");

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Titre */}
      <View style={{ marginTop: 60, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ position: "relative", marginRight: 4 }}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#FFD59A",
                transform: [{ rotate: "-15deg" }],
                borderRadius: 12,
                zIndex: -1,
              }}
            />
            <Text
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                fontSize: 40,
                fontWeight: "bold",
              }}
            >
              Yoga
            </Text>
          </View>

          <Text style={{ fontSize: 40, fontWeight: "bold" }}>Workout</Text>
        </View>

        <View
          style={{
            marginTop: 8,
            height: 6,
            width: 100,
            borderRadius: 3,
            backgroundColor: "#ccc",
            opacity: 0.6,
          }}
        />

        <Text
          style={{
            fontSize: 16,
            marginTop: 16,
            textAlign: "center",
            color: "#555",
          }}
        >
          Discover your way to yoga life style
        </Text>
      </View>

      <Image
        source={require("../../assets/images/welcome.png")}
        style={{ width: 400, height: 300 }}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={{
          paddingVertical: 16,
          paddingHorizontal: 32,
          backgroundColor: "#4A90E2",
          borderRadius: 16,
          marginBottom: 40,
          width: "100%",
          alignItems: "center",
        }}
        onPress={() => router.push("/(auth)/profile-setup")}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, color: "#fff" }}>
          Get started
        </Text>
      </TouchableOpacity>
    </View>
  );
}
