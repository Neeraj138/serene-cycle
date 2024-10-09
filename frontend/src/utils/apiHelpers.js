import { convertDateToUnix } from "./globalHelpers";

export const fetchHeartbeatData = async (date) => {
  const formattedDate = {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString(),
    date: date.getDate().toString(),
  };
  let accessToken = localStorage.getItem("access_token");
  const { startTime, endTime } = convertDateToUnix(formattedDate);
  const baseUrl = `http://localhost:5000`;

  try {
    const response = await fetch(
      `${baseUrl}/partner/v1/query/heart_beat?startTime=${startTime}&endTime=${endTime}`,
      {
        method: "GET",
        headers: {
          "Cudis-Client-Id": "cudis-wellness",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch heartbeat data");
    }

    const data = await response.json();
    // console.log(data, data.data);
    return data.data;
  } catch (error) {
    console.error("Error fetching heartbeat data:", error);
    return {
      maximum: "--",
      minimum: "--",
      average: "--",
    };
  }
};

export const fetchStepData = async (date) => {
  const formattedDate = {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString(),
    date: date.getDate().toString(),
  };
  let accessToken = localStorage.getItem("access_token");
  const { startTime, endTime } = convertDateToUnix(formattedDate);
  const baseUrl = `http://localhost:5000`;

  try {
    const response = await fetch(
      `${baseUrl}/partner/v1/query/step?startTime=${startTime}&endTime=${endTime}`,
      {
        method: "GET",
        headers: {
          "Cudis-Client-Id": "cudis-wellness",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch step data");
    }

    const data = await response.json();
    // console.log(data, data.data);
    return {
      total: data?.data?.countStep || "--",
    };
  } catch (error) {
    console.error("Error fetching step data:", error);
    return {
      total: "--",
    };
  }
};

export const fetchSleepData = async (date) => {
  const formattedDate = {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString(),
    date: date.getDate().toString(),
  };
  let accessToken = localStorage.getItem("access_token");
  const { startTime, endTime } = convertDateToUnix(formattedDate);
  const baseUrl = `http://localhost:5000`;
  try {
    const response = await fetch(
      `${baseUrl}/partner/v1/query/sleep?startTime=${startTime}&endTime=${endTime}`,
      {
        method: "GET",
        headers: {
          "Cudis-Client-Id": "cudis-wellness",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sleep data");
    }

    const data = await response.json();
    // console.log(data, data.data);
    return {
      deepRatio: data?.data?.deepRatio || "--",
      shallowRatio: data?.data?.shallowRatio || "--",
      awakeRatio: data?.data?.awakeRatio || "--",
    };
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    return {
      total: "--",
    };
  }
};
