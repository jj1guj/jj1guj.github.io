// ============================================================
// WebGL ユーティリティ関数
// ============================================================
var RTUtils = (function () {
  /**
   * script#f からシェーダーソースを取得する
   * テキストコンテンツが空の場合は src 属性の URL からフェッチする
   */
  function getShaderSource() {
    var elem = document.getElementById("f");
    var source = elem ? elem.textContent : "";
    if (source && source.replace(/\s/g, "").length > 0) {
      return source;
    }
    var url = elem ? elem.getAttribute("src") : "";
    if (!url) return source;
    try {
      var req = new XMLHttpRequest();
      req.open("GET", url, false);
      req.send(null);
      if ((req.status >= 200 && req.status < 300) || req.status === 0) {
        return req.responseText;
      }
    } catch (err) {}
    return source;
  }

  /**
   * シェーダーをコンパイルしてプログラムにアタッチする
   * @param {WebGLRenderingContext} gl
   * @param {WebGLProgram} program
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param {string} source
   * @returns {boolean} 成功なら true
   */
  function compileShader(gl, program, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return false;
    }
    gl.attachShader(program, shader);
    return true;
  }

  /**
   * フレームバッファ + カラーテクスチャ + 深度バッファを作成する
   * @param {WebGLRenderingContext} gl
   * @param {number} width
   * @param {number} height
   * @returns {{ framebuffer: WebGLFramebuffer, texture: WebGLTexture }}
   */
  function createFramebuffer(gl, width, height) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    var depthBuf = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuf);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuf
    );

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
    );

    return { framebuffer: fb, texture: tex };
  }

  return {
    getShaderSource: getShaderSource,
    compileShader: compileShader,
    createFramebuffer: createFramebuffer
  };
})();
