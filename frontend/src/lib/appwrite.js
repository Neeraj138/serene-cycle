import { Client, Databases, ID } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

export const storeDailyData = async (dailyData) => {
  try {
    await databases.createDocument(
      "your-database-id", // replace with your database ID
      "your-daily-data-collection-id", // replace with your collection ID
      "unique()", // Unique ID for the document
      dailyData
    );
  } catch (error) {
    console.error("Failed to store daily data:", error);
  }
};

export const getDailyData = async (date) => {
  try {
    const response = await databases.getDocument(
      "your-database-id",
      "your-daily-data-collection-id",
      date
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch daily data:", error);
  }
};

export { databases };
