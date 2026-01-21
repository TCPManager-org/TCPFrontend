import Day from "../intake/Day.tsx";

import {LastDaysCalendar} from "../calories/Calendar.tsx";
import {useState} from "react";
import MealList from "../calories/MealList.tsx";

function Intake() {


    return (
        <div className="intake">
            <div className="days">
                <Day/>
            </div>
          <div className="meals">
            <MealList />
          </div>
        </div>
    );
}

export default Intake;