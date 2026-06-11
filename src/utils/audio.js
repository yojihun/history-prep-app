// Simple MD5 hash implementation in pure JS (since Node's crypto isn't available in browser)
export function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a cheerful "ding-dong" chime for correct answers
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Play a low buzzer "di-di" sound for incorrect answers
export function playIncorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(130, now + 0.15);
    gain2.gain.setValueAtTime(0.1, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.27);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.27);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Play pre-generated static TTS audio using MD5 mapping
let currentAudio = null;

export function playStaticTTS(text) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  const textHash = md5(text);
  const audioUrl = `/audio/${textHash}.mp3`;
  
  const audio = new Audio(audioUrl);
  currentAudio = audio;
  audio.play().catch(err => {
    console.warn("Could not play static TTS file:", audioUrl, err);
  });
}

export function stopStaticTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// Play a rising synth arpeggio when XP goes up
export function playXpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Fast rising pentatonic scale
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
    
    scale.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      
      gain.gain.setValueAtTime(0.0, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.15);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Play a loud celebratory level-up fanfare
export function playLevelUpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // We play a grand ascending arpeggio with fat sawtooth oscillators
    const notes = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Ascending C major notes
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0.0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.6);
    });

    // Sustained high triumphant chord at the end
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.8);
      // add minor vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 6; // 6Hz
      lfoGain.gain.value = 4; // 4Hz detune
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.0, now + 0.8);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      lfo.start(now + 0.8);
      osc.start(now + 0.8);
      osc.stop(now + 2.2);
      lfo.stop(now + 2.2);
    });

  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Play a bright magical sparkling sound for earning gems
export function playGemSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play multiple quick high-pitched notes
    const notes = [880.00, 1046.50, 1318.51, 1567.98, 2093.00]; // A5, C6, E6, G6, C7
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);
      
      gain.gain.setValueAtTime(0.0, now + index * 0.04);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 0.25);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Alias playGemRewardSound to playGemSound for convenience
export function playGemRewardSound() {
  playGemSound();
}

// Play a triumphant milestone/museum unlock fanfare
export function playMilestoneFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Imperial/Royal brass fanfare (C-G-C-E-G progression with twin voice/detuning)
    const notes = [
      { f: 261.63, t: 0.0 }, // C4
      { f: 392.00, t: 0.15 }, // G4
      { f: 523.25, t: 0.3 }, // C5
      { f: 659.25, t: 0.45 }, // E5
      { f: 783.99, t: 0.6 }  // G5
    ];
    
    notes.forEach((item) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(item.f, now + item.t);
      osc2.frequency.setValueAtTime(item.f * 1.005, now + item.t); // slightly detuned for chorus effect
      
      gain.gain.setValueAtTime(0.0, now + item.t);
      gain.gain.linearRampToValueAtTime(0.12, now + item.t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + 1.2);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now + item.t);
      osc2.start(now + item.t);
      osc1.stop(now + item.t + 1.2);
      osc2.stop(now + item.t + 1.2);
    });
    
    // Loud final chord
    const finalChord = [523.25, 783.99, 1046.50]; // C5, G5, C6
    finalChord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.75);
      
      gain.gain.setValueAtTime(0.0, now + 0.75);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.85);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + 0.75);
      osc.stop(now + 2.0);
    });
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Play a friendly pop chime sound when a mascot speech bubble opens
export function playMascotNotifySound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Mascot ElevenLabs API Integration
import { MASCOT_LINES } from '../data/mascotFeedback';

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY || "563bad9473bc83070dd087ae30070acef956c37af7ea667d2b38466bd7852011";

// ElevenLabs Voice IDs (Verified available in user account)
const VOICE_IDS = {
  einstein: "nPczCjzI2devNBz1zQrb", // Brian (Deep, Resonant, Comforting)
  curie: "hpp4J3VqNfWAUOO0d1Us", // Bella (Professional, Bright, Warm)
  galileo: "pqHfZKP75CvOlQylNhV4" // Bill (Wise, Mature, Balanced)
};

let elevenAudio = null;

export async function playMascotSpeech(lineId) {
  // Stop any playing static TTS or mascot speech
  stopStaticTTS();
  if (elevenAudio) {
    elevenAudio.pause();
    elevenAudio = null;
  }

  // Find the text for this lineId in MASCOT_LINES
  let text = "";
  const parts = lineId.split('_');
  const mascotKey = parts[0]; // 'einstein', 'curie', 'galileo'
  const actionChar = parts[1] ? parts[1][0] : ''; // 's', 'f', 'h'
  const category = actionChar === 's' ? 'success' : (actionChar === 'f' ? 'fail' : 'hint');

  if (MASCOT_LINES[mascotKey] && MASCOT_LINES[mascotKey][category]) {
    const found = MASCOT_LINES[mascotKey][category].find(item => item.id === lineId);
    if (found) {
      text = found.text;
    }
  }

  if (!text) return;

  // Try ElevenLabs API
  try {
    const voiceId = VOICE_IDS[mascotKey] || VOICE_IDS.einstein;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs status: ${response.status} - ${JSON.stringify(errBody)}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    elevenAudio = audio;
    await audio.play();
    return;
  } catch (error) {
    console.warn("ElevenLabs TTS failed, falling back to Web Speech API:", error);
  }

  // Fallback 1: Speak using Web Speech API in English if available
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      // Custom voice profiling based on character
      if (mascotKey === 'einstein') {
        utterance.pitch = 0.85;
        utterance.rate = 0.9;
      } else if (mascotKey === 'curie') {
        utterance.pitch = 1.1;
        utterance.rate = 0.95;
      } else if (mascotKey === 'galileo') {
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }
      
      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn("SpeechSynthesis failed, falling back to audio file:", e);
    }
  }

  // Fallback 2: Fallback to local pre-recorded audio file
  const audioUrl = `/audio/${lineId}.mp3`;
  const audio = new Audio(audioUrl);
  elevenAudio = audio;
  
  audio.play().catch(error => {
    console.error("Failed to play mascot speech offline audio:", audioUrl, error);
  });
}




