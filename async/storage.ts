import AsyncStorage from "@react-native-async-storage/async-storage";

const storeInFamily = async (value: string) => {
  try {
    await AsyncStorage.setItem("inFamily", value);
  } catch (e) {
    console.log(e);
  }
};

const getInFamily = async () => {
  try {
    const value = await AsyncStorage.getItem("inFamily");
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.log(e);
  }
};
