const context = new AudioContext()
let down = false
const $ = document.getElementById.bind(document)
const display = $("color")
let osc
const params = { x: (new Set()), y: (new Set()) }

const update = (x, y) => {
  const normal = { x: x/display.offsetWidth, y: y/display.offsetHeight };
  ["x", "y"].map(z => {
    for (let g of params[z].values()) {
      osc.parameters.get(g).value = range_transpose(normal[z], parseFloat($(`${z}-${g}-min`).value), parseFloat($(`${z}-${g}-max`).value))
    }
  })
  display.style.backgroundColor = `hsl(${360*normal.x}, 100%, ${100*normal.y}%)`
}

const range_transpose = (val, newmin, newmax) => (val * (newmax - newmin)) + newmin

display.onmousedown = e => {
  if (osc) {
    osc.disconnect()
  }
  down = true
  osc = new BetterOscillator(context)
  update(e.x, e.y)
  osc.connect(context.destination)
}
display.onmousemove = e => {
  if (down) {
    update(e.x, e.y)
  }
}
display.onmouseup = _ => {
  down = false
  osc.disconnect()
}

class BetterOscillator extends AudioWorkletNode {
  constructor(context) {
    super(context, "better-oscillator", { numberOfOutputs: 2 });
  }
}

const check = (axis, key, truth) => {
  if (truth) {
    params[axis].add(key)
  } else {
    params[axis].delete(key)
  }
  $(`${axis}-${key}-min`).disabled = !truth
  $(`${axis}-${key}-max`).disabled = !truth
}

const data = 
context.audioWorklet.addModule(`data:text/javascript,${encodeURI($("lick").innerText)}`).then(_ => {
  ["x", "y"].map(z => {
    $(`${z}-controls`).innerHTML = `<center><h2>${z.toUpperCase()} Controls</h2></center>`.concat(Array.from((new BetterOscillator(context)).parameters.keys()).map(key => `<p style="display: inline-block">${key.charAt(0).toUpperCase().concat(key.substring(1))}</p>
<input type="checkbox" id="${z}-${key}" onchange="check('${z}', '${key}', this.checked)"></input>
<input type="number" id="${z}-${key}-min" value="0" disabled></input>
<input type="number" id="${z}-${key}-max" value="1" disabled></input><br>`).join(""))
  })
})
