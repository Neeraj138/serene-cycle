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
import { storeDailyData } from "@/lib/appwrite";

function DashboardDisplay({ date }) {
  const { lastPeriod, avgCycleLength, bleedingDays, country, region } =
    useCycleContext();
  const [heartbeatData, setHeartbeatData] = useState(null);
  const [stepsData, setStepsData] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [probableCyclePhase, setProbableCyclePhase] = useState(null);
  const [isProbablyFertile, setProbablyFertile] = useState(null);
  const [nextExpectedPeriodDate, setNextExpectedPeriodDate] = useState(
    getExpectedNextPeriod(lastPeriod, avgCycleLength).toDateString()
  );
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
    }
  }, [lastPeriod, avgCycleLength, bleedingDays, date]);

  useEffect(() => {
    const fetchData = async () => {
      let dateToFetch = new Date(date);
      if (dateToFetch.toDateString() === new Date().toDateString()) {
        dateToFetch.setDate(dateToFetch.getDate() - 1);
      }
      console.log(dateToFetch, date);
      const heartBeatData = await fetchHeartbeatData(dateToFetch);
      const totalStepData = await fetchStepData(dateToFetch);
      const totalSleepData = await fetchSleepData(dateToFetch);
      setHeartbeatData(heartBeatData);
      setStepsData(totalStepData);
      setSleepData(totalSleepData);
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
    console.log(isLoading)
    const personalRecos = await getRecommendationsFromGemini(userInputData);
    console.log(isLoading)
    setIsLoading(false);
    setRecommendations(personalRecos);
  };

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
      <div className="mt-8 text-center">
        <button
          className="bg-violet-900 hover:bg-violet-700 text-lg font-bold px-4 py-2 rounded-md"
          onClick={getRecommendations}
        >
          {isLoading ? "Fetching..." : "Get Recommendations"}
        </button>
      </div>

      {recommendations && (
        <div className="mt-8 bg-gradient-to-br from-purple-800 to-indigo-800 p-3 rounded-md shadow-lg">
          <h2 className="text-lg font-medium mb-2">
            Personalized Recommendations
          </h2>
          <div className="grid grid-rows-2 grid-cols-1 gap-4">
            <div className="bg-slate-800 col-span-1 p-2 rounded-md shadow-lg">
              <h3 className="font-bold">Workouts</h3>
              <ul>
                {recommendations.workouts.map((item, index) => (
                  <li key={index} className="mt-2">-{" "}{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 col-span-1 p-2 rounded-md shadow-lg">
              <h3 className="font-bold">Food</h3>
              <ul>
                {recommendations.food.map((item, index) => (
                  <li key={index} className="mt-2">-{" "}{item}</li>
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
