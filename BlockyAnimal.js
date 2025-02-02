// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  uniform float u_Size;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;

    gl_PointSize = u_Size;

  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_selectedSegments = 10.0;
let g_globalAngle = 0;
let g_yellowAngle = 0;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Awesomeness: draw a pattern button event
  /*document.getElementById('patternSizeSlide').addEventListener('mouseup', function() { patSize = this.value; });
  document.getElementById('patternNumSlide').addEventListener('mouseup', function() { numInc = parseFloat(this.value); });
  document.getElementById('patternButton').onclick = function() { drawAPattern(); };*/

  // Button events (shape type)
  /*document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0] };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0] };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById("pointButton").onclick = function() { g_selectedType = POINT; };
  document.getElementById("triButton").onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById("circleButton").onclick = function() { g_selectedType = CIRCLE; };

  // Slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });*/
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

  // Size slider events
  //document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

  // Circle Segment slider events
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  //var len = g_points.length;
  /*var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();

  }*/

    // Draw a test triangle
    //drawTriangle3D( [-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

    // Draw the body cube
    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.matrix.setTranslate(-0.25, -0.75, 0.0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.setTranslate(0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1.0, 0.0, 0.0);
    leftArm.matrix.rotate(-g_yellowAngle, 0,0,1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5,0,0);
    leftArm.render();

    // test box
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix.setTranslate(-0.1,0.1,0.0,0.0);
    box.matrix.rotate(-30,1,0,0);
    box.matrix.scale(0.2,0.4,0.2);
    box.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

var g_shapesList = [];

/*var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];*/

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);
  //console.log('x: ' + x, ' y: ' + y);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  /*
  // Store the coordinates to g_points array
  g_points.push([x, y]);

  // Store the coordinates to g_points array
  g_colors.push(g_selectedColor.slice());

  // Store the size to g_sizes array
  g_sizes.push(g_selectedSize);
  */

  /*if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }*/

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
  
}

function drawRectangleWithTriangles(widthStart, widthEnd, heightStart, heightEnd) {
  drawTriangle([widthStart, heightStart, widthEnd, heightEnd, widthEnd, heightStart]);
  drawTriangle([widthStart, heightStart, widthStart, heightEnd, widthEnd, heightEnd]);
}

function drawAPicture() {
  // clear the canvas
  g_shapesList = [];
  renderAllShapes();

  // draw triangles

  // draw sky
  gl.uniform4f(u_FragColor, 0.5, 0.8, 0.9, 1.0);
  /*drawTriangle([-1, -1, 1, 1, 1, -1]);
  drawTriangle([-1, -1, -1, 1, 1, 1]); // draw two connected triangles to make a rectangle*/
  drawRectangleWithTriangles(-1, 1, -1, 1);

  // draw grass
  gl.uniform4f(u_FragColor, 0.2, 0.7, 0.3, 1.0);
  drawTriangle([-1, -1, -0.5, -0.7, 0.7, -1]);
  drawTriangle([-0.2, -1, 0.7, -0.7, 1, -1]);
  drawTriangle([0.7, -0.7, 1, -0.7, 1, -1]);

  // draw the sun
  let sun = new Circle();
  sun.position = [-0.6, 0.7];
  sun.size = 35.0;
  sun.segments = 20.0;
  sun.color = [0.9, 0.8, 0.3, 1.0];
  sun.render();
  gl.uniform4f(u_FragColor, 0.9, 0.8, 0.3, 1.0);
  drawTriangle([-0.5, 0.6, -0.3, 0.3, -0.2, 0.4]);
  drawTriangle([-0.7, 0.6, -1.0, 0.4, -0.9, 0.3]);
  drawTriangle([-0.6, 0.6, -0.7, 0.3, -0.5, 0.3]);

  // draw clouds
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  drawTriangle([-0.6, 0.7, -0.3, 0.9, -0.1, 0.7]);
  drawTriangle([-0.6, 0.7, 0.0, 0.5, 0.2, 0.7]);
  drawTriangle([-0.2, 0.7, 0.1, 0.9, 0.4, 0.7]);
  drawTriangle([-0.3, 0.8, -0.6, 1.0, -0.8, 0.7]);
  drawTriangle([-0.9, 0.7, -0.8, 0.6, -0.4, 0.8]);
  drawTriangle([-1.0, 0.7, -0.8, 0.9, -0.4, 0.7]);
  drawTriangle([0.6, 0.7, 0.9, 0.9, 1.0, 0.7]);
  drawTriangle([0.8, 0.8, 1.0, 1.0, 1.0, 0.7]);
  drawTriangle([0.8, 0.7, 1.0, 0.7, 1.0, 0.6]);
  drawTriangle([0.5, 0.6, 0.6, 0.8, 0.9, 0.7]);

  // draw silo
  let siloRoof = new Circle();
  siloRoof.position = [0.7, 0.3];
  siloRoof.size = 40.0;
  siloRoof.segments = 20.0;
  siloRoof.color = [0.8, 0.8, 0.8, 1.0];
  siloRoof.render();
  gl.uniform4f(u_FragColor, 0.7, 0.7, 0.7, 1.0);
  drawRectangleWithTriangles(0.5, 0.9, -1, 0.3);
  gl.uniform4f(u_FragColor, 0.8, 0.8, 0.8, 1.0);
  drawRectangleWithTriangles(0.9, 0.95, -0.95, 0.25);

  
  
  /*drawTriangle([0.5, -1, 0.9, 0.3, 0.9, -1]);
  drawTriangle([0.5, -1, 0.5, 0.3, 0.9, 0.3]);*/

  // draw barn
  gl.uniform4f(u_FragColor, 0.75, 0.2, 0.0, 1.0);

  drawRectangleWithTriangles(-0.4, 0.8, -1, -0.3); // base

  drawTriangle([-0.4, -0.3, 0.2, 0.0, 0.8, -0.3]); // roof

  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  drawRectangleWithTriangles(0.1, 0.3, -1.0, -0.7); // door

  drawRectangleWithTriangles(0.1, 0.3, -0.4, -0.2); // top window
  drawTriangle([0.1, -0.2, 0.2, -0.1, 0.3, -0.2]);

  drawRectangleWithTriangles(-0.3, -0.1, -0.8, -0.6); // left window
  drawRectangleWithTriangles(0.5, 0.7, -0.8, -0.6); // right window

  // draw tree
  gl.uniform4f(u_FragColor, 0.5, 0.3, 0.1, 1.0);
  drawTriangle([-0.5, -1.0, -0.3, -1.0, -0.4, -0.4]); // trunk
  gl.uniform4f(u_FragColor, 0.2, 0.5, 0.05, 1.0);
  drawTriangle([-0.6, -0.7, -0.4, -0.2, -0.2, -0.7]); // leaves
  drawTriangle([-0.6, -0.4, -0.4, 0.0, -0.2, -0.4]);

}

// drawAPattern Global variables:
var numInc = 0.1;
let patSize = 3.0;

function drawAPattern() {

  // clear the canvas
  g_shapesList = [];
  renderAllShapes();

  let num = 0;

  for (i = -1.0; i < 1.0; i += numInc) {
    for (j = -1.0; j < 1.0; j += numInc) {
      num++;
      let pnt = new Point();
      pnt.position = [i, j];
      pnt.size = patSize;
      pnt.color = [Math.abs(j), Math.abs(j), Math.abs(i), 1.0];
      pnt.render();
    }
  }
}
