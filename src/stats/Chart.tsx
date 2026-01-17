interface ChartProp {
  name: string
}


function Chart(props : ChartProp) {
  return (<div className={props.name}>

  </div>);
}

export default Chart;