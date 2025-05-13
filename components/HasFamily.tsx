import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Dialog from "react-native-dialog";

const HasFamily = () => {
  const membersList = [
    { name: "Timur", color: "#4363d8" }, //blue
    { name: "Mirza", color: "#3cb44b" }, //green
    { name: "Emira", color: "#fabed4" }, //pink
    { name: "Adnan", color: "#000075" }, //navy
    { name: "Ridvan", color: "#469990" }, //teal
    { name: "Nadja", color: "#911eb4" }, //purple
    { name: "Aida", color: "#e6194B" }, //red
    { name: "Sakib", color: "#bfef45" }, //lime
  ];

  const [visible, setVisible] = useState(false);

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleLeave = () => {
    setVisible(false);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <View className="p-5">
          {/* Members View Box */}
          <View className="mt-5 border border-slate-600 rounded-lg bg-white">
            <Text className="text-3xl font-semibold text-center my-5">
              Family Name
            </Text>

            <View className="flex flex-col items-center justify-center gap-5 my-3">
              {membersList.map((users, index) => (
                <View
                  key={index}
                  className={` w-full flex items-start justify-start `}
                  style={{ backgroundColor: users.color }}
                >
                  <Text className="font-semibold text-xl bg-white p-3 w-[35%] rounded-r-full">
                    {users.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/**Buttons box */}
          <View className="w-full flex flex-col items-center justify-center gap-5 mt-10">
            <TouchableOpacity className="w-full rounded-lg bg-slate-800 p-5">
              <Text className="text-center text-white font-bold text-xl">
                Add Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={showDialog}
              className="p-5 bg-red-600 rounded-lg w-full "
            >
              <Text className="text-center text-white font-bold text-xl ">
                Leave Family
              </Text>
            </TouchableOpacity>
          </View>
          {/** Dialog box */}
          <Dialog.Container visible={visible}>
            <Dialog.Title>Leave Family</Dialog.Title>
            <Dialog.Description>
              You are about to leave your family, are you sure you want to
              continue?
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={handleCancel} />
            <Dialog.Button label="Leave" onPress={handleLeave} />
          </Dialog.Container>
        </View>
      </View>
    </ScrollView>
  );
};

export default HasFamily;
