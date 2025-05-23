import Loading from "@/components/Loading";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Dialog from "react-native-dialog";

interface MarkedDates {
  [date: string]: {
    selected: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
  };
}

export default function HomesScreen() {
  //get home info
  const { id } = useLocalSearchParams();
  const homeId = id as Id<"homes">;
  const home = useQuery(api.homes.getHomesById, { id: homeId });

  //get user
  const { user } = useUser();
  const clerkId = user?.id as string;
  const userFull = useQuery(api.users.getUserByClerk, { clerkId });

  const router = useRouter();

  //date consts states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [localMarkedDates, setLocalMarkedDates] = useState<MarkedDates>({});

  const markedDatesDB = useQuery(api.bookings.getMarkedDatesForHome, {
    homeId: homeId,
  });

  useEffect(() => {
    setLocalMarkedDates({ ...markedDatesDB, ...markedDates });
  }, [markedDatesDB, markedDates]);

  const today = new Date().toString();

  //calendar functions
  const handleDayPress = (day: DateData) => {
    // Check if the pressed day is already marked in the database
    if (markedDatesDB && markedDatesDB[day.dateString]) {
      // Day is already booked, do nothing
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day.dateString);
      setEndDate("");
      setMarkedDates({
        [day.dateString]: {
          selected: true,
          startingDay: true,
          endingDay: true,
          color: userFull?.color as string,
        },
      });
    } else {
      // Check if the new end date is before the start date
      const newEndDate = new Date(day.dateString);
      const currentStartDate = new Date(startDate);

      if (newEndDate < currentStartDate) {
        // Reset selection if end date is before start date
        setStartDate("");
        setEndDate("");
        setMarkedDates({});
        return;
      }

      // Check for overlaps with existing bookings
      let hasOverlap = false;
      let currentDate = new Date(startDate);
      const lastDate = new Date(day.dateString);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        if (markedDatesDB && markedDatesDB[dateString]) {
          hasOverlap = true;
          break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (hasOverlap) {
        // Reset selection if there's an overlap
        setStartDate("");
        setEndDate("");
        setMarkedDates({});
        return;
      }

      // Complete the selection
      setEndDate(day.dateString);

      // Create marked dates object for the range
      const dates: MarkedDates = {};
      currentDate = new Date(startDate);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        dates[dateString] = {
          selected: true,
          color: userFull?.color as string,
          startingDay: dateString === startDate,
          endingDay: dateString === day.dateString,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(dates);
    }
  };

  const currentBooking = useQuery(api.bookings.getBookingsByHomeAndUser, {
    homeId: homeId,
    userId: userFull?._id as string,
  });

  // dialog stuff
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  const deleteBooking = useMutation(api.bookings.deleteBooking);

  const handleDelete = () => {
    handleBookingDelete();

    setVisible(false);
  };

  const createBooking = useMutation(api.bookings.createBooking);

  const handleSave = async () => {
    if (startDate) {
      const booking = await createBooking({
        fromDate: startDate,
        toDate: endDate || startDate, // If no endDate, use startDate
        homeId: home!._id,
        userId: userFull!._id,
      });

      setMarkedDates({
        [""]: {
          selected: false,
          startingDay: false,
          endingDay: false,
          color: "#fff",
        },
      });

      if (!booking.success) {
        setVisible(true);
      }
    }
  };

  const bookingsAndUsers = useQuery(api.bookings.getBookingsWithUserInfo, {
    homeId: homeId,
  });

  const handleBookingDelete = async () => {
    await deleteBooking({
      id: currentBooking!._id,
    });
    setMarkedDates({
      [""]: {
        selected: false,
        startingDay: false,
        endingDay: false,
        color: "#fff",
      },
    });
  };

  if (bookingsAndUsers === undefined || markedDatesDB === undefined) {
    return <Loading />;
  }

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
            markedDates={localMarkedDates}
            markingType="period"
            minDate={today}
            allowSelectionOutOfRange={false}
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
            {bookingsAndUsers?.length !== 0 ? (
              bookingsAndUsers?.map((data, index) => (
                <View key={index}>
                  <View
                    className={` w-full flex flex-row items-center justify-between p-5 `}
                  >
                    <Text className="font-semibold text-xl bg-white w-[35%] rounded-r-3xl">
                      {data.name}
                    </Text>

                    <View className="felx flex-row items-center justify-center gap-5">
                      {data.fromDate === data.toDate ? (
                        <View />
                      ) : (
                        <Text className="font-medium text-lg">
                          {data.fromDate}
                        </Text>
                      )}

                      <FontAwesome
                        size={30}
                        name="arrow-circle-right"
                        color={data.color}
                        className="shadow"
                      />
                      <Text className="font-medium text-lg">{data.toDate}</Text>
                    </View>
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

        {currentBooking ? (
          <TouchableOpacity
            onPress={() => handleBookingDelete()}
            className="p-5 bg-red-600 rounded-lg w-full mb-5 mt-10"
          >
            <Text className="text-center text-white font-bold text-xl ">
              Delete My Booking
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/** Dialog box */}
      <Dialog.Container visible={visible}>
        <Dialog.Title>You have a Booking</Dialog.Title>
        <Dialog.Description>
          {" "}
          To create a new booking you must delete the current booking for this
          house!{" "}
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="Delete" onPress={handleDelete} />
      </Dialog.Container>
    </ScrollView>
  );
}
