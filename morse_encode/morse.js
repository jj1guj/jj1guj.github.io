function alphabet_to_morse(){
    var toMorse={
        "a":".-",
        "b":"-...",
        "c":"-.-.",
        "d":"-..",
        "e":".",
        "f":"..-.",
        "g":"--.",
        "h":"....",
        "i":"..",
        "j":".---",
        "k":"-.-",
        "l":".-..",
        "m":"--",
        "n":"-.",
        "o":"---",
        "p":".--.",
        "q":"--.-",
        "r":".-.",
        "s":"...",
        "t":"-",
        "u":"..-",
        "v":"...-",
        "w":".--",
        "x":"-..-",
        "y":"-.--",
        "z":"--..",
        "0":"-----",
        "1":".----",
        "2":"..---",
        "3":"...--",
        "4":"....-",
        "5":".....",
        "6":"-....",
        "7":"--...",
        "8":"---..",
        "9":"----.",
        ".":".-.-.-",
        ",":"--..--",
        ":":"---...",
        "?":"..--..",
        "_":"..--.-",
        "+":".-.-.",
        "-":"-....-",
        "×":"-..-",
        "^":"......",
        "/":"-..-.",
        "@":".--.-.",
        "(":"-.--.",
        ")":"-.--.-",
        "\"":".-..-.",
        "'":".----.",
        "い":".-",
        "ろ":".-.-",
        "は":"-...",
        "に":"-.-.",
        "ほ":"-..",
        "へ":".",
        "と":"..-..",
        "ち":"..-.",
        "り":"--.",
        "ぬ":"....",
        "る":"-.-.",
        "を":".---",
        "わ":"-.-",
        "か":".-..",
        "よ":"--",
        "た":"-.",
        "れ":"---",
        "そ":"---.",
        "つ":".--.",
        "ね":"--.-",
        "な":".-.",
        "ら":"...",
        "む":"-",
        "う":"..-",
        "ヰ":".-..-",
        "の":"..--",
        "お":".-...",
        "く":"...-",
        "や":".--",
        "ま":"-..-",
        "け":"-.--",
        "ふ":"--..",
        "こ":"----",
        "え":"-.---",
        "て":".-.--",
        "あ":"--.-",
        "さ":"-.-.-",
        "き":"-.-..",
        "ゆ":"-..--",
        "め":"-...-",
        "み":"..-.-",
        "し":"--.-.",
        "ヱ":".--..",
        "ひ":"--..-",
        "も":"-..-.",
        "せ":".---.",
        "す":"---.-",
        "ん":".-.-.",
        "゛":"..",
        "゜":"..--.",
        "ー":".--.-",
        "、":".-.-.-",
        "」":".-.-..",
        "（":"-.--.-",
        "）":".-..-."
    };

    var toSeion={
        "が":"か゛",
        "ぎ":"き゛",
        "ぐ":"く゛",
        "げ":"け゛",
        "ご":"こ゛",
        "ざ":"さ゛",
        "じ":"し゛",
        "ず":"す゛",
        "ぜ":"せ゛",
        "ぞ":"そ゛",
        "だ":"た゛",
        "ぢ":"ち゛",
        "づ":"つ゛",
        "で":"て゛",
        "ど":"と゛",
        "ば":"は゛",
        "び":"ひ゛",
        "ぶ":"ふ゛",
        "べ":"へ゛",
        "ぼ":"ほ゛",
        "ぱ":"は゜",
        "ぴ":"ひ゜",
        "ぷ":"ふ゜",
        "ぺ":"へ゜",
        "ぽ":"ほ゜"
    };

    var toOmoji={
        "ぁ":"あ",
        "ぃ":"い",
        "ぅ":"う",
        "ぇ":"え",
        "ぉ":"お",
        "っ":"つ",
        "ゃ":"や",
        "ゅ":"ゆ",
        "ょ":"よ",
        "ゎ":"わ"
    };
    
    var str_in=document.getElementById("input_message").value;
    var str_out="";
    str_in=str_in.toLowerCase();
    for(i=0;i<str_in.length;i++){
        if(toMorse[str_in.substr(i,1)]){
            str_out+=toMorse[str_in.substr(i,1)]+" ";
        }else if(toSeion[str_in.substr(i,1)]){
            str_out+=toMorse[toSeion[str_in.substr(i,1)].substr(0,1)]+" "+
                    toMorse[toSeion[str_in.substr(i,1)].substr(1,1)]+" ";
        }else if(toOmoji[str_in.substr(i,1)]){
            str_out+=toMorse[toOmoji[str_in.substr(i,1)]]+" ";
        }else{
            str_out+=" ";
        }
    }
    document.getElementById("output_message").innerHTML=str_out;
}