import { Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
interface DataPoint {
  x: string | number;
  [key: string]: string | number;
}
type ChartProps = {
  data: DataPoint[]
  lineNames: string[]
};

function Chart({data, lineNames}: Readonly<ChartProps>) {
  const colors = ['#ffffff', '#c9a2bf', '#89cff0', '#964b00']
  return (
        <LineChart
            style={{ width: '100%', height: '100%' }}
            data={data}
        >
          <XAxis dataKey="x" domain={['auto', 'auto']} />
          <YAxis label={{ value: '%', position: 'insideLeft' }} />
          <Legend
              verticalAlign="top"
              align="center"
          />
          {lineNames.map((name, index) => (
              <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={false}
              />
          ))}
        </LineChart>
  )
}

export default Chart;