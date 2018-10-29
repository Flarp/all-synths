let mouse_down = false
let avail = true

const context = new AudioContext()
const osc = context.createOscillator()
const gain = context.createGain()
gain.connect(context.destination)
gain.gain.value = 1
osc.frequency.value = 0
osc.connect(gain)
osc.start()

let start_key = 49
let waveform = "sine"
let interpolation = "exponential"
const note_equation = note => Math.pow(2, (note-49)/12) * 440

window.onmousedown = _ => {
  mouse_down = true
}

window.onmouseup = _ => {
  mouse_down = false
}

class MicrotonalKey extends React.Component {
  constructor(props) {
    super(props)
    this.state = {down: 0}
  }
  start(force) {
    if (avail && (mouse_down || force)) {
      avail = false
      gain.gain.cancelScheduledValues(0)
      gain.gain.value = 1
      osc.type = waveform
      let freq;
      if (interpolation === "exponential") {
        freq = note_equation(this.props.index_two + start_key + (this.props.index_one/this.props.keys))
      } else {
        const first = note_equation(this.props.index_two + start_key)
        const last = note_equation(this.props.index_two + start_key + 1)
        const interval = (last-first)/this.props.keys
        freq = first + (interval*this.props.index_one)
      }
      if (force) {
        osc.frequency.setValueAtTime(freq, context.currentTime)
      } else {
        
console.log("test")    
        osc.frequency.exponentialRampToValueAtTime(freq, context.currentTime + 0.01)
      }
      this.setState({down:1})
    }
  }
  stop(force) {
        if ((!avail) && (force || mouse_down)) {
          avail = true
          if (force) {
            gain.gain.setValueAtTime(gain.gain.value, context.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.01)
            osc.frequency.setValueAtTime(0, context.currentTime + 0.01)
          }
          this.finished = true
          this.setState({down:0})
      }   
  }
  render() {
    const start = this.start.bind(this, false)
    const stop = this.stop.bind(this, false)
    const start_regardless = this.start.bind(this, true)
    const stop_regardless = this.stop.bind(this, true)
    return <div onMouseDown={start_regardless} onMouseEnter={start} onMouseUp={stop_regardless} onMouseLeave={stop} draggable="false" style={{backgroundColor:`hsl(${this.props.color}, ${100*(Number(!this.state.down))}%, ${((this.props.hue*40)+50).toString()}%)`, height: `${100/this.props.keys}%`, width:`$100%`}}><div></div></div>
  }
}

class MicrotonalRow extends React.Component {
  render() {
    let g = []
    for (let x = 0; x < 1; x += (1/this.props.keys)) {
      g.push(x)
    }
    return (
    <div draggable="false" style={{display:"inline-block",width:`${100/this.props.rows}%`, height:"100%"}}>
      {
        g.map((hue, index) => <MicrotonalKey keys={this.props.keys} rows={this.props.rows} color={this.props.color*255} index_one={index} index_two={this.props.index} hue={hue}/>)
      }    
    </div>
    )
  }
}

class MicrotonalGrid extends React.Component {
  render() {
    let g = []
    for (let x = 0; x < 1; x += (1/this.props.rows)) {
      g.push(x)
    }
    return (<span draggable="false" style={{display:"inline-block", whiteSpace: "nowrap", width:this.props.width, height:this.props.height}}> {g.map((color, index) => <MicrotonalRow rows={this.props.rows} color={color} keys={this.props.keys} index={index}/>)}</span>)
    }
}

class MainView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {keys: 12, rows: 12, start_key: 49}
  }
  changeRows(event) {
    this.setState({rows: parseInt(event.target.value)})
  }
  changeKeys(event) {
  this.setState({keys:parseInt(event.target.value)})
  }
  changeStartKey(event) {
    start_key = parseInt(event.target.value)
  }
  changeWaveform(event) {
    waveform = event.target.value
  }
  changeInterpolation(event) {
    interpolation = event.target.value
  }
  render() {
    return (
    <center>
      <MicrotonalGrid width="100%" height="70vmin" keys={this.state.keys} rows={this.state.rows} />
        <div style={{columnCount:5,width:"100%",height:"30vmin"}}>
          <div style={{display:"inline"}}>
          <h2 style={{marginTop: "0"}}>Keys</h2><input type="number" onChange={this.changeRows.bind(this)} value={this.state.rows}/>
          </div>
          <div style={{display:"inline"}}>
          <h2>Microtones</h2><input type="number" onChange={this.changeKeys.bind(this)} value={this.state.keys}/>
          </div>
          <div style={{display:"inline"}}>
          <h2>Starting Key (A440 = 49)</h2><input type="number" onChange={this.changeStartKey.bind(this)} defaultValue={49}/>
          </div>
          <div style={{display:"inline"}}>
            <h2>Waveform</h2>
            <select onChange={this.changeWaveform}>
              <option value="sine">Sine</option>
              <option value="triangle">Triangle</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
            </select>
          </div>
          <div style={{display:"inline"}}>
            <h2>Interpolation</h2>
            <select onChange={this.changeInterpolation}>
              <option value="exponential">Exponential</option>
              <option value="linear">Linear</option>
            </select>
          </div>
        </div>
    </center>
    )
  }
}

ReactDOM.render(<MainView />, document.getElementById("whyme"))
