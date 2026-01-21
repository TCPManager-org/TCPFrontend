import Day from "../intake/Day.tsx";
import MealList from "../intake/MealList.tsx";
import IngredientList from "../intake/IngredientList.tsx";
import {useState} from "react";


function Intake() {
  const [addingMeal, setAddingMeal] = useState<boolean>(false);
  const [ingredientListForMeal, setIngredientListForMeal] = useState<number[]>([]);
  return (
      <div className="intake">
        <div className="days">
          <Day/>
        </div>
        <div className="meals">
          <MealList addingMeal={addingMeal} setIsAddingMeal={setAddingMeal}
                    ingredientListForMeal={ingredientListForMeal}
                    setIngredientListForMeal={setIngredientListForMeal}/>
        </div>
        <div className="ingredients">
          <IngredientList addingMeal={addingMeal}
                          setIngredientListForMeal={setIngredientListForMeal}/>
        </div>
      </div>
  );
}

export default Intake;