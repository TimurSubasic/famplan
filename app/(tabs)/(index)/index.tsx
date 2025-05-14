import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Dialog from "react-native-dialog";

const Index = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const [hasFamily, setHasFamily] = useState(false);

  const homes = useQuery(
    api.homes.getHomesByFamilyId,
    userFull?.familyId
      ? {
          familyId: userFull.familyId,
        }
      : "skip"
  );

  // dialog stuff
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Create Home");
  const [body, setBody] = useState("Choose your home name");

  const handleCancel = () => {
    setVisible(false);
  };

  const createHome = useMutation(api.homes.createHome);

  const handleCreate = async () => {
    const home = await createHome({
      name: name,
      familyId: userFull!.familyId!,
    });

    if (home.success) {
      setVisible(false);
    } else {
      setTitle("Home With That Name Exists");
      setBody("Please choose a diferent home name");
    }
  };

  useEffect(() => {
    if (!userFull?.familyId) {
      setHasFamily(false);
    } else {
      setHasFamily(true);
    }
  }, [userFull]);

  const router = useRouter();

  if (hasFamily) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5 flex-1 items-center justify-between w-full my-5">
          {/* top part */}
          <View className="w-full flex flex-col gap-5">
            <Text className="text-center uppercase font-bold text-2xl my-5">
              Your Homes
            </Text>
            <View className="flex flex-col gap-5 w-full items-center justify-center">
              {/* homes.map should be here */}

              {homes ? (
                homes!.map((home, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(index)/[id]",
                        params: { id: home._id },
                      })
                    }
                    className="p-4 rounded-lg bg-white shadow-lg w-full flex flex-row items-center justify-between border border-slate-600"
                  >
                    <Text className="text-xl font-semibold">{home.name}</Text>
                    <FontAwesome size={28} name="calendar" color={"#fffff"} />
                  </TouchableOpacity>
                ))
              ) : (
                <View className="flex w-full items-center justify-center mt-10">
                  <MaterialIcons
                    name="add-home-work"
                    size={260}
                    color="#1e293b"
                  />
                  <Text className="text-center uppercase font-bold text-2xl my-5">
                    Please Create a Home
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* buttons */}
          <View className="flex flex-col w-full items-center justify-center gap-5">
            <TouchableOpacity
              onPress={() => setVisible(true)}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Create new Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/** Dialog box */}
        <Dialog.Container visible={visible}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description> {body} </Dialog.Description>
          <Dialog.Input onChangeText={setName} />
          <Dialog.Button label="Cancel" onPress={handleCancel} />
          <Dialog.Button label="Create" onPress={handleCreate} />
        </Dialog.Container>
      </ScrollView>
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
