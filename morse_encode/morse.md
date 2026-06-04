---
layout: default
title: モールス符号に変換するやつ
permalink: /morse_encode/morse.html
---

## モールス符号に変換するやつ

<script src="./morse.js"></script>
現状半角英数字とひらがなのみに対応しています. それ以外の文字を入力すると空白が表示されます.<br>
使える記号: ".", ",", ":", "?", "_", "+", "-", "×"(乗算記号), "^", "/", "@", "(", ")", "(ダブルクオーテーション), '(シングルクォーテーション)<br>
<p>
入力(平文)
<form id="form1" action="#">
    <textarea id="input_message" name="message" cols="40" rows="10"></textarea> 
</form><br>
<input type="button" onclick="alphabet_to_morse()" value="エンコード">
</p>

<p>
エンコード結果
<form id="form1" action="#">
<textarea id="output_message" name="message" cols="40" rows="10" readonly></textarea> 
</form>
</p>
