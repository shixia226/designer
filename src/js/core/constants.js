(function (UI) {
	var KEY_MINUS = null, KEY_PLUS = null;
	if (UI.isFirefox) {
		KEY_MINUS = 173;
		KEY_PLUS = 61;
	} else {
		KEY_MINUS = 189;
		KEY_PLUS = 187;
	}
	UI.extend(UI, {
		KEY_BACKSPACE: 8,
		KEY_TAB: 9,
		KEY_ENTER: 13,
		KEY_SHIFT: 16,
		KEY_CTRL: 17,
		KEY_ALT: 18,
		KEY_ESC: 27,
		KEY_PAGE_UP: 33,
		KEY_PAGE_DOWN: 34,
		KEY_END: 35,
		KEY_HOME: 36,
		KEY_LEFT: 37,
		KEY_UP: 38,
		KEY_RIGHT: 39,
		KEY_DOWN: 40,
		KEY_INSERT: 45,
		KEY_DELETE: 46,
		KEY_CHINESE: 229,

		KEY_F1: 112,
		KEY_F2: 113,
		KEY_F3: 114,
		KEY_F4: 115,
		KEY_F5: 116,
		KEY_F6: 117,
		KEY_F7: 118,
		KEY_F8: 119,
		KEY_F9: 120,
		KEY_F10: 121,
		KEY_F11: 122,
		KEY_F12: 123,

		KEY_MINUS: KEY_MINUS,
		KEY_PLUS: KEY_PLUS,
		KEY_DOT: 190,

		/*数字键*/
		KEY_0: 48,
		KEY_1: 49,
		KEY_2: 50,
		KEY_3: 51,
		KEY_4: 52,
		KEY_5: 53,
		KEY_6: 54,
		KEY_7: 55,
		KEY_8: 56,
		KEY_9: 57,

		/*小键盘数字键*/
		KEY_NUM_0: 96,
		KEY_NUM_1: 97,
		KEY_NUM_2: 98,
		KEY_NUM_3: 99,
		KEY_NUM_4: 100,
		KEY_NUM_5: 101,
		KEY_NUM_6: 102,
		KEY_NUM_7: 103,
		KEY_NUM_8: 104,
		KEY_NUM_9: 105,

		/*小键盘加减乘除键*/
		KEY_NUM_MULTIPLY: 106,
		KEY_NUM_PLUS: 107,
		KEY_NUM_ENTER: 108,
		KEY_NUM_MINUS: 109,
		KEY_NUM_DOT: 110,
		KEY_NUM_DIVIDE: 111,

		KEY_A: 65,
		KEY_B: 66,
		KEY_C: 67,
		KEY_D: 68,
		KEY_E: 69,
		KEY_F: 70,
		KEY_G: 71,
		KEY_H: 72,
		KEY_I: 73,
		KEY_J: 74,
		KEY_K: 75,
		KEY_L: 76,
		KEY_M: 77,
		KEY_N: 78,
		KEY_O: 79,
		KEY_P: 80,
		KEY_Q: 81,
		KEY_R: 82,
		KEY_S: 83,
		KEY_T: 84,
		KEY_U: 85,
		KEY_V: 86,
		KEY_W: 87,
		KEY_X: 88,
		KEY_Y: 89,
		KEY_Z: 90,

		/*鼠标按键值*/
		MOUSE_LEFT: 1,
		MOUSE_CENTER: 2,
		MOUSE_RIGHT: 3,

		DIRECTION_UP: 0,
		DIRECTION_RIGHT: 1,
		DIRECTION_BOTTOM: 2,
		DIRECTION_LEFT: 3,

		/*特殊字符*/
		CHAR_ENSP: "&#8194",    //半方大的空白
		CHAR_EMSP: "&#8195",    //全方大的空白
		CHAR_NBSP: "&#160",     //不断行的空白
		CHAR_LT: "&#60",        //小于号
		CHAR_GT: "&#62",        //大于号
		CHAR_AMP: "&#38",       //&符号
		CHAR_APOS: "&#39",      //单引号
		CHAR_QUOT: "&#34",      //双引号
		CHAR_COPY: "&#169",     //版权符号
		CHAR_REG: "&#174",      //注册商标
		CHAR_TIMES: "&#215",    //乘号
		CHAR_DIVIDE: "&#247",    //除号

		/*判断方法*/
		isKeyControl: function (keyCode, ctrlKey) {
			return keyCode === UI.KEY_BACKSPACE ||
				keyCode === UI.KEY_DELETE ||
				keyCode === UI.KEY_TAB ||
				keyCode === UI.KEY_HOME ||
				keyCode === UI.KEY_END ||
				(keyCode >= UI.KEY_LEFT && keyCode <= UI.KEY_DOWN) ||
				(keyCode >= UI.KEY_F1 && keyCode <= UI.KEY_F12) ||
				ctrlKey && (keyCode === UI.KEY_A || keyCode === UI.KEY_C);
		},
		isKeyNumber: function (keyCode, shiftKey) {
			return !shiftKey && keyCode >= UI.KEY_0 && keyCode <= UI.KEY_9 ||
				keyCode >= UI.KEY_NUM_0 && keyCode <= UI.KEY_NUM_9;
		}
	});
})(EUI);