import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Index = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    if (!userFull?.familyId) {
      setHasFamily(false);
    } else {
      setHasFamily(true);
    }
  }, [userFull]);

  if (hasFamily) {
    return (
      <View className="p-5">
        <Text>No homes yet</Text>
      </View>
    );
  }
  // no family
  else {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <View className="w-full flex flex-col gap-5 items-center justify-center">
          <Text className="text-center text-slate-800 uppercase font-extrabold text-3xl">
            You must be in a family to create a home
          </Text>
          <FontAwesome size={260} name="home" color={"#1e293b"} />

          <TouchableOpacity
            className=" rounded-lg bg-slate-800 p-5 -mt-10 w-48"
            onPress={() => router.replace("/(tabs)/family")}
          >
            <Text className="text-white font-bold text-xl text-center">
              Go to family
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

export default Index;
