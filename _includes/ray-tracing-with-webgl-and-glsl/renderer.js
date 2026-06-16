// ============================================================
// レイトレーシング レンダラー
// ============================================================
(function () {
  // ============================================================
  // 状態変数
  // ============================================================
  var canvas, gl;
  var raytraceProgram, displayProgram;
  var rtUniforms = {};
  var dispUniforms = {};
  var rtPosAttrib, dispPosAttrib;
  var fb1, fb2;
  var mousePos = [0, 0];
  var isRunning = true;
  var startTime;
  var canvasWidth, canvasHeight;
  var sceneSeedValue;

  // FPS制御
  var lastFrameTime = 0;
  var frameInterval = 1000 / 30; // TARGET: 30fps

  // ============================================================
  // フレームバッファ管理
  // ============================================================
  function createFB() {
    return RTUtils.createFramebuffer(gl, canvasWidth, canvasHeight);
  }

  function deleteFB(fb) {
    if (fb) {
      gl.deleteFramebuffer(fb.framebuffer);
      gl.deleteTexture(fb.texture);
    }
  }

  // ============================================================
  // キャンバスサイズ計算
  // ============================================================
  function updateCanvasSize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var cssW = Math.max(1, Math.floor(rect.width));
    var cssH = Math.max(1, Math.floor(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    canvasWidth = Math.max(1, Math.floor(cssW * dpr));
    canvasHeight = Math.max(1, Math.floor(cssH * dpr));
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
  }

  // ============================================================
  // イベントハンドラ
  // ============================================================
  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mousePos = [
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((e.clientY - rect.top) / rect.height) * 2
    ];
  }

  function onKeyDown(e) {
    if (e.keyCode === 27) isRunning = false;
  }

  function onResize() {
    updateCanvasSize();
    deleteFB(fb1);
    deleteFB(fb2);
    fb1 = createFB();
    fb2 = createFB();
  }

  // ============================================================
  // レンダリングループ
  // ============================================================
  function renderLoop() {
    if (!isRunning) return;

    var now = Date.now();
    if (now - lastFrameTime < frameInterval) {
      requestAnimationFrame(renderLoop);
      return;
    }
    lastFrameTime = now;

    var elapsedTime = 0.001 * (now - startTime);

    // Pass 1: レイトレーシング → fb1
    gl.useProgram(raytraceProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb1.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, fb2.texture);
    gl.enableVertexAttribArray(rtPosAttrib);
    gl.vertexAttribPointer(rtPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2fv(rtUniforms.mouse, mousePos);
    gl.uniform1f(rtUniforms.time, elapsedTime);
    gl.uniform2fv(rtUniforms.resolution, [canvasWidth, canvasHeight]);
    gl.uniform1i(rtUniforms.sampler, 0);
    gl.uniform1f(rtUniforms.sceneSeed, sceneSeedValue);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Pass 2: 結果を画面に表示
    gl.useProgram(displayProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, fb1.texture);
    gl.enableVertexAttribArray(dispPosAttrib);
    gl.vertexAttribPointer(dispPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(dispUniforms.texture, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.flush();

    // フレームバッファをスワップ（ping-pong）
    var temp = fb1;
    fb1 = fb2;
    fb2 = temp;

    requestAnimationFrame(renderLoop);
  }

  // ============================================================
  // 初期化
  // ============================================================
  function initRendering() {
    // 頂点バッファ（フルスクリーンクワッド）
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]),
      gl.STATIC_DRAW
    );

    // レイトレースシェーダーの uniform/attribute 取得
    gl.useProgram(raytraceProgram);
    rtUniforms.mouse = gl.getUniformLocation(raytraceProgram, "m");
    rtUniforms.time = gl.getUniformLocation(raytraceProgram, "t");
    rtUniforms.resolution = gl.getUniformLocation(raytraceProgram, "r");
    rtUniforms.sampler = gl.getUniformLocation(raytraceProgram, "smp");
    rtUniforms.sceneSeed = gl.getUniformLocation(raytraceProgram, "sceneSeed");
    rtPosAttrib = gl.getAttribLocation(raytraceProgram, "p");

    // 表示シェーダーの uniform/attribute 取得
    gl.useProgram(displayProgram);
    dispUniforms.texture = gl.getUniformLocation(displayProgram, "t");
    dispPosAttrib = gl.getAttribLocation(displayProgram, "p");

    // フレームバッファ作成
    fb1 = createFB();
    fb2 = createFB();

    // 初期設定
    gl.activeTexture(gl.TEXTURE0);
    gl.clearColor(0, 0, 0, 1);
    sceneSeedValue = Math.random() * 1000.0;
    startTime = Date.now();

    // レンダリング開始
    renderLoop();
  }

  // ============================================================
  // エントリーポイント
  // ============================================================
  window.addEventListener("load", function () {
    canvas = document.getElementById("c");
    gl = canvas.getContext("webgl");

    updateCanvasSize();

    // イベント登録
    canvas.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("resize", onResize, false);

    // レイトレースシェーダーのコンパイル・リンク
    raytraceProgram = gl.createProgram();
    var vertSrc = "attribute vec3 p;void main(){gl_Position=vec4(p,1.);}";
    var fragSrc = RTUtils.getShaderSource();
    if (!RTUtils.compileShader(gl, raytraceProgram, gl.VERTEX_SHADER, vertSrc)) return;
    if (!RTUtils.compileShader(gl, raytraceProgram, gl.FRAGMENT_SHADER, fragSrc)) return;
    gl.linkProgram(raytraceProgram);
    if (!gl.getProgramParameter(raytraceProgram, gl.LINK_STATUS)) {
      alert(gl.getProgramInfoLog(raytraceProgram));
      return;
    }

    // 表示シェーダーのコンパイル・リンク
    displayProgram = gl.createProgram();
    var dispVertSrc =
      "attribute vec3 p;varying vec2 v;void main(){v=(p+1.).xy/2.;gl_Position=vec4(p,1.);}";
    var dispFragSrc =
      "precision mediump float;uniform sampler2D t;varying vec2 v;void main(){gl_FragColor=texture2D(t,v);}";
    RTUtils.compileShader(gl, displayProgram, gl.VERTEX_SHADER, dispVertSrc);
    RTUtils.compileShader(gl, displayProgram, gl.FRAGMENT_SHADER, dispFragSrc);
    gl.linkProgram(displayProgram);

    initRendering();
  }, false);
})();
