//const ratio = (1 + Math.sqrt(5)) / 
const ratios = {
  e: Math.E,
  pi: Math.PI,
  phi: (1 + Math.sqrt(5)) / 2,
  two: 2
}
const context = new AudioContext()

const freq = note => parseInt($("aroot").value) * Math.pow(ratios[$("ratio").value], (note-69)/12)
const keys = {}
const $ = document.getElementById.bind(document)
console.log($("aroot").value)
const analyser = context.createAnalyser()
const main_gain = context.createGain()
main_gain.connect(analyser)
main_gain.connect(context.destination)

const waveforms = ["sine", "square", "triangle", "sawtooth"]
const barnames = ["bourdon", "quint", "principle", "octave", "nazard", "block_flote", "tierce", "larigote", "sipplote"]

const html = `<div id="handbars">${waveforms.map(waveform => `<div id="${waveform}-handbars"><p style="text-transform: capitalize">${waveform}</p>${barnames.map(barname => `<input type="range" min="0" step="0.01" max="1" value="0" id="${waveform}-${barname}"></input>`).join("")}
<br></div>`).join("")}`
$("handbars").innerHTML = html

 waveforms.map((waveform, k) => {
      barnames.map((barname, i) => {
      const e = $(`${waveform}-${barname}`)
      e.oninput = _ => {
        for ([_, notes] of Object.entries(keys)) {
          notes[(k*4)+i][0].gain.value = parseFloat(e.value)
        }
      }
      })
 })

const canvas = $("a")
const canvasCtx = canvas.getContext("2d")

const keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 1300,
                 height: 150,
                 octaves: 5,
                 startNote: 'A1',
                 whiteNotesColour: 'white',
                 blackNotesColour: 'black',
                 hoverColour: '#f3e939'
            });
keyboard.keyDown = function (note, _) {
    keys[note] = []
    const midi = NoteParser.parse(note).midi
    const freqs = JSON.parse($("scale").value)
    .map(up => up + midi)
    .map(freq)
    waveforms.map(waveform => {
      barnames.map((barname, i) => {
        val = $(`${waveform}-${barname}`).value
        const osc = context.createOscillator()
        osc.type = waveform
        osc.frequency.value = freqs[i]
        const gain = context.createGain()
        gain.gain.value = val
        gain.connect(main_gain)
        osc.connect(gain)
        osc.start()
        keys[note].push([gain, osc])
      })
    })
  /*
      const osc = context.createOscillator()
      osc.type = "sawtooth"
      osc.frequency.value = freqs[i]
      const gain = context.createGain()
      gain.gain.value = handbars[i] 
      gain.connect(main_gain)
      osc.connect(gain)
      osc.start()
     
      keys[note].push([gain, osc])
      
  }*/
}

let ignore = 0
let num = 0

keyboard.keyUp = (note, frequency) => {
  keys[note].map((node, i) => {
    //if (i !== ignore || num % 4 !== 0) {
      node[1].stop()
      node[1].disconnect()
      node[0].disconnect()
    //}
    //i++
    //i %= 9
    //num++
  })
}
