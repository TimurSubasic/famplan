import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface MarkedDates {
  [date: string]: {
    selected: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
  };
}

export default function HomesScreen() {
  const { id } = useLocalSearchParams();

  const homeId = id as Id<"homes">;

  const home = useQuery(api.homes.getHomesById, { id: homeId });

  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const today = new Date().toString();

  const handleDayPress = (day: DateData) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day.dateString);
      setEndDate("");
      setMarkedDates({
        [day.dateString]: {
          selected: true,
          startingDay: true,
          endingDay: true,
          color: "#000",
        },
      });
    } else {
      // Complete the selection
      const newEndDate = day.dateString;
      setEndDate(newEndDate);

      // Create marked dates object for the range
      const dates: MarkedDates = {};
      let currentDate = new Date(startDate);
      const lastDate = new Date(newEndDate);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        dates[dateString] = {
          selected: true,
          color: "#000",
          startingDay: dateString === startDate,
          endingDay: dateString === newEndDate,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(dates);
    }
  };

  const handleSave = () => {
    Alert.alert(`Start date: ${startDate} ; End date: ${endDate}`);
  };

  let bookings: any = null;

  //  bookings = [
  //   {
  //     name: "Timur",
  //     color: "#4363d8",
  //     fromDate: "2025-05-06",
  //     toDate: "2025-05-08",
  //   },
  //   {
  //     name: "Mirza",
  //     color: "#3cb44b",
  //     fromDate: "2025-05-11",
  //     toDate: "2025-05-13",
  //   },
  //   {
  //     name: "Emira",
  //     color: "#fabed4",
  //     fromDate: "2025-05-16",
  //     toDate: "2025-05-18",
  //   },
  //   {
  //     name: "Adnan",
  //     color: "#000075",
  //     fromDate: "2025-05-22",
  //     toDate: "2025-05-29",
  //   },
  //   {
  //     name: "Ridvan",
  //     color: "#469990",
  //     fromDate: "2025-05-01",
  //     toDate: "2025-05-04",
  //   },
  // ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex flex-row gap-2 items-start justify-start p-5 w-40"
      >
        <FontAwesome name="chevron-left" size={24} color="#1e293b" />
        <Text className="text-xl font-semibold text-slate-800 ">Back</Text>
      </TouchableOpacity>

      {/* main content */}

      <View className="p-5">
        <Text className="text-3xl font-semibold text-center mb-5 -mt-10">
          {home?.name}
        </Text>

        <View className="border border-slate-600 rounded-lg bg-white">
          {/** Calendar */}
          <Calendar
            style={{
              backgroundColor: "transparent",
            }}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            enableSwipeMonths={true}
            minDate={today}
            theme={{
              todayTextColor: "#000",
              selectedDayBackgroundColor: "#000",
              selectedDayTextColor: "#fff",
            }}
          />

          <View className="flex w-full items-center justify-center px-5">
            <TouchableOpacity
              onPress={handleSave}
              className="w-full my-5 rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bookings View Box */}
        <View className="mt-5 border border-slate-600 rounded-lg bg-white">
          <Text className="text-3xl font-semibold text-center my-5">
            Bookings
          </Text>

          <View className="flex flex-col items-center justify-center gap-5 my-3">
            {bookings ? (
              bookings.map((users: any, index: number) => (
                <View
                  key={index}
                  className={` w-full flex flex-row items-center justify-between p-5 `}
                >
                  <Text className="font-semibold text-xl bg-white w-[35%] rounded-r-3xl">
                    {users.name}
                  </Text>

                  <View className="felx flex-row items-center justify-center gap-5">
                    <Text className="font-medium text-lg">
                      {users.fromDate.split("-").slice(1).join("-")}
                    </Text>
                    <FontAwesome
                      size={30}
                      name="arrow-circle-right"
                      color={users.color}
                      className="shadow-xl"
                    />
                    <Text className="font-medium text-lg">
                      {users.toDate.split("-").slice(1).join("-")}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="w-full my-10">
                <Text className="text-center text-2xl font-semibold">
                  There is no bookings
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
