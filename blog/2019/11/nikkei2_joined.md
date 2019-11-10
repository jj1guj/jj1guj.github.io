## 第2回全国統一プログラミング王決定戦予選参加記
[日経コン予選](https://atcoder.jp/contests/nikkei2019-2-qual)参加しました〜.  
コンテスト成績は[こちら](https://atcoder.jp/users/jj1guj/history/share/nikkei2019-2-qual)
まあ、爆死しました.  
A問題のみの1完でした.  
A問題は最初しらみつぶしにループかけて行けばいけるやろって思いながら実装している途中で2で割ればいいことに気づき、AC.  
Aを解き終わってからBを読んでみたらなんか「木」とかいうワードが出てきてちょっと嫌な予感がしたので他の問題をのぞきに行ったところどれも難しそうだったのですが、
その中でもDとEがいけそうな気がし、Eが[この前のABCで見たような問題(ABC143 D)](https://atcoder.jp/contests/abc143/tasks/abc143_d)と雰囲気が似ていたのでEを解いていくことに決めました.  
とりあえずC++だし速いからまぁなんとかなるやろってことで
<img src="https://latex.codecogs.com/png.latex?&&&space;c_i"/>
を決めて
<img src="https://latex.codecogs.com/png.latex?&&&space;a_i&space;\leq&space;b_i\leq&space;c_i" />
を満たす最大の
<img src="https://latex.codecogs.com/png.latex?&&&space;a_i"/>
を見つけていく方針で実装していくことにしました.  
最初はダメだったらダメで
<img src="https://latex.codecogs.com/png.latex?&&&space;a_i"/>
を見つけるところをにぶたんすればいいや〜って思ってたのですがその前に実装で時間がかかってしまいました…  
1時間半ほど頑張って実装し、やっとの思いで提出しましたが、案の定TLE吐かれ、さらに追い打ちでWAも吐かれて一気にやる気がなくなりました()  
