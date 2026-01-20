type ChartProps = {
  data: Record<string, Array<{ x: string | number; y: number }>>,
};

function Chart({data}: Readonly<ChartProps>) {
  return (
      <div>
        {Object.entries(data).map(([nutrient, points]) => (
            <div key={nutrient}>
              <h3>{nutrient}</h3>
              {points.map((point, i) => (
                  <p key={i}>
                    x: {point.x}, y: {point.y.toFixed(2)}%
                  </p>
              ))}
            </div>
        ))}
      </div>
  )
}

export default Chart;