const context = new AudioContext()
const freq = note => 440 * Math.pow(2, (note-69)/12)
const keys = {}
const analyser = context.createAnalyser()
const main_gain = context.createGain()
main_gain.connect(analyser)
main_gain.connect(context.destination)
//analyser.connect(main_gain)

const elements = Array.from(document.getElementById("handbars").children)
elements.map((e, i) => {
  e.oninput = _ => {
     for ([_, notes] of Object.entries(keys)) {
       notes[i][0].gain.value = parseFloat(e.value)
     }
  }
})
const canvas = document.getElementById("a")
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
    if (keys[note]) {
      keys[note].map(node => {
        node[1].stop()
        node[1].disconnect()
        node[0].disconnect()
      })
    }
    keys[note] = []
    const midi = NoteParser.parse(note).midi
    const handbars = elements.map(e => parseFloat(e.value))
    const freqs = [midi-12, midi+7, midi, midi+12, midi+19, midi+24, midi+28, midi+31, midi+36]
    .map(freq)
    for (let i = 0; i < 9; i++) {
      const osc = context.createOscillator()
      osc.type = "sine"
      osc.frequency.value = freqs[i]
      const gain = context.createGain()
      gain.gain.value = handbars[i]
      gain.connect(main_gain)
      osc.connect(gain)
      osc.start()
      keys[note].push([gain, osc])
    }
};

keyboard.keyUp = (note, frequency) => {
  keys[note].map(node => {
    node[1].stop()
    node[1].disconnect()
    node[0].disconnect()
  })
}
