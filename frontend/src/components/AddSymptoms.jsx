import { useState } from "preact/hooks";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { SquarePen, TrashIcon } from "lucide-react";

const AddSymptoms = ({ symptoms, setSymptoms }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAddSymptom = () => {
    if (!input.trim()) {
      setError("Please enter a symptom.");
      return;
    }

    setSymptoms([...symptoms, input.trim()]);
    setInput("");
    setError("");
  };

  const handleRemoveSymptom = (index) => {
    const updatedSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(updatedSymptoms);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddSymptom();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full bg-purple-900 px-2 py-4 rounded-lg hover:bg-purple-700 mt-4 shadow-lg font-medium flex gap-2 items-center justify-between">
          <SquarePen />
          <div className="w-full">
            {symptoms.length > 0
              ? "Add more symptoms"
              : "Log how you are feeling today or any symptoms"}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs rounded-md bg-slate-800 border-none text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hi, how are you feeling today?</DialogTitle>
          <DialogDescription className="text-white">
            Log your symptoms or how you are feeling today here
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a symptom or feeling..."
              className="required w-full font-normal p-2 border border-purple-400 rounded-lg rounded-tr-none rounded-br-none bg-transparent focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 focus:ring-offset-purple-950 focus:outline"
            />
            <button
              onClick={handleAddSymptom}
              className="ml-2 px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-r-md font-medium"
            >
              Add
            </button>
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <div className="w-full">
            {symptoms.length > 0 && (
              <ul className="list-none">
                {symptoms.map((symptom, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 text-white"
                  >
                    <span>{symptom}</span>
                    <TrashIcon
                      onClick={() => handleRemoveSymptom(index)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <button className="w-full py-3 bg-purple-800 hover:bg-purple-900 text-white rounded-lg font-medium">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSymptoms;
