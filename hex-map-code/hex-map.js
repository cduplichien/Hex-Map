p5.disableFriendlyErrors = true;

const opts = {
  // Generation Details
  height: 1200,
  tile_size: 10,
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
  snow_height: .9,
  rocks_height:.6,
  forest_height:.49,
  grass_height: .36, 
  sand_height: .26,
  light_water_height: .23,
  dark_water_height: .13,
  
  // Additional Functions
  randomize: () => randomize(),
  save: () => save(),
  export: () => exportData()
};

var mapData = [];

window.onload = function() {
  var gui = new dat.GUI({width:300});
  // gui.remember(opts)
  var general = gui.addFolder('Generation Details')
  general.open()
  general.add(opts, 'height', 500, 2000).onChange(setup);
  general.add(opts, 'tile_size', 2, 20).onChange(setup);
  
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
  heights.add(opts, 'snow_height', 0, 1).onChange(setup)
  heights.add(opts, 'rocks_height', 0, 1).onChange(setup)
  heights.add(opts, 'forest_height', 0, 1).onChange(setup)
  heights.add(opts, 'grass_height', 0, 1).onChange(setup)
  heights.add(opts, 'sand_height', 0, 1).onChange(setup)
  heights.add(opts, 'light_water_height', 0, 1).onChange(setup)
  heights.add(opts, 'dark_water_height', 0, 1).onChange(setup)

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
  var width = canvasDiv.offsetWidth;
  var height = opts.height;

  pixelDensity(2);
  
  var cnv = createCanvas(width, height);
  cnv.parent('sketchdiv');
  
  background(255)
  strokeWeight(1);
  stroke(0);
  
  draw_hexagon(30, 30, {v: 3, b: 'dark_water'}, 30);
  
  var hexagon_size = opts.tile_size
  
  var map_height = int(1.5 * height / (.86 * hexagon_size));
  var map_width =  int(1.5 * width / (hexagon_size * 3));
  
  var hex_map = []

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
      if (d.v < opts.dark_water_height) {
        d.b = 'dark_water';
      } else if(d.v < opts.light_water_height) {
        d.b = 'light_water';
      } else if (d.v < opts.sand_height) {
        d.b = 'sand';
      } else if (d.v < opts.grass_height) {
        d.b = 'grass';
      } else if (d.v < opts.forest_height) {
        d.b = 'forest';
      } else if (d.v < opts.rocks_height) {
        d.b = 'rocks';
      } else {
        d.b = 'snow';
      }
      
      draw_hexagon(mx, my, d);
      hex_map.push(d);
    }
  }
  mapData = hex_map;
}


function draw_hexagon(mx, my, d) {
    let v = int(d.v * 255.0);
    let side = opts.tile_size;

    fill(opts[d.b])
    
    strokeWeight(opts.outline_width);
    if (opts.outline) {
      stroke(opts.outline_color);
    } else {
      stroke(c)
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