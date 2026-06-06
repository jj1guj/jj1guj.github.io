---
layout: default
permalink: /index.html
---

## 自己紹介

### 名前

jj1guj(じぇーじぇーわんじーゆーじぇー)※連続する長さ2以上の部分文字列をアルファベット読みしてくれれば反応します

### 性別

男

### 職業

会社員

### 所属

あきはばらようちえん

### 興味のあること

* 並列計算
* 機械学習

### 主にやっていること

#### 将棋AI

* Deep Learning系の将棋AI ponkotsuを開発

#### オセロAI

* 遺伝的アルゴリズムを利用したオセロAI dekunobouを開発

#### 競技プログラミング

* アルゴリズム: [AtCoder緑(Highest 1092)](https://atcoder.jp/users/jj1guj)
* ヒューリスティック: [AtCoder水(Highest 1269)](https://atcoder.jp/users/jj1guj?contestType=heuristic)

### 主な実績

2019/08/03, 04: Maker Faire Tokyo2019出展 ([リンク](https://makezine.jp/event/makers-mft2019/m0244/))  
2020/03/08: AtCoder(Algorithm)緑  
2020/12/24: 映像情報メディア学会創立70周年記念大会で発表  
2021/05/03: 第31回世界コンピュータ将棋選手権47位(一次予選2勝6敗) ([アピール文書](https://www.apply.computer-shogi.org/wcsc31/appeal/ponkotsu/WCSC31_appeal.pdf))  
2021/09/12: AtCoder(Heuristic)緑  
2022/05/03: 第32回世界コンピュータ将棋選手権37位(一次予選4勝4敗) ([アピール文書](https://www.apply.computer-shogi.org/wcsc32/appeal/ponkotsu_/ponkotsu_wcsc32_appeal.pdf))  
2022/12/14: IDW'22 (International Display Week 2022)で発表  
2023/05/05: 第33回世界コンピュータ将棋選手権11位(一次予選6勝2敗, 二次予選5勝4敗) ([アピール文書](https://www.apply.computer-shogi.org/wcsc33/appeal/ponkotsu/ponkotsu_appeal.pdf))  
2024/05/05: 第34回世界コンピュータ将棋選手権13位(二次予選3勝2敗4分) ([アピール文書](https://www.apply.computer-shogi.org/wcsc34/appeal/ponkotsu/ponkotsu_appeal_2024.pdf))  
2025/05/05: 第35回世界コンピュータ将棋選手権10位(二次予選5勝4敗) ([アピール文書](https://www.apply.computer-shogi.org/wcsc35/appeal/ponkotsu/WCSC35appeal.pdf))  
2026/02/23: AtCoder(Heuristic)水  
2026/05/05: 第36回世界コンピュータ将棋選手権5位(二次予選6勝3敗, 決勝3勝4敗) ([詳細アピール文書](https://www.apply.computer-shogi.org/wcsc36/appeal/ponkotsu/ponkotsu_WCSC36_detail.pdf),   [詳細アピール文書補足資料](https://github.com/jj1guj/ponkotsu/tree/wcsc36/docs))

<section class="box features">
  <div><div class="row">
    {% for f in site.data.home_features %}
    <div class="col-3 col-6-medium col-12-small">
      <section class="box feature">
        <a href="{{ f.href }}" class="image featured"><img src="{{ f.image }}" alt="{{ f.title }}" /></a>
        <h3><a href="{{ f.href }}">{{ f.title }}</a></h3>
        <p>{{ f.body }}</p>
      </section>
    </div>
    {% endfor %}
  </div></div>
</section>
