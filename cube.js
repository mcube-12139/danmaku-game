/**
 * @type {HTMLCanvasElement}
 */
const glCanvas = document.createElement("canvas");
glCanvas.width = 400;
glCanvas.height = 400;
glCanvas.style.cssText = "position: absolute; left: 0px; top: 0px";
document.body.appendChild(glCanvas);

/**
 * @type {WebGL2RenderingContext}
 */
const gl = glCanvas.getContext("webgl2");

let cube = [];

/**
 * Create, compile and return a shader.
 *
 * @param {number} type shader type
 * @param {string} code shader code
 * @returns {WebGLShader} shader
 */
function loadShader(type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compiling failed: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Create a shader program linked with a vertex shader and a fragment shader.
 * 
 * @param {string} vsCode vertex shader code
 * @param {string} fsCode fragment shader code
 * @returns {WebGLShader} shader program
 */
function loadShaderProgram(vsCode, fsCode) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsCode);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsCode);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Shader program linking failed: ${gl.getProgramInfoLog(shaderProgram)}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return shaderProgram;
}

/**
 * @type {WebGLShader}
 */
const shapeShaderProgram = loadShaderProgram("\
    attribute vec3 aVertexPosition;\
    attribute vec3 aVertexColor;\
    \
    uniform mat4 uModelMatrix;\
    uniform mat4 uViewMatrix;\
    uniform mat4 uProjectionMatrix;\
    \
    varying lowp vec4 vColor;\
    \
    void main() {\
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\
        vColor = vec4(aVertexColor, 1.0);\
    }\
    ", "\
    varying lowp vec4 vColor;\
    \
    void main() {\
        gl_FragColor = vColor;\
    }\
");

/**
 * @type {WebGLVertexArrayObject}
 */
const shapeVertexArray = gl.createVertexArray();
/**
 * @type {WebGLBuffer}
 */
const shapeVertexBuffer = gl.createBuffer();
gl.bindVertexArray(shapeVertexArray);
gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBuffer);
gl.bufferData(
    gl.ARRAY_BUFFER,
    120,
    gl.DYNAMIC_DRAW
);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
gl.enableVertexAttribArray(1);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
    0, 1, 2, 4, 2, 1, // xOy
    3, 5, 0, 1, 0, 5, // xOz
    3, 0, 6, 2, 6, 0, // yOz
    5, 3, 7, 6, 7, 3, // xOy +
    2, 4, 6, 7, 6, 4, // xOz +
    1, 5, 4, 7, 4, 5 // yOz +
]), gl.STATIC_DRAW);

gl.enable(gl.CULL_FACE);
gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const projectionMatrix = [];
mat4.perspective(
    projectionMatrix,
    0.9272952180016122,
    1,
    0.1,
    1024.0
);
const modelMatrix = mat4.create();
const viewMatrix = [];
mat4.translate(
    viewMatrix,
    mat4.create(),
    [0.0, 0.0, -400.0]
);
// const modelMatrix = [];
// mat4.identity(modelMatrix);
// const viewMatrix = [];
// mat4.identity(viewMatrix);
// const projectionMatrix = [];
// mat4.identity(projectionMatrix);

gl.useProgram(shapeShaderProgram);
gl.uniformMatrix4fv(
    gl.getUniformLocation(shapeShaderProgram, "uProjectionMatrix"),
    false,
    projectionMatrix
);
gl.uniformMatrix4fv(
    gl.getUniformLocation(shapeShaderProgram, "uModelMatrix"),
    false,
    modelMatrix
);
gl.uniformMatrix4fv(
    gl.getUniformLocation(shapeShaderProgram, "uViewMatrix"),
    false,
    viewMatrix
);

/**
 * Draw a shape.
 * 
 * @param {number} vertices vertices array
 * @param {number} mode topology mode
 * @param {number} count vertex count
 */
function drawShape(vertices, mode, count) {
    gl.bindVertexArray(shapeVertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeVertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.useProgram(shapeShaderProgram);
    gl.drawArrays(mode, 0, count);
}

function setup() {
    for (let i = 0; i != 3; ++i) {
        cube[i] = [];
        for (let j = 0; j != 3; ++j) {
            cube[i][j] = [];
            for (let k = 0; k != 3; ++k) {
                let c = Math.random();
                let xx = 48 * i - 72;
                let yy = 48 * j - 72;
                let zz = 48 * k - 72;

                let vertexArray = gl.createVertexArray();
                let vertexBuffer = gl.createBuffer();
                gl.bindVertexArray(vertexArray);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    xx, yy, zz, c, c, c,
                    xx + 48, yy, zz, c, c, c,
                    xx, yy + 48, zz, c, c, c,
                    xx, yy, zz + 48, c, c, c,
                    xx + 48, yy + 48, zz, c, c, c,
                    xx + 48, yy, zz + 48, c, c, c,
                    xx, yy + 48, zz + 48, c, c, c,
                    xx + 48, yy + 48, zz + 48, c, c, c
                ]), gl.DYNAMIC_DRAW);
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
                gl.enableVertexAttribArray(0);
                gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
                gl.enableVertexAttribArray(1);

                cube[i][j][k] = {
                    array: vertexArray,
                    buffer: vertexBuffer
                };
            }
        }
    }
    const modelMatrix = mat4.create();
    // mat4.translate(modelMatrix, modelMatrix, [0, 0, -124.70765814495915]);
    mat4.rotateX(modelMatrix, modelMatrix, 0.5235987755982988);
    mat4.rotateY(modelMatrix, modelMatrix, 0.7853981633974483);

    gl.useProgram(shapeShaderProgram);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shapeShaderProgram, "uModelMatrix"),
        false,
        modelMatrix
    );
    for (let i = 0; i != 3; ++i) {
        for (let j = 0; j != 3; ++j) {
            for (let k = 0; k != 3; ++k) {
                gl.bindVertexArray(cube[i][j][k].array);
                gl.bindBuffer(gl.ARRAY_BUFFER, cube[i][j][k].buffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
            }
        }
    }

    /*drawShape(new Float32Array([
        0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        32.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        0.0, 32.0, 0.0, 0.0, 1.0, 0.0,
        32.0, 32.0, 0.0, 0.0, 0.0, 1.0
    ]), gl.TRIANGLE_STRIP, 4);*/
}

function start() {

}

function execGameCommand(cmd) {

}

function onGift(data) {

}

function onFansUpdate(fans) {

}

function getWinPlayerText(p) {
    return `${p[0]} 填写数${p[1]}`;
}