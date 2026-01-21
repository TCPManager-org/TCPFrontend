import Day from "../intake/Day.tsx";
import MealList from "../intake/MealList.tsx";
import IngredientList from "../intake/IngredientList.tsx";


function Intake() {


  return (
      <div className="intake">
        <div className="days">
          <Day/>
        </div>
        <div className="meals">
          <MealList/>
        </div>
        <div className="ingredients">
          <IngredientList/>
        </div>
      </div>
  );
}

export default Intake;