import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
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
import colors from "../../components/colors";

const Settings = () => {
  const { signOut } = useAuth();

  const { user } = useUser();

  const clerkId = user?.id as string;

  const userFull = useQuery(api.users.getUser, { clerkId });

  const [username, setUsername] = useState(userFull?.username);
  const [pickedColor, setPickedColor] = useState(userFull?.color);
  const [text, setText] = useState("");

  useEffect(() => {
    setUsername(userFull?.username);
    setPickedColor(userFull?.color);
  }, [userFull]);

  // reset color if not saved
  const segments = useSegments();
  useEffect(() => {
    setPickedColor(userFull?.color);
  }, [segments]);

  /*

  Toggles for notifications need to add to database

  // toggle switches
  const [booking, setBooking] = useState(true);
  const [members, setMembers] = useState(true);

  // toggle switches functions
  const toggleBooking = () => setBooking((previousState) => !previousState);
  const toggleMembers = () => setMembers((previousState) => !previousState);
*/

  // show and hide alerts
  // delete and log out alerts
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [logOutVisible, setLogOutVisible] = useState(false);

  // show and hide delete
  const showDelete = () => {
    setDeleteVisible(true);
  };
  const handleDeleteCancel = () => {
    setDeleteVisible(false);
  };
  // handle deletes on confirmation
  const handleDelete = () => {
    setDeleteVisible(false);
  };

  // show and hide log out
  const showLogOut = () => {
    setLogOutVisible(true);
  };
  const handleLogOutCancel = () => {
    setLogOutVisible(false);
  };

  // handle log out on confirmation
  const handleLogOut = () => {
    signOut();
    setLogOutVisible(false);
  };

  // handle username change

  const changeUsername = useMutation(api.users.changeUsername);

  const handleUsernameSave = () => {
    if (text.length >= 2) {
      changeUsername({
        id: userFull!._id,
        username: text,
      });
      setText("");
    }
  };

  const changeColor = useMutation(api.users.changeColor);

  const handleColorSave = () => {
    if (userFull!.color !== pickedColor) {
      changeColor({
        id: userFull!._id,
        color: pickedColor!,
      });
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View className="p-5">
          <View className="w-full flex flex-row items-center justify-between mb-10 mt-5">
            <Text className="text-xl font-bold">Welcome, {username} </Text>
            <View
              className="h-12 w-12 rounded-full"
              style={{ backgroundColor: pickedColor }}
            />
          </View>

          <View className="flex flex-col items-center justify-center gap-10 w-full">
            {/**change username box */}
            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-xl font-semibold">Change username: </Text>
              <View className="flex flex-row gap-2 w-full">
                <TextInput
                  className="p-5 border border-slate-600 rounded-lg w-[65%] "
                  placeholder="New username"
                  placeholderTextColor={"#475569"}
                  onChangeText={(newText) => setText(newText)}
                  defaultValue={text}
                />
                <TouchableOpacity
                  onPress={handleUsernameSave}
                  className="flex-1 rounded-lg bg-slate-800 p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/**change user color box */}
            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-xl font-semibold">Change Color:</Text>

              <View className="flex flex-row flex-wrap justify-between w-full">
                {colors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ backgroundColor: color }}
                    onPress={() => setPickedColor(color)}
                    className={`w-[31%] h-16 mb-2 rounded-lg  ${
                      color === pickedColor
                        ? "border-4 border-blue-500"
                        : "border border-gray-300"
                    } `}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={handleColorSave}
                className="w-full rounded-lg bg-slate-800 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/*
            Notifications box 

            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-xl font-semibold">Notifications: </Text>

              <View className="flex flex-row w-full items-center justify-between">
                <Text className="text-lg font-semibold">New Bookings</Text>

                <Switch
                  trackColor={{ false: "#6b7280", true: "#2563eb" }}
                  thumbColor={booking ? "#1e293b" : "#d1d5db"}
                  ios_backgroundColor="#6b7280"
                  onValueChange={toggleBooking}
                  value={booking}
                />
              </View>
              <View className="w-full h-1 bg-slate-600 rounded-lg" />

              <View className="flex flex-row w-full items-center justify-between">
                <Text className="text-lg font-semibold">New Members</Text>

                <Switch
                  trackColor={{ false: "#6b7280", true: "#2563eb" }}
                  thumbColor={members ? "#1e293b" : "#d1d5db"}
                  ios_backgroundColor="#6b7280"
                  onValueChange={toggleMembers}
                  value={members}
                />
              </View>
            </View>
          
          Not in database yet
          */}
          </View>

          {/**Danger zone */}
          <View className="mt-16 mb-4 flex flex-col items-center justify-center w-full">
            <View className=" w-full bg-red-600 h-1.5 rounded-t-lg" />
            <View className=" w-full bg-slate-800 h-1" />
            <View className=" w-full bg-red-600 h-1.5 rounded-b-lg" />
            <TouchableOpacity
              onPress={showDelete}
              className="p-5 bg-red-600 rounded-lg w-full mt-5"
            >
              <Text className="text-center text-white font-bold text-xl ">
                Delete Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showLogOut}
              className="p-5 bg-red-600 rounded-lg w-full mt-5"
            >
              <Text className="text-center text-white font-bold text-xl ">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/** Delete dialog box */}
        <Dialog.Container visible={deleteVisible}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Description>
            This action removes all of your data, are you sure you want to
            continue?
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={handleDeleteCancel} />
          <Dialog.Button label="Delete" onPress={handleDelete} />
        </Dialog.Container>

        {/** Log Out dialog box */}
        <Dialog.Container visible={logOutVisible}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Description>
            You are about to Log Out of your account, are you sure you want to
            continue?
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={handleLogOutCancel} />
          <Dialog.Button label="Log Out" onPress={handleLogOut} />
        </Dialog.Container>
      </View>
    </ScrollView>
  );
};

export default Settings;
