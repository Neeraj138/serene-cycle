import { Client, Databases, ID, Query } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

const formatDate = (date) => {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString();
  const dd = date.getDate().toString();
  return `${yyyy}-${mm}-${dd}`;
};

export const checkIfDateExistsForUser = async (date, userId) => {
  try {
    const dateString = formatDate(date);
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_DAILYDATA_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("date", dateString)]
    );

    return {
      isSuccess: true,
      isExists: response.documents.length > 0,
      id: response.documents.length > 0 && response.documents[0].$id,
    };
  } catch (error) {
    console.error("Error checking for existing data:", error);
    return {
      isSuccess: false,
      isExists: undefined,
      id: undefined,
    };
  }
};

export const storeDataInAppwrite = async (data) => {
  try {
    // Format date as YYYY-MM-DD
    const dateString = formatDate(data.date);
    const lastPeriodString = formatDate(data.lastPeriod);

    const dailyData = {
      date: dateString,
      symptoms: JSON.stringify(data.symptoms),
      sleepData: JSON.stringify(data.sleepData),
      stepsData: JSON.stringify(data.stepsData),
      heartbeatData: JSON.stringify(data.heartbeatData),
      isProbablyFertile: data.isProbablyFertile,
      nextExpectedPeriodDate: data.nextExpectedPeriodDate,
      avgCycleLength: data.avgCycleLength,
      bleedingDays: data.bleedingDays,
      country: data.country,
      region: data.region,
      lastPeriod: lastPeriodString,
      userId: data.userId,
      recommendations: JSON.stringify(data.recommendations),
    };

    await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_DAILYDATA_COLLECTION_ID,
      "unique()",
      dailyData
    );

    console.log("Data uploaded to Appwrite for date:", dateString);
  } catch (error) {
    console.error("Error uploading data to Appwrite:", error);
  }
};

export const updateDataInDailyDataDb = async (
  date,
  userId,
  documentId,
  updateObj
) => {
  try {
    await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_DAILYDATA_COLLECTION_ID,
      documentId,
      updateObj
    );
  } catch (e) {
    console.log("Error! couldnt update", e);
  }
};

export const getDocumentFromDb = async (docId) => {
  let result = {};
  try {
    result = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_DAILYDATA_COLLECTION_ID,
      documentId
    );
  } catch (e) {
    result = {};
    console.log("Failed to get document from db");
  }
  return result;
};

export { databases };
