p5.disableFriendlyErrors = true;

const hex_height = 0.86;
const biomes = ['snow','rocks','forest','grass','sand','lightwater','darkwater'];

const opts = {
  // Generation Details
  tile_size: 10,
  use_canvas_size: true,
  width: 100,
  height: 100,
  outline: true,
  outline_width: 1,
  noise_mod: 1,
  noise_scale: .009,
  noise_max: 120,
  island_size: .55,
  
  // Initial Colors
  color_darkwater: [120, 120, 225], // RGB array
  color_lightwater: [150, 150, 255],
  color_sand: [237, 201, 175],
  color_grass: [207, 241, 135],
  color_forest: [167, 201, 135],
  color_rocks: [170, 170, 170],
  color_snow: [255, 255, 255],
  outline_color: '#918585',
  
  // Initial Height Ranges
  height_snow: .9,
  height_rocks: .6,
  height_forest: .49,
  height_grass: .36, 
  height_sand: .26,
  height_lightwater: .23,
  height_darkwater: .13,
  
  // Additional Functions
  randomize: () => randomize(),
  save: () => save(),
  export: () => exportData()
};

var mapData = {};

window.onload = function() {
  var gui = new dat.GUI({width:300});
  // gui.remember(opts)
  var general = gui.addFolder('Generation Details')
  general.open()
  general.add(opts, 'tile_size', 2, 20).onChange(setup);
  general.add(opts, 'use_canvas_size').onChange(setup);
  general.add(opts, 'width', 10, 500).onChange(setup);
  general.add(opts, 'height', 10, 500).onChange(setup);
  
  general.add(opts, 'outline_width', 1, 5).onChange(setup);
  
  general.add(opts, 'island_size', 0, 2).onChange(setup);
  general.add(opts, 'noise_scale', 0, .04).onChange(setup);
  general.add(opts, 'noise_mod', 1, 3).onChange(setup);
  general.addColor(opts, 'outline_color').onChange(setup);
  general.add(opts, 'outline').onChange(setup);
  
  var colors = gui.addFolder('Biome Colors');
  colors.open()
  colors.addColor(opts, 'color_snow').name("snow").onChange(setup)
  colors.addColor(opts, 'color_rocks').name("rocks").onChange(setup)
  colors.addColor(opts, 'color_forest').name("forest").onChange(setup)
  colors.addColor(opts, 'color_grass').name("grass").onChange(setup)
  colors.addColor(opts, 'color_sand').name("sand").onChange(setup)
  colors.addColor(opts, 'color_lightwater').name("light water").onChange(setup)
  colors.addColor(opts, 'color_darkwater').name("dark water").onChange(setup)
 

  var heights = gui.addFolder('Height Ranges');
  heights.open()
  heights.add(opts, 'height_snow', 0, 1).name("snow").onChange(setup);
  heights.add(opts, 'height_rocks', 0, 1).name("rocks").onChange(setup);
  heights.add(opts, 'height_forest', 0, 1).name("forest").onChange(setup);
  heights.add(opts, 'height_grass', 0, 1).name("grass").onChange(setup);
  heights.add(opts, 'height_sand', 0, 1).name("sand").onChange(setup);
  heights.add(opts, 'height_lightwater', 0, 1).name("light water").onChange(setup);
  heights.add(opts, 'height_darkwater', 0, 1).name("dark water").onChange(setup);

  gui.add(opts, "randomize").name("Randomize");
  gui.add(opts, "save").name("Save");

  var exports = gui.addFolder('Export Options');
  exports.open();
  exports.add(opts, "export").name("Export JSON");
};

function randomize() {
  noiseSeed()
  setup()
}

function save() {
  save('photo.png');
}

function exportData() {
	console.log(saveJSON(mapData, "map.json", true));
}

function setup()
{
  var canvasDiv = document.getElementById('sketchdiv');
  var pageBounds = document.querySelector('html')
  var hexagon_size = opts.tile_size;
  var width = opts.use_canvas_size ? pageBounds.offsetWidth : int((opts.width - 1) * hexagon_size * 1.5);
  var height = opts.use_canvas_size ?  pageBounds.offsetHeight : int((opts.height - 1) * 2 * (hex_height * hexagon_size));
  var map_height = 2 + int(height / (hexagon_size * 2* hex_height));
  var map_width = 1 + int(width / (hexagon_size * 1.5));
  var biomeData = biomes.map(b => {return {name: b, height: opts['height_'+b], color: opts['color_'+b]};});

  pixelDensity(2);
  
  var cnv = createCanvas(width, height);
  cnv.parent('sketchdiv');
  
  background(255)
  strokeWeight(1);
  stroke(0);
  var newMapData = {width: map_width, height: map_height, biomes: biomeData, map: []};

  for (var x = 0; x < map_width; x++) {
    newMapData.map.push([]);
    for (var y = 0; y < map_height; y++) {
      
      // Calculate initial noise value
      let noiseScalar = opts.noise_scale * hexagon_size;
      let noiseVal = noise((x / opts.noise_mod)*noiseScalar, (y / opts.noise_mod)*noiseScalar);

      // Adjust for distance if desired
      let dist = sqrt(pow((x - map_width/2), 2) + pow(y - (map_height/2), 2));
      let grad = dist / (opts.island_size * min(map_width, map_height));
      noiseVal -= pow(grad, 3);
      noiseVal = max(noiseVal, 0);

      // init datum
      let d = {v: noiseVal};

      // Determine biome
      for (i = biomeData.length - 1; i >= 0; --i) {
        if (d.v < biomeData[i].height) {
          d.b = i;
          break;
        }
      }
      newMapData.map[x].push(d);

      let mx = x * hexagon_size * 1.5;
      let my = y * 2 * hexagon_size * hex_height;
      my+= x%2 * hexagon_size * hex_height;
      draw_hexagon(mx, my, d, newMapData);
    }
  }
  mapData = newMapData;
}


function draw_hexagon(mx, my, d, mapData) {

    let v = int(d.v * 255.0);
    let side = opts.tile_size;

    let biomeColor = mapData.biomes[d.b].color;
    fill(biomeColor)
    
    strokeWeight(opts.outline_width);
    if (opts.outline) {
      stroke(opts.outline_color);
    } else {
      stroke(biomeColor);
    }
    
    beginShape()
    vertex(mx + side * sin(PI/2), my + side * cos(PI/2))
    vertex(mx + side * sin(PI/6), my + side * cos(PI/6))
    vertex(mx + side * sin(11 * PI/6), my + side * cos(11 * PI/6))
    vertex(mx + side * sin(3 * PI/2), my + side * cos(3 * PI/2))
    vertex(mx + side * sin(7 * PI/6), my + side * cos(7 * PI/6))
    vertex(mx + side * sin(5 * PI/6), my + side * cos(5 * PI/6))
    endShape(CLOSE)
  
}