import { useState } from "preact/hooks";
import CalendarComponent from "./CalendarComponent/CalendarComponent";
import DashboardDisplay from "./DashboardDisplay";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar, SquarePen } from "lucide-react";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-rows-1 grid-cols-4 gap-3 bg-slate-900 rounded-lg p-3">
        <div className="col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <button className="w-full h-24 md:h-20 bg-purple-900 hover:bg-purple-700 text-lg font-semibold px-4 py-2 rounded-md flex items-center gap-2">
                  <SquarePen className="w-7 h-7" />
                  Log Period Onset
                </button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 m-0 w-100 bg-transparent border-none">
              <CalendarComponent
                setSelectedDate={setSelectedDate}
                isLogPeriodOnset={true}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <button className="w-full h-24 md:h-20 bg-purple-900 hover:bg-purple-700 text-lg font-semibold px-4 py-2 rounded-md flex items-center">
                  <Calendar className="w-7 h-7" />
                  {!selectedDate ? "Pick a Date" : selectedDate.toDateString()}
                </button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 m-0 w-100 bg-transparent border-none">
              <CalendarComponent setSelectedDate={setSelectedDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <header className="text-center mt-6 mb-4">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
      </header>
      {selectedDate && <DashboardDisplay date={selectedDate} />}
    </div>
  );
};

export default Dashboard;
