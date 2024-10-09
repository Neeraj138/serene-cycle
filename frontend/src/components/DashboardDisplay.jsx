import { useEffect, useState } from "preact/hooks";
import AddSymptoms from "./AddSymptoms";
import {
  fetchHeartbeatData,
  fetchSleepData,
  fetchStepData,
} from "../utils/apiHelpers";
import { useCycleContext } from "./CycleSetup/CycleContext";
import {
  calculateCyclePhaseForToday,
  getExpectedNextPeriod,
  isFertileOnDate,
} from "../utils/cycleHelpers";
import { Footprints, HeartPulse, Bed } from "lucide-react";
import { getRecommendationsFromGemini } from "@/utils/recommendationHelpers";
import {
  checkIfDateExistsForUser,
  getDocumentFromDb,
  storeDataInAppwrite,
  updateDataInDailyDataDb,
} from "@/lib/appwrite";

function DashboardDisplay({ date }) {
  const { lastPeriod, avgCycleLength, bleedingDays, country, region } =
    useCycleContext();
  const [heartbeatData, setHeartbeatData] = useState(null);
  const [stepsData, setStepsData] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [probableCyclePhase, setProbableCyclePhase] = useState(null);
  const [isProbablyFertile, setProbablyFertile] = useState(null);
  const [nextExpectedPeriodDate, setNextExpectedPeriodDate] = useState(
    getExpectedNextPeriod(lastPeriod, avgCycleLength).toDateString()
  );
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const calculatePhase = async () => {
      if (lastPeriod && avgCycleLength && bleedingDays) {
        const probablePhase = calculateCyclePhaseForToday(
          lastPeriod,
          avgCycleLength,
          bleedingDays,
          date
        );
        const probableFertility = isFertileOnDate(
          lastPeriod,
          avgCycleLength,
          bleedingDays,
          date
        );
        setProbableCyclePhase(probablePhase);
        setProbablyFertile(probableFertility);
        setNextExpectedPeriodDate(
          getExpectedNextPeriod(lastPeriod, avgCycleLength).toDateString()
        );
        const { isSuccess, isExists, id } = await checkIfDateExistsForUser(
          date,
          userId
        );
        if (isSuccess && !isExists) {
          let dataToStore = {
            date: date,
            symptoms: JSON.stringify(symptoms),
            sleepData: "",
            stepsData: "",
            heartbeatData: "",
            isProbablyFertile: isProbablyFertile,
            nextExpectedPeriodDate: nextExpectedPeriodDate,
            avgCycleLength: avgCycleLength,
            bleedingDays: bleedingDays,
            country: country,
            region: region,
            lastPeriod: lastPeriod,
            userId: userId,
            recommendations: JSON.stringify(recommendations),
          };
          if (date.toDateString() === new Date().toDateString()) {
            dataToStore.sleepData = "";
            dataToStore.heartbeatData = "";
            dataToStore.stepsData = "";
          }
          await storeDataInAppwrite(dataToStore);
        } else if (isSuccess && isExists) {
          const updateObj = {
            lastPeriod: lastPeriod.toDateString(),
            avgCycleLength: avgCycleLength,
            bleedingDays: bleedingDays,
          };
          updateDataInDailyDataDb(date, userId, id, updateObj);
        }
      }
    };

    calculatePhase();
  }, [lastPeriod, avgCycleLength, bleedingDays, date]);

  useEffect(() => {
    const fetchData = async () => {
      let dateToFetch = new Date(date);
      if (dateToFetch.toDateString() === new Date().toDateString()) {
        dateToFetch.setDate(dateToFetch.getDate() - 1);
      }

      const existingData = await checkIfDateExistsForUser(dateToFetch, userId);
      const heartBeatData = await fetchHeartbeatData(dateToFetch);
      const totalStepData = await fetchStepData(dateToFetch);
      const totalSleepData = await fetchSleepData(dateToFetch);

      setHeartbeatData(heartBeatData);
      setStepsData(totalStepData);
      setSleepData(totalSleepData);

      if (existingData.isSuccess && !existingData.isExists) {
        const dataToStore = {
          date: dateToFetch,
          symptoms: JSON.stringify(symptoms),
          sleepData: JSON.stringify(totalSleepData),
          stepsData: JSON.stringify(totalStepData),
          heartbeatData: JSON.stringify(heartBeatData),
          isProbablyFertile: isProbablyFertile,
          nextExpectedPeriodDate: nextExpectedPeriodDate,
          avgCycleLength: avgCycleLength,
          bleedingDays: bleedingDays,
          country: country,
          region: region,
          lastPeriod: lastPeriod,
          userId: userId,
          recommendations: JSON.stringify(recommendations),
        };
        await storeDataInAppwrite(dataToStore);
      }
    };

    fetchData();
  }, [date]);

  const getRecommendations = async () => {
    setIsLoading(true);
    const userInputData = {
      symptoms: symptoms,
      probableCyclePhase: probableCyclePhase,
      nextExpectedPeriodOnsetDate: nextExpectedPeriodDate,
      mostRecentPeriod: lastPeriod.toDateString(),
      prevDaySleepData: sleepData,
      prevDayStepData: stepsData,
      prevDayHeartbeatData: heartbeatData,
      country: country,
      region: region,
    };
    const personalRecos = await getRecommendationsFromGemini(userInputData);
    setRecommendations(personalRecos);
    const { isSuccess, isExists, id } = await checkIfDateExistsForUser(
      date,
      userId
    );
    if (isSuccess && isExists && id) {
      updateDataInDailyDataDb(date, userId, id, {
        recommendations: JSON.stringify(personalRecos),
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      localStorage.clear();
      window.location.replace("/");
    }
  }, [userId]);

  return (
    <div>
      <div className="grid grid-rows-1 gap-3 bg-slate-900 p-3 rounded-md shadow-lg mb-3">
        <h2 className="text-lg font-semibold">Cycle Insights</h2>
        <div className="grid grid-rows-2 grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-md shadow-lg p-2 flex flex-col items-center">
            <div className="font-medium text-center">Phase</div>
            <div className="font-semibold text-xl text-center flex-grow flex items-center justify-center">
              {probableCyclePhase ? probableCyclePhase : "--"}
            </div>
          </div>
          <div className="bg-slate-800 rounded-md shadow-lg p-2 flex flex-col items-center">
            <div className="font-medium text-center">Might be Fertile</div>
            <div className="font-semibold text-xl text-center flex-grow flex items-center justify-center">
              {isProbablyFertile ? "YES" : "NO"}
            </div>
          </div>
          <div className="bg-slate-800 rounded-md shadow-lg p-2">
            <div className="font-medium text-center">
              Expected Next Period Onset
            </div>
            <div className="font-semibold text-xl text-center">
              {nextExpectedPeriodDate}
            </div>
          </div>
          <div className="bg-slate-800 rounded-md shadow-lg p-2">
            <div className="font-medium text-center">
              Most Recent Period Onset
            </div>
            <div className="font-semibold text-xl text-center">
              {lastPeriod.toDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-md shadow-lg">
        <div className="col-span-3 font-medium">
          {date.toDateString() === new Date().toDateString()
            ? "Summary from Yesterday"
            : "Summary"}
        </div>

        {/* Sleep Summary */}
        <div className="bg-slate-800 col-span-3 p-2 rounded-md shadow-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Bed className="w-8 h-8" />
            Sleep
          </h2>
          {sleepData ? (
            <div className="grid grid-cols-3">
              <div>
                <p className="text-sm font-medium">Deep</p>
                <p className="text-2xl font-bold">{sleepData.deepRatio}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Light</p>
                <p className="text-2xl font-bold">{sleepData.shallowRatio}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Awake</p>
                <p className="text-2xl font-bold">{sleepData.awakeRatio}%</p>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="bg-slate-800 p-2 rounded-md shadow-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Footprints className="w-8 h-8" />
            Steps
          </h2>
          {stepsData ? (
            <div>
              <p className="text-sm font-medium">
                <span className="text-2xl font-bold">{stepsData.total}</span>
              </p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="bg-slate-800 p-2 col-span-2 rounded-md shadow-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <HeartPulse className="w-8 h-8" />
            Heartrate
          </h2>
          {heartbeatData ? (
            <div className="grid grid-cols-3">
              <div>
                <p className="text-sm font-medium">Max</p>
                <p className="text-2xl font-bold">{heartbeatData.maximum}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Min</p>
                <p className="text-2xl font-bold">{heartbeatData.minimum}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Avg</p>
                <p className="text-2xl font-bold">{heartbeatData.average}</p>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-3 mt-4 rounded-lg">
        {symptoms.length > 0 && (
          <div className="bg-slate-800 p-2 rounded-md shadow-lg">
            <div>{symptoms.join(", ")}</div>
          </div>
        )}
        <AddSymptoms symptoms={symptoms} setSymptoms={setSymptoms} />
      </div>
      {date.toDateString() === new Date().toDateString() ? (
        <div className="mt-8 text-center">
          <button
            className="bg-violet-900 hover:bg-violet-700 text-lg font-bold px-4 py-2 rounded-md"
            onClick={getRecommendations}
            disabled={!symptoms.length > 0}
          >
            {isLoading ? "Fetching..." : "Get Recommendations"}
          </button>
          {!symptoms.length > 0 && (
            <div className="text-purple-400 my-2">
              Log symptoms/how you are feeling to enable recommendations!
            </div>
          )}
        </div>
      ) : null}

      {symptoms.length > 0 && Object.keys(recommendations).length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-purple-800 to-indigo-800 p-3 rounded-md shadow-lg">
          <h2 className="text-lg font-medium mb-2">
            Personalized Recommendations
          </h2>
          <div className="grid grid-rows-2 grid-cols-1 gap-4">
            <div className="bg-slate-800 col-span-1 p-2 rounded-md shadow-lg">
              <h3 className="font-bold">Workouts</h3>
              <ul>
                {recommendations.workouts.map((item, index) => (
                  <li key={index} className="mt-2">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 col-span-1 p-2 rounded-md shadow-lg">
              <h3 className="font-bold">Food</h3>
              <ul>
                {recommendations.food.map((item, index) => (
                  <li key={index} className="mt-2">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDisplay;
