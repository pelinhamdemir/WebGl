const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

// Shader programs
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform float u_pointSize;
    void main() {
        gl_Position = a_position;
        gl_PointSize = u_pointSize;  // Point size set by uniform
        v_color = a_color;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

// Shader compilation and linking
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program:', gl.getProgramInfoLog(program));
        return null;
    }
    gl.useProgram(program);
    return program;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(vertexShader, fragmentShader);

// Triangle vertices
const vertices = [
    // Üçgenin köşeleri (turuncu renk)
    0.0,  0.5, 0.0, 1.0, 0.65, 0.0, // Vertex 1 (Turuncu)
   -0.5, -0.5, 0.0, 1.0, 0.65, 0.0, // Vertex 2 (Turuncu)
    0.5, -0.5, 0.0, 1.0, 0.65, 0.0  // Vertex 3 (Turuncu)
];

const triangleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Sun circle vertices generator
function createCircleVertices(centerX, centerY, radius, sides, color) {
    const vertices = [];
    vertices.push(centerX, centerY, 0.0, ...color); // Center vertex for the fan

    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push(x, y, 0.0, ...color);
    }
    return vertices;
}

// Sun color and circle parameters
const sunCenter = [0.8, 0.8];
const sunRadius = 0.1;
const sunColor = [1.0, 1.0, 0.0, 1.0];
const sunSides = 30;

// Create sun circle vertices and buffer
const sunVertices = createCircleVertices(sunCenter[0], sunCenter[1], sunRadius, sunSides, sunColor);
const sunBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunVertices), gl.STATIC_DRAW);

// Sun ray parameters
const rayLength = 0.2;
const rayColor = [1.0, 0.525, 0.3, 1.0];  // A mix between orange and pink
const rayCount = 6; // Number of rays

// Function to create a rectangle to simulate a thick line
function createThickLine(x1, y1, x2, y2, width, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Calculate the four corners of the rectangle
    const halfWidth = width / 2;
    const vertices = [
        // First triangle (front)
        x1 + halfWidth * Math.cos(angle + Math.PI / 2), y1 + halfWidth * Math.sin(angle + Math.PI / 2), 0.0, ...color,
        x2 + halfWidth * Math.cos(angle + Math.PI / 2), y2 + halfWidth * Math.sin(angle + Math.PI / 2), 0.0, ...color,
        x2 - halfWidth * Math.cos(angle + Math.PI / 2), y2 - halfWidth * Math.sin(angle + Math.PI / 2), 0.0, ...color,

        // Second triangle (back)
        x1 + halfWidth * Math.cos(angle - Math.PI / 2), y1 + halfWidth * Math.sin(angle - Math.PI / 2), 0.0, ...color,
        x1 + halfWidth * Math.cos(angle + Math.PI / 2), y1 + halfWidth * Math.sin(angle + Math.PI / 2), 0.0, ...color,
        x2 - halfWidth * Math.cos(angle + Math.PI / 2), y2 - halfWidth * Math.sin(angle + Math.PI / 2), 0.0, ...color
    ];
    return vertices;
}

// Create sun ray vertices
const rayVertices = [];
for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * 2 * Math.PI;
    const startX = sunCenter[0] + sunRadius * Math.cos(angle);
    const startY = sunCenter[1] + sunRadius * Math.sin(angle);
    const endX = sunCenter[0] + (sunRadius + rayLength) * Math.cos(angle);
    const endY = sunCenter[1] + (sunRadius + rayLength) * Math.sin(angle);
    
    const ray =  0.02 ; 
    

    
    const RayVertices = createThickLine(startX, startY, endX, endY, ray, rayColor);
    rayVertices.push(...RayVertices);
}

const rayBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rayBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rayVertices), gl.STATIC_DRAW);

// Points for different sizes
const points = [
    // Small point (Red)
    -0.7, 0.7, 0.0, 1.0, 0.0, 0.0,
    // Large point (Blue)
    -0.9, 0.5, 0.0, 0.0, 0.0, 1.0
];

const pointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
const triangleCenter = [0.0, -0.1667];


// Black lines 
const lineVertices = [
    // Red point to the center of the triangle
    -0.7, 0.7, 0.0, 0.0, 0.0, 0.0,  triangleCenter[0], triangleCenter[1], 0.0, 0.0, 0.0, 0.0,
    
    // Blue point to the center of the triangle
    -0.9, 0.5, 0.0, 0.0, 0.0, 0.0,  triangleCenter[0], triangleCenter[1], 0.0, 0.0, 0.0, 0.0
];
const lineBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);


// Attribute locations
const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');
const pointSizeLocation = gl.getUniformLocation(program, 'u_pointSize');

// Render setup
gl.clearColor(0.8, 0.8, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Draw the triangle
gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);

gl.drawArrays(gl.TRIANGLES, 0, 3);

// Draw the sun as a filled circle
gl.bindBuffer(gl.ARRAY_BUFFER, sunBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);

gl.drawArrays(gl.TRIANGLE_FAN, 0, sunVertices.length / 7);

// Draw the sun rays
gl.bindBuffer(gl.ARRAY_BUFFER, rayBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);

gl.drawArrays(gl.TRIANGLES, 0, rayVertices.length / 7);

// Draw points with different sizes
gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);

// Draw small point
gl.uniform1f(pointSizeLocation, 30.0); // Set small point size
gl.drawArrays(gl.POINTS, 0, 1);

// Draw large point
gl.uniform1f(pointSizeLocation, 20.0); // Set large point size
gl.drawArrays(gl.POINTS, 1, 1);    


// Draw black lines
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);


// Set line width for the thicker line
gl.lineWidth(10);  // Set this to any number to make one line thicker

// Draw the first line (thicker line)
gl.drawArrays(gl.LINES, 0, 2);  // Assuming first line data is at index 0

// Set line width back to normal for the second line
gl.lineWidth(50);  // Default line width (thinner line)

// Draw the second line (thinner line)
gl.drawArrays(gl.LINES, 2, 2);  // Assuming second line data is at index 2
