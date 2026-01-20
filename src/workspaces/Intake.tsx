import {LastDaysCalendar} from "../calories/Calendar.tsx";
import {useState} from "react";

function Intake() {
    // async function getIntake() {
    //
    // }
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);

        console.log("Wybrano datę w Intake:", date);
    };

    return (
        <div className="intake">
          <div className="days">
            <div className="intake-calendar-wrapper">
              <LastDaysCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateChange}/>
            </div>

            <div className="intake-content">
              <p>Widok dla dnia: {selectedDate.toLocaleDateString('pl-PL')}</p>

            </div>
          </div>
          <div className="meals">
            <p>Test</p>
          </div>
        </div>
    );
}

export default Intake;