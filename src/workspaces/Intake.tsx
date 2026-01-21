import Day from "../intake/Day.tsx";
import MealList from "../intake/MealList.tsx";
import IngredientList from "../intake/IngredientList.tsx";
import {useState} from "react";


function Intake() {
  const [addingMeal, setAddingMeal] = useState<boolean>(false);
  const [ingredientListForMeal, setIngredientListForMeal] = useState<number[]>([]);
  const [addingMealToDay, setAddingMealToDay] = useState<boolean>(false);
  const [addedMealToDay, setAddedMealToDay] = useState<{id: number, weight: number}>({id: -1, weight: 0});
  return (
      <div className="intake">
        <div className="days">
          <Day
              isAdding={addingMealToDay}
              setIsAdding={setAddingMealToDay}
              addedMeal={addedMealToDay}
          />
        </div>
        <div className="meals">
          <MealList addingMeal={addingMeal} setIsAddingMeal={setAddingMeal}
                    ingredientListForMeal={ingredientListForMeal}
                    setIngredientListForMeal={setIngredientListForMeal}
                    addingMealToDay={addingMealToDay}
                    setAddedMealToDay={setAddedMealToDay}/>
        </div>
        <div className="ingredients">
          <IngredientList addingMeal={addingMeal}
                          setIngredientListForMeal={setIngredientListForMeal}/>
        </div>
      </div>
  );
}

export default Intake;