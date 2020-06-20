p5.disableFriendlyErrors = true;

const opts = {
  // Generation Details
  tile_size: 10,
  use_canvas_size: true,
  width: 100,
  height: 100,
  outline: true,
  outline_width: 1,
  noise_mod: 1,
  noise_scale: .01,
  noise_max: 120,
  island_size: .62,
  
  // Initial Colors
  dark_water: [120, 120, 225], // RGB array
  light_water: [150, 150, 255],
  sand: [237, 201, 175],
  grass: [207, 241, 135],
  forest: [167, 201, 135],
  rocks: [170, 170, 170],
  snow: [255, 255, 255],
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
  colors.addColor(opts, 'snow').onChange(setup)
  colors.addColor(opts, 'rocks').onChange(setup)
  colors.addColor(opts, 'forest').onChange(setup)
  colors.addColor(opts, 'grass').onChange(setup)
  colors.addColor(opts, 'sand').onChange(setup)
  colors.addColor(opts, 'light_water').onChange(setup)
  colors.addColor(opts, 'dark_water').onChange(setup)
 

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
	console.log(saveJSON(mapData, "map.json"));
}

function setup()
{
  var canvasDiv = document.getElementById('sketchdiv');
  var hexagon_size = opts.tile_size;
  var width = opts.use_canvas_size ? canvasDiv.offsetWidth : int(opts.width * hexagon_size * 3);
  var height = opts.use_canvas_size ?  canvasDiv.offsetHeight : int(opts.height * (.86 * hexagon_size));
  var map_height = opts.use_canvas_size ? 2 + int(height / (hexagon_size*.86)) : opts.height;
  var map_width =  opts.use_canvas_size ? 2 + int(width / (hexagon_size*3)) : opts.width;

  pixelDensity(2);
  
  var cnv = createCanvas(width, height);
  cnv.parent('sketchdiv');
  
  background(255)
  strokeWeight(1);
  stroke(0);
  var newMapData = {w: map_width, h: map_height, m: []};

  for (var y = 0; y < map_height; y++) {
    for (var x = 0; x < map_width; x++) {
      let mx = x * hexagon_size * 3;
      mx += y%2 * hexagon_size * 1.5;
      let my = y * (.86 * hexagon_size);
      
      // Calculate initial noise value
      let noiseVal = noise((mx / opts.noise_mod)*opts.noise_scale, (my / opts.noise_mod)*opts.noise_scale);

      // Adjust for distance if desired
      let dist = sqrt(pow((mx - width/2), 2) + pow((my - height/2), 2));
      let grad = dist / (opts.island_size * min(width, height));
      noiseVal -= pow(grad, 3);
      noiseVal = max(noiseVal, 0);

      // init datum
      let d = {x: x, y: y, v: noiseVal};

      // Determine biome
      if (d.v < opts.height_darkwater) {
        d.b = 'dark_water';
      } else if(d.v < opts.height_water) {
        d.b = 'light_water';
      } else if (d.v < opts.height_sand) {
        d.b = 'sand';
      } else if (d.v < opts.height_grass) {
        d.b = 'grass';
      } else if (d.v < opts.height_forest) {
        d.b = 'forest';
      } else if (d.v < opts.height_rocks) {
        d.b = 'rocks';
      } else {
        d.b = 'snow';
      }
      
      draw_hexagon(mx, my, d);
      newMapData.m.push(d);
    }
  }
  mapData = newMapData;
}


function draw_hexagon(mx, my, d) {
    let v = int(d.v * 255.0);
    let side = opts.tile_size;

    fill(opts[d.b])
    
    strokeWeight(opts.outline_width);
    if (opts.outline) {
      stroke(opts.outline_color);
    } else {
      stroke(opts[d.b]);
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