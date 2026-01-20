import axios from "axios";
import Chart from "./Chart.tsx";
import {useEffect, useState} from "react";
import UseToken from "../UseToken.tsx";

type NutritionData = {
  x: string;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
};
const nutrients = ['calories', 'fat', 'protein', 'carbs'] as const;

async function getHistory(token: string) {
  try {

    const response = await axios.get('api/statistics/intake-history',
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
  const {success, data, message, status} = await getHistory(token)

  const result: NutritionData[] = []

  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`)
    alert(message || "Request failed")
    return result
  }
  const entries = Array.isArray(data) ? data : data.history;
  if (!entries || !Array.isArray(entries)) {
    console.error("Data is not an array", data);
    return result;
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = data[i]
    const entryResult: NutritionData = {
      x: entry.date,
      calories: 0,
      fat: 0,
      protein: 0,
      carbs: 0,
    };
    for (const nutrient of nutrients) {
      const value = Number(entry[nutrient]) || 0;
      const goal = Number(entry[`${nutrient}Goal`]) || 0;
      entryResult[nutrient] = goal ? (value / goal) * 100 : 0;
    }
    result.push(entryResult);
  }
  console.log(result);
  return result;
}

function IntakeHistory() {
  const {token} = UseToken()
  const [chartData, setChartData] = useState<NutritionData[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        return;
      }
      const data = await prepareData(token);
      setChartData(data);
    }

    fetchData();
  }, [token]);

  return (<div className="IntakeHistory">
    <Chart data={chartData} lineNames={[...nutrients]}/>
  </div>);
}

export default IntakeHistory;