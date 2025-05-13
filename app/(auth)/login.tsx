import { useSSO } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Login = () => {
  const { startSSOFlow } = useSSO();

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log("Error GoogleOAuth: ", error);
    }
  };

  return (
    <View className="flex-1 flex-col items-center justify-center">
      <TouchableOpacity
        onPress={() => handleGoogleSignIn()}
        className="p-2 px-5 rounded-lg bg-blue-600 shadow-xl flex flex-row gap-2 items-center jsustify-center"
      >
        <Text className="text-2xl text-center text-white">
          Login via Google
        </Text>
        <FontAwesome name="google-plus-square" size={55} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Login;
