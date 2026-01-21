import Day from "../intake/Day.tsx";
import MealList from "../intake/MealList.tsx";


function Intake() {


  return (
      <div className="intake">
        <div className="days">
          <Day/>
        </div>
        <div className="meals">
          <MealList/>
        </div>
      </div>
  );
}

export default Intake;