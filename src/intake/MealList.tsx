import axios from "axios";
import UseToken from "../UseToken.tsx";
import { useEffect, useState } from "react";

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
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return { success: false, status: error.response.status, message: "Request failed" };
      }
      if (error.request) {
        return { success: false, status: error.request.status, message: "Cannot reach server" };
      }
      return { success: false, message: "Unexpected Axios error" };
    }
    return { success: false, message: "Unexpected error" };
  }
}

async function prepareData(token: string) {
  const { success, data, message, status } = await getMeals(token);
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
      ingredients.push({ id: Number(id), name: String(name) });
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

export default function MealList() {
  const { token } = UseToken();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [showIngredients, setShowIngredients] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      const data = await prepareData(token);
      setMeals(data);
    }
    fetchData();
  }, [token]);

  const toggleIngredients = (mealId: number) => {
    setShowIngredients((prev) => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  if (meals.length === 0) return <p>No meals found.</p>;

  return (
      <div className="meal-list">
        <h2>Meals</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Meal Name</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Calories</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Protein (g)</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Carbs (g)</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Fats (g)</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Ingredients</th>
          </tr>
          </thead>
          <tbody>
          {meals.map((meal) => (
              <tr key={meal.id}>
                <td style={{ padding: "0.5rem" }}>{meal.name}</td>
                <td style={{ textAlign: "center" }}>{meal.calories}</td>
                <td style={{ textAlign: "center" }}>{meal.protein}</td>
                <td style={{ textAlign: "center" }}>{meal.carbs}</td>
                <td style={{ textAlign: "center" }}>{meal.fats}</td>
                <td style={{ padding: "0.5rem", textAlign: "left" }}>
                  {meal.ingredients.length > 0 ? (
                      <span
                          onClick={() => toggleIngredients(meal.id)}
                          style={{ cursor: "pointer" }}
                      >
                    {showIngredients[meal.id] ? "Hide" : "Show"} Ingredients
                  </span>
                  ) : (
                      "No ingredients"
                  )}
                  {showIngredients[meal.id] && (
                      <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1rem" }}>
                        {meal.ingredients.map((ingredient) => (
                            <li key={ingredient.id}>{ingredient.name}</li>
                        ))}
                      </ul>
                  )}
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
