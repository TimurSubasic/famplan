import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Dialog from "react-native-dialog";
import { Id } from "../convex/_generated/dataModel";
import Loading from "./Loading";

const HasFamily = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const familyId = userFull?.familyId as Id<"families">;

  const family = useQuery(api.families.getFamilyById, { id: familyId });

  const [visibleAdd, setVisibleAdd] = useState(false);

  const showDialogAdd = () => {
    setVisibleAdd(true);
  };

  const handleCancelAdd = () => {
    setVisibleAdd(false);
  };

  const handleAdd = async () => {
    await Clipboard.setStringAsync(family?.joinCode as string);
    setVisibleAdd(false);
  };

  const [visibleLeave, setVisibleLeave] = useState(false);

  const members = useQuery(api.users.getUsersByFamily, { familyId: familyId });

  //leave fam dialogs
  const showDialogLeave = () => {
    setVisibleLeave(true);
  };
  const handleCancelLeave = () => {
    setVisibleLeave(false);
  };
  const leaveFamily = useMutation(api.users.leaveFamily);
  const handleLeave = () => {
    leaveFamily({
      id: userFull!._id,
    });

    setVisibleLeave(false);
  };

  if (family === undefined) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1">
        <View className="flex flex-col flex-1 w-full items-center justify-between p-5 my-5">
          {/* Members View Box */}
          <View className=" border border-slate-600 rounded-lg bg-white w-full">
            <Text className="text-3xl font-semibold text-center my-5">
              {family?.name}
            </Text>

            <View className="flex flex-col items-center justify-center gap-5 my-3 mb-10">
              {members?.map((users, index) => (
                <View
                  key={index}
                  className={` w-full flex items-start justify-start `}
                  style={{ backgroundColor: users.color }}
                >
                  <Text className="font-semibold text-xl bg-white p-3 w-[35%] rounded-r-full">
                    {users.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/**Buttons box */}
          <View className="w-full flex flex-col items-center justify-center gap-5 mt-10">
            <TouchableOpacity
              onPress={showDialogAdd}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-center text-white font-bold text-xl">
                Add Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={showDialogLeave}
              className="p-5 bg-red-600 rounded-lg w-full "
            >
              <Text className="text-center text-white font-bold text-xl ">
                Leave Family
              </Text>
            </TouchableOpacity>
          </View>
          {/** Dialog box add fam */}
          <Dialog.Container visible={visibleAdd}>
            <Dialog.Title>{family?.joinCode}</Dialog.Title>
            <Dialog.Description>
              Click the copy button and send it to your family!
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={handleCancelAdd} />
            <Dialog.Button label="Copy" onPress={handleAdd} />
          </Dialog.Container>
          {/** Dialog box leave fam */}
          <Dialog.Container visible={visibleLeave}>
            <Dialog.Title>Leave Family</Dialog.Title>
            <Dialog.Description>
              You are about to leave your family, are you sure you want to
              continue?
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={handleCancelLeave} />
            <Dialog.Button label="Leave" onPress={handleLeave} />
          </Dialog.Container>
        </View>
      </View>
    </ScrollView>
  );
};

export default HasFamily;
