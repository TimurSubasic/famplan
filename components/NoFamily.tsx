import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Dialog from "react-native-dialog";

const NoFamily = () => {
  const convex = useConvex();

  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const [code, setCode] = useState("");

  const [name, setName] = useState("");

  const [visible, setVisible] = useState(false);

  const createFamily = useMutation(api.families.createFamily);

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = () => {
    // The user has pressed the "Create" button, so here you can do your own logic.
    // ...Your logic

    createFamily({
      name: name,
    });

    setVisible(false);
  };

  const changeFamilyId = useMutation(api.users.changeFamilyId);

  const [finalCode, setFinalCode] = useState<string | undefined>(undefined);

  const [codeAttempt, setCodeAttempt] = useState(false);

  const family = useQuery(
    api.families.getFamilyByCode,
    finalCode ? { joinCode: finalCode } : "skip"
  );

  const handleCodeJoin = () => {
    setFinalCode(code.toUpperCase());
  };

  useEffect(() => {
    if (family) {
      changeFamilyId({
        id: userFull!._id,
        familyId: family!._id,
      });
    }
    setCodeAttempt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family]);

  const segments = useSegments();

  useEffect(() => {
    if (codeAttempt) {
      setCodeAttempt(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      bounces={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1">
        <View className="flex flex-col flex-1 w-full items-center justify-between p-5 my-5">
          <View className="flex flex-col w-full items-start justify-center gap-3">
            <Text className="text-xl font-semibold">Join via Code:</Text>
            <View className="flex flex-row gap-2 w-full">
              <TextInput
                className="p-5 border border-slate-600 rounded-lg w-[65%] "
                placeholder="Code"
                placeholderTextColor={"#475569"}
                onChangeText={(newText) => setCode(newText)}
                defaultValue={code}
              />
              <TouchableOpacity
                onPress={handleCodeJoin}
                className="flex-1 rounded-lg bg-slate-800 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Join
                </Text>
              </TouchableOpacity>
            </View>
            {codeAttempt ? (
              <Text className="text-red-500 font-semibold text-md">
                No family found
              </Text>
            ) : (
              <View />
            )}
          </View>

          <View className="flex w-full items-center justify-center my-10">
            <FontAwesome5 size={160} name="users-slash" color={"#1e293b"} />
            <Text className="text-center text-slate-800 uppercase font-bold text-2xl my-5 ">
              You don&apos;t have a Family
            </Text>
          </View>

          <View className="flex flex-col gap-5 w-full items-center justify-center">
            <TouchableOpacity
              onPress={showDialog}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Create a Family
              </Text>
            </TouchableOpacity>

            {/** Dialog box */}
            <Dialog.Container visible={visible}>
              <Dialog.Title>Create Family</Dialog.Title>
              <Dialog.Description>Choose your family name:</Dialog.Description>
              <Dialog.Input onChangeText={setName} />
              <Dialog.Button label="Cancel" onPress={handleCancel} />
              <Dialog.Button label="Create" onPress={handleCreate} />
            </Dialog.Container>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoFamily;
