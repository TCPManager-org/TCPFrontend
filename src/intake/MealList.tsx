import axios from "axios";
import UseToken from "../UseToken.tsx";
import {useEffect, useState} from "react";

type Ingredient = {
  id: number,
  name: string
}

type MealData = {
  id: string,
  name: string,
  calories: number,
  fats: string,
  carbs: string,
  protein: string,
  ingredients: Ingredient[]
};

async function getMeals(token: string) {
  try {
    const response = await axios.get('api/calories/meals',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
    return {success: true, data: response.data}
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          success: false,
          status: error.response?.status,
          message: "Request failed"
        };
      }
      if (error.request) {
        return {
          success: false,
          status: error.request?.status,
          message: "Cannot reach server"
        }
      }
      return {
        success: false,
        message: "Unexpected Axios error"
      };
    }
    return {
      success: false,
      message: "Unexpected error"
    };
  }
}

async function prepareData(token: string) {
  const {success, data, message, status} = await getMeals(token)

  const result: MealData[] = []
  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`)
    alert(message || "Request failed")
  }
  const entries = data;
  if (!entries || !Array.isArray(data)) {
    console.error("Data is not an array", data);
    return result;
  }
  for (const entry of entries) {
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
      ingredients: ingredients
    });
  }

  return result;
}

function MealItem({meal}: Readonly<{ meal: MealData }>) {
  const [showIngredients, setShowIngredients] = useState(false);

  return (
      <li key={meal.id} className="meal-item">
        <h3>{meal.name}</h3>
        <div className="meal-macros">
          <ul>
            <li>Calories: {meal.calories}kcal</li>
            <li>Protein: {meal.protein}g</li>
            <li>Carbs: {meal.carbs}g</li>
            <li>Fats: {meal.fats}g</li>
          </ul>
        </div>
        {meal.ingredients.length > 0 && (
            <div className="meal-ingredients">
          <span
              onClick={() => setShowIngredients(!showIngredients)}
              style={{cursor: "pointer"}}
          >
            {showIngredients ? "Hide Ingredients" : "Show Ingredients"}
          </span>
              {showIngredients && (
                  <ul>
                    {meal.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>{ingredient.name}</li>
                    ))}
                  </ul>
              )}
            </div>
        )}
      </li>
  );
}


function MealList() {
  const {token} = UseToken();
  const [meals, setMeals] = useState<MealData[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        return;
      }
      const data = await prepareData(token);
      setMeals(data);
    }

    fetchData();
  }, [token]);

  return (
      <div className="meal-list">
        <h2>Meals</h2>
        {meals.length === 0 ? (
            <p>No meals found.</p>
        ) : (
            <ul>
              {meals.map((meal) => (
                  <MealItem key={meal.id} meal={meal}/>
              ))}
            </ul>
        )}
      </div>
  );
}

export default MealList;