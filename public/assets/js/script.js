var socketio = io.connect(location.host); //取得現在的url,適用於伺服器ip會變動的狀況

window.onload = function() {
    //監聽用的按鈕先隱藏

    //$(".download").hide();
    $(".download").prop("disabled", true);
    //$(".download2").hide();
    $(".download2").prop("disabled", true);
    //$(".start_tap").hide();
    $(".start_tap").prop("disabled", true);
    //$(".stop_tap").hide();
    $(".stop_tap").prop("disabled", true);
    $(".recognition1").prop("disabled", true);

    $(".start_tap").on("click", function() {
        $(this).prop('disabled', true);
        $(".stop_tap").prop('disabled', false);
        // $(".download").prop("disabled",true);
        // $(".download").hide();
        //send ip and port info.
        var val = [];
        //var that=this;
        $(".result").each(function() {
            if ($(this).prop("checked")) {
                //val = JSON.parse($(this).val());
                //id can't have dot character
                //console.log(val);
                val.push(JSON.parse($(this).val()));
                console.log(val[0]);
                //val=val+1;
            }

        });
        socketio.emit("tap_on", val);
    });

    $(".stop_tap").on("click", function() {
        $(this).prop('disabled', true);
        //setTimeout(function() {
        //$(".start_tap").show();
        //$(".download").prop('disabled', false);
        socketio.emit("tap_off", ["123.123.123.123", "1.1.1.1"]);
    });

    $(".recognition1").on("click", function(){
    	var recognition_value = document.getElementById("recognition1");
    	$(".recognition1").prop("disabled", true);
    	recognition_value.value = "辨識中...";
    	socketio.emit("play_audio");
    });
}


var btn_id = 0;

function add_checkbox(ip, port, id) {
    //    $(".chatlog").append('<label><input type="checkbox" class="result_button" id=id' + id + '>' + ip + ":" + port + '</label>');
    $(".chatlog").append('<label class="result"><input type="checkbox" class="result" id=id' + id + '>' + ip + ":" + port + '</label>');

    $(".chatlog").append('<div style="padding:3px;green;opacity:0.0;">');
    $("#id" + id).val(JSON.stringify({ "ip": ip, "port": port }));

    $('#id' + id).on("click", function get_checkbox_val() {
        //var btn_val = JSON.parse($(this).val());
        // console.log("get_checkbox_val(): " +btn_val);
        var count = $(".result:checked").length;
        console.log("check count : " + count);
        var val;
        if ($(this).prop("checked")) {
            //val = JSON.parse($(this).val());
            //id can't have dot character
            //console.log(val);
            val = JSON.parse($(this).val());
            console.log(val);
            //val=val+1;
        }
        if (count == 2) {
            $(".start_tap").prop('disabled', false);
        } else {
            //$(".start_tap").hide();
            $(".start_tap").prop('disabled', true);
        }
        //console.log("asdfa");
    });
    //$('#id' + id).prop("checked", true);

    var btn_val = JSON.parse($("#id" + id).val());
    //id can't have dot character
    console.log(btn_val);
    console.log("btn_id :" + btn_id);
    //console.log("123");
    return null;
}

socketio.on("message_to_client", function(data) {
    //document.getElementById("chatlog").innerHTML = (document.getElementById("chatlog").innerHTML + JSON.stringify(data['message']));

    for (var item in data) {
        for (var port in data[item]) {
            add_checkbox(item, data[item][port], btn_id);
            btn_id = btn_id + 1;
        }

    }
});

function sendMessage(IP, PORT_value) {
    socketio.emit("message_to_server", {
        IPmessage: IP,
        PORTmessage: PORT_value
    });
    btn_id = 0;
}

function start() {
	var ip_msg = document.getElementById("ip_input");
	var port_msg = document.getElementById("port1");

    //按鈕要讓它消失
    $(".download").prop("disabled", true);
    //$(".download").hide();

    document.getElementById("chatlog").innerHTML = "";

    sendMessage(ip_msg.value, port_msg.value);
}


socketio.on("ready_recognition", function(data) {
    //document.getElementById("chatlog").innerHTML = (document.getElementById("chatlog").innerHTML + JSON.stringify(data['message']));
    //$(".download").show();
    $(".download").prop("disabled", false);
    $(".recognition1").prop("disabled", false);
    $(".start_tap").prop("disabled", false);
});


var infoBox; // 訊息 label
var interm;  // 中間訊息
var textBox; // 最終的辨識訊息 text input
var startStopButton; // 「辨識/停止」按鈕
var final_transcript = ''; // 最終的辨識訊息的變數
var recognizing = false; // 是否辨識中
var langCombo;

function startButton(event){
	infoBox = document.getElementById("infoBox"); // 取得訊息控制項 infoBox
	interm = document.getElementById("interm");  // middle message
	textBox = document.getElementById("textBox"); // 取得最終的辨識訊息控制項 textBox
	startStopButton = document.getElementById("recognition1"); // 取得「辨識/停止」這個按鈕控制項
	langCombo = document.getElementById("langCombo"); // 取得「辨識語言」這個選擇控制項

	if (recognizing) { // 如果正在辨識，則停止。
		recognition.stop();
	} 

	else { // 否則就開始辨識
    	textBox.value = ''; // 清除最終的辨識訊息
    	final_transcript = ''; // 最終的辨識訊息變數
    	recognition.lang = langCombo.value; // 設定辨識語言
    	recognition.start(); // 開始辨識
	}
}

if (!('webkitSpeechRecognition' in window)) {  // 如果找不到 window.webkitSpeechRecognition 這個屬性
	// 就是不支援語音辨識，要求使用者更新瀏覽器。 
	infoBox.innerText = "This browser doesn't support speech recognition.";
} 

else {
	var recognition = new webkitSpeechRecognition(); // 建立語音辨識物件 webkitSpeechRecognition
	recognition.continuous = true; // 設定連續辨識模式
	recognition.interimResults = true; // 設定輸出中先結果。

	recognition.onstart = function() { // 開始辨識
		recognizing = true; // 設定為辨識中
		startStopButton.value = "辨識中..."; // 辨識中...按鈕改為「按此停止」。  
		infoBox.innerText = "";  // 顯示訊息為「可以開始說話了」...
	};
}

recognition.onend = function() { // 辨識完成
	recognizing = false; // 設定為「非辨識中」
	startStopButton.value = "辨識完畢";  // 辨識完成...按鈕改為「我要說話」。
	infoBox.innerText = ""; // 不顯示訊息

	//Send the content to server
	socketio.emit("savefile", {
		content: linebreak(final_transcript)
	});	

	if (window.getSelection) {
		window.getSelection().removeAllRanges();
		var range = document.createRange();
		range.selectNode(document.getElementById('textBox'));
		window.getSelection().addRange(range);
	}
};

recognition.onresult = function(event) { // 辨識有任何結果時
	var interim_transcript = ''; // 中間結果

	for (var i = event.resultIndex; i < event.results.length; ++i) {
		if (event.results[i].isFinal) { // If this is the final message
			final_transcript += event.results[i][0].transcript;
		} else {
			interim_transcript += event.results[i][0].transcript;
		}
	}

	final_transcript = capitalize(final_transcript); // toUpper...
	textBox.innerHTML = linebreak(final_transcript);
	interm.innerHTML = linebreak(interim_transcript);

    if (final_transcript || interim_transcript) {
		showButtons('inline-block');
	}

	/*if (final_transcript.trim().length > 0) // 如果有最終辨識文字
		textBox.value = final_transcript; // 顯示最終辨識文字*/
};

/*------------------Just handle the string.-------------------*/
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
	return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
var current_style;
function showButtons(style) {
	if (style == current_style) {
		return;
	}
	current_style = style;
}
/*------------------------------------------------------------*/


socketio.on("ok_recognition", function(data){
	var recognition_value = document.getElementById("recognition1");
    //$(".recognition1").prop("disabled", false);
    recognition_value.value = "辨識完畢";

    $(".download2").prop('disabled', false);

    recognition.stop();
});
