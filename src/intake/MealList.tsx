import axios from "axios";
import UseToken from "../UseToken.tsx";
import {type Dispatch, type SetStateAction, useEffect, useState} from "react";
import AddButtons from "./AddButtons.tsx";

type Ingredient = {
  id: number;
  name: string;
};

type MealData = {
  id: number;
  name: string;
  calories: number;
  fats: string;
  carbs: string;
  protein: string;
  ingredients: Ingredient[];
};

async function getMeals(token: string) {
  try {
    const response = await axios.get("api/calories/meals", {
      headers: {Authorization: `Bearer ${token}`},
    });
    return {success: true, data: response.data};
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {success: false, status: error.response.status, message: "Request failed"};
      }
      if (error.request) {
        return {success: false, status: error.request.status, message: "Cannot reach server"};
      }
      return {success: false, message: "Unexpected Axios error"};
    }
    return {success: false, message: "Unexpected error"};
  }
}

async function prepareData(token: string) {
  const {success, data, message, status} = await getMeals(token);
  const result: MealData[] = [];

  if (!success) {
    console.error(`Error fetching meals: ${message} (status: ${status})`);
    alert(message || "Request failed");
    return result;
  }

  if (!data || !Array.isArray(data)) {
    console.error("Data is not an array", data);
    return result;
  }

  for (const entry of data) {
    const ingredients: Ingredient[] = [];

    for (const [id, name] of Object.entries(entry.ingredients)) {
      ingredients.push({id: Number(id), name: String(name)});
    }

    result.push({
      id: entry.id,
      name: entry.name,
      calories: entry.calories,
      fats: entry.fats,
      carbs: entry.carbs,
      protein: entry.proteins,
      ingredients,
    });
  }

  return result;
}

type MealProps = {
  addingMeal: boolean
  setIsAddingMeal: (value: boolean) => void
  ingredientListForMeal: number[]
  setIngredientListForMeal: (value: number[]) => void
  addingMealToDay: boolean
  setAddedMealToDay: Dispatch<SetStateAction<{
    id: number;
    weight: number;
  }>>
};

export default function MealList({
                                   addingMeal,
                                   setIsAddingMeal,
                                   ingredientListForMeal,
                                   setIngredientListForMeal,
                                   addingMealToDay,
                                   setAddedMealToDay
                                 }: Readonly<MealProps>) {
  const {token} = UseToken();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [showIngredients, setShowIngredients] = useState<Record<number, boolean>>({});
  const [newName, setNewName] = useState<string>("");

  async function fetchData() {
    if (!token) return;
    const data = await prepareData(token);
    setMeals(data);
  }

  useEffect(() => {
    fetchData();
  }, [fetchData, token]);

  const toggleIngredients = (mealId: number) => {
    setShowIngredients((prev) => ({...prev, [mealId]: !prev[mealId]}));
  };
  const addMealRequest = async () => {
    setNewName(newName.trim())
    if (!newName || newName.length < 1) {
      alert("Meal name cannot be empty");
      setNewName("");
      setIsAddingMeal(false)
      setIngredientListForMeal([])
      return;
    }
    let ingredients: Record<string, number> = {}
    for (let i = 0; i < ingredientListForMeal.length; i++) {
      if (ingredientListForMeal[i] !== undefined) {
        ingredients = {
          ...ingredients,
          [i]: ingredientListForMeal[i]
        }
      }
    }
    if (ingredients.length == 0) {
      alert("Meal must have at least one ingredient");
      setNewName("");
      setIsAddingMeal(false)
      setIngredientListForMeal([])
      return;
    }
    const newMeal = {
      name: newName,
      ingredients: ingredients
    }
    setNewName("");
    setIsAddingMeal(false)
    setIngredientListForMeal([])
    try {
      await axios.post("/api/calories/meals", newMeal,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      await fetchData()
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      alert("Failed to add ingredient.");
    }
  }
  const cancelAddMeal = () => {
    setIsAddingMeal(false);
    setIngredientListForMeal([]);
    setNewName("");
  }
  if (meals.length === 0) return <p>No meals found.</p>;

  return (
      <div className="meal-list">
        <h2 style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
          Meals
          <AddButtons adding={addingMeal} confirmAdd={addMealRequest} cancelAdd={cancelAddMeal}
                      onStart={() => setIsAddingMeal(true)}/>
          {addingMeal && (<input
              type="text"
              placeholder="Meal Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{marginLeft: "1rem"}}
          />)}
        </h2>
        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
          <tr>
            <th style={{borderBottom: "1px solid #ccc", textAlign: "left"}}>Meal Name</th>
            <th style={{borderBottom: "1px solid #ccc"}}>Calories</th>
            <th style={{borderBottom: "1px solid #ccc"}}>Protein (g)</th>
            <th style={{borderBottom: "1px solid #ccc"}}>Carbs (g)</th>
            <th style={{borderBottom: "1px solid #ccc"}}>Fats (g)</th>
            <th style={{borderBottom: "1px solid #ccc"}}>{addingMealToDay ? "Add" : "Ingredients"}</th>
          </tr>
          </thead>
          <tbody>
          {meals.map((meal) => (
              <tr key={meal.id}>
                <td style={{padding: "0.5rem"}}>{meal.name}</td>
                <td style={{textAlign: "center"}}>{meal.calories}</td>
                <td style={{textAlign: "center"}}>{meal.protein}</td>
                <td style={{textAlign: "center"}}>{meal.carbs}</td>
                <td style={{textAlign: "center"}}>{meal.fats}</td>

                {addingMealToDay ? (
                    <td style={{textAlign: "center"}}>
                      <input type="text" id="meal"
                             name="meal"
                             min="1"
                             onChange={(e) => {
                               setAddedMealToDay({
                                 id: meal.id,
                                 weight: Number(e.target.value)
                               })
                             }
                             }/>
                    </td>) : (<td style={{padding: "0.5rem", textAlign: "left"}}>
                  {meal.ingredients.length > 0 ? (
                      <span
                          onClick={() => toggleIngredients(meal.id)}
                          style={{cursor: "pointer"}}
                      >
                    {showIngredients[meal.id] ? "Hide" : "Show"} Ingredients
                  </span>
                  ) : (
                      "No ingredients"
                  )}
                  {showIngredients[meal.id] && (
                      <ul style={{margin: "0.5rem 0 0 0", paddingLeft: "1rem"}}>
                        {meal.ingredients.map((ingredient) => (
                            <li key={ingredient.id}>{ingredient.name}</li>
                        ))}
                      </ul>
                  )}
                </td>)}

              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
