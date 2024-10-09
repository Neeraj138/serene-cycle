import { useState } from "preact/hooks";
import { useCycleContext } from "./CycleContext";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

const CycleSetup = ({ onSetupComplete }) => {
  const {
    avgCycleLength,
    setAvgCycleLength,
    bleedingDays,
    setBleedingDays,
    lastPeriod,
    setLastPeriod,
    country,
    setCountry,
    region,
    setRegion,
  } = useCycleContext();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setError("");
    if (!avgCycleLength || !bleedingDays || !lastPeriod) {
      setError("All fields are required.");
      return false;
    }
    if (isNaN(avgCycleLength) || avgCycleLength < 21 || avgCycleLength > 35) {
      setError("Cycle length must be a number between 21 and 35.");
      return false;
    }
    if (isNaN(bleedingDays) || bleedingDays < 3 || bleedingDays > 7) {
      setError("Bleeding days must be a number between 3 and 7.");
      return false;
    }
    if (!country || !region) {
      setError("Please select both country and state/region.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      avgCycleLength: Number(avgCycleLength),
      bleedingDays: Number(bleedingDays),
      lastPeriod,
      country,
      region,
    };

    try {
      setLoading(true);

      onSetupComplete();
    } catch (error) {
      console.error("Error storing data:", error);
      setError("Failed to store data, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    selectedDate.setHours(0, 0, 0, 0);
    setLastPeriod(selectedDate);
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg shadow-md">
      <div className="text-3xl font-medium mb-4">Cycle Setup</div>
      <form onSubmit={handleSubmit}>
        <div className="mb-7">
          <label className="block mb-3">
            Average Cycle Length (21-35 days typically)
          </label>
          <input
            type="number"
            value={avgCycleLength}
            onChange={(e) => setAvgCycleLength(parseInt(e.target.value, 10))}
            className="required w-full font-normal p-2 border border-slate-400 rounded-lg bg-transparent focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline"
            required
          />
        </div>
        <div className="mb-7">
          <label className="block mb-3">
            Number of Menstruating Days (3-7 days typically)
          </label>
          <input
            type="number"
            value={bleedingDays}
            onChange={(e) => setBleedingDays(parseInt(e.target.value, 10))}
            className="required w-full font-normal p-2 border border-slate-400 rounded-lg bg-transparent focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline"
            required
          />
        </div>
        <div className="mb-7">
          <label className="block mb-3">Most Recent Period Onset Date</label>
          <input
            type="date"
            value={
              lastPeriod instanceof Date && !isNaN(lastPeriod)
                ? lastPeriod.toISOString().split("T")[0]
                : null
            }
            max={new Date().toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="required w-full font-normal p-2 border border-slate-400 rounded-lg bg-transparent focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline"
            required
          />
        </div>
        <div className="mb-7">
          <label className="block mb-3">Country</label>
          <CountryDropdown
            value={country}
            onChange={(val) => {
              setCountry(val);
              setRegion("");
            }}
            className="required w-full font-normal p-3 border border-slate-400 rounded-lg bg-transparent focus:bg-slate-800 focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-3">State/Region</label>
          <RegionDropdown
            country={country}
            value={region}
            onChange={(val) => setRegion(val)}
            className="required w-full font-normal p-3 border border-slate-400 rounded-lg bg-transparent focus:bg-slate-800 focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline"
            disabled={!country}
          />
        </div>
        {error && <p className="text-red-400">{error}</p>}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="text-lg font-medium px-4 py-2 rounded-md bg-violet-800 hover:bg-violet-950"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Cycle Setup"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CycleSetup;
