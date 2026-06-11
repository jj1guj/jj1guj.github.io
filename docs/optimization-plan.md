# レイトレーサー高速化・アダプティブ描画クオリティ調整 実装計画

## 対象ファイル
- シェーダー: `_includes/ray-tracing-with-webgl-and-glsl/shader.frag`
- ランタイム: `_includes/ray-tracing-with-webgl-and-glsl/runtime.js`

## 現在の状態
- SAMPLES_PER_PIXEL = 20, MAX_REF = 50
- GRID_COLS = 5, GRID_ROWS = 5 (小球25個, NUM_SPHERES = 28)
- FPS制限: 30fps (runtime.js で実装済み)
- 閾値カットによる早期終了を実装済み (tempColor <= 0.01 で break)

---

## フェーズ1: シェーダー側の高速化

### 1. Russian Roulette
- 現在の閾値カット (バイアスあり) を置き換える
- 生存確率 p = max(tempColor.r, max(tempColor.g, tempColor.b))
- random() > p なら break、生き残ったら tempColor /= p で補償
- 最初の数バウンス (2回程度) は無条件で生存させる
- MAX_REF = 50 のまま活かせる
- 参考: 原書第3巻 §3.6 / https://inzkyk.xyz/ray_tracing_in_one_weekend/week_3/3_6_importance_sampling_materials/

### 2. intersectSphere の早期棄却
- d <= 0 のとき sqrt(d) を呼ばないようにガード
- 現状は負の値でも sqrt が走っている

### 3. radius == 0 の球スキップ
- 衝突判定で消された小球 (radius = 0.0) は intersectSphere 自体を呼ばない
- intersectExec ループ内で if (sphere[i].radius <= 0.0) をスキップ

### 4. 構造体の未使用 color メンバ削除
- Sphere, Plane, Intersection の color メンバは未使用
- 削除してレジスタ圧を下げる

---

## フェーズ2: 計測インフラ

### 5. JS側でフレームタイム計測
- performance.now() で描画時間を測定
- 移動平均で安定した値を得る
- フェーズ3の全てのアダプティブ制御の判断材料になる

---

## フェーズ3: アダプティブ調整

### 6. 解像度スケーリング
- JS側でキャンバスの pixelRatio / サイズを動的に変更
- JS側だけで完結、最大の効果 (ピクセル数に比例)

### 7. 小球数の動的制御
- uniform int actualSpheres を追加
- ループ内で if (i >= actualSpheres) break;
- max は教材と同じ 484 (22×22)、min は 0
- GLSL ES 1.00 制約: const でアレイサイズ固定 + uniform で実効数を制御

### 8. SAMPLES_PER_PIXEL の動的制御
- uniform int actualSamples を追加
- ループ内で if (sample >= actualSamples) break;
- const は max 値に固定

### 9. アダプティブコントローラー
- フレームタイムに応じて 6〜8 を自動調整するロジック
- 目標 FPS: 最低 30fps
- 調整優先順位: 解像度 → 小球数 → SAMPLES_PER_PIXEL
- FPS制限は既に実装済み (runtime.js)

---

## 備考
- MAX_REF の動的制御は Russian Roulette により不要 (自動的に打ち切られる)
- GLSL ES 1.00 ではループ上限に uniform を使えないため、const を max 値に固定 + ループ内 break パターンで対応
