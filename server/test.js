const Hashids = require('hashids/cjs')
const hashids = new Hashids('afioajfwi@,@oabygf5f5^(@^XxCodeCaninexX002je12u82joijofePPUwjroiq')

var benchmark = require('benchmark')
let suite = new benchmark.Suite()
const { nanoid } = require('nanoid')
const cookieParser = require('cookie-parser')
const { hash } = require('bcrypt')

//check to make sure id is not huge!

function base62_encode (s)
{
  // the result/encoded string, the padding string, and the pad count
  // var base62chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  var base62chars = 'CFMawHAsZqlOGbUejzrRWdoStiVPLpkQyDvBIhgxmJNEfcnYKuTX_-'
  var r = "";
  var p = ""; 
  var c = s.length % 3;

  // add a right zero pad to make this string a multiple of 3 characters
  if (c > 0) {
    for (; c < 3; c++) { 
      p += '='; 
      s += "\0"; 
    } 
  }

  // increment over the length of the string, three characters at a time
  for (c = 0; c < s.length; c += 3) {

    // we add newlines after every 76 output characters, according to the MIME specs
    if (c > 0 && (c / 3 * 4) % 76 == 0) { 
      r += "\r\n"; 
    }

    // these three 8-bit (ASCII) characters become one 24-bit number
    var n = (s.charCodeAt(c) << 16) + (s.charCodeAt(c+1) << 8) + s.charCodeAt(c+2);

    // this 24-bit number gets separated into four 6-bit numbers
    n = [(n >>> 18) & 62, (n >>> 12) & 62, (n >>> 6) & 62, n & 62];

    // those four 6-bit numbers are used as indices into the base62 character list
    r += base62chars[n[0]] + base62chars[n[1]] + base62chars[n[2]] + base62chars[n[3]];
  }
   // add the actual padding string, after removing the zero pad
  return r.substring(0, r.length - p.length) + p;
}

function base62_decode (s)
{
  var base62chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  // remove/ignore any characters not in the base62 characters list
  //  or the pad character -- particularly newlines
  s = s.replace(new RegExp('[^'+base62chars.split("")+'=]', 'g'), "");

  // replace any incoming padding with a zero pad (the 'A' character is zero)
  var p = (s.charAt(s.length-1) == '=' ? 
          (s.charAt(s.length-2) == '=' ? 'AA' : 'A') : ""); 
  var r = ""; 
  s = s.substr(0, s.length - p.length) + p;

  var base62inv = {}; 
  for (var i = 0; i < base62chars.length; i++) 
  { 
    base62inv[base62chars[i]] = i; 
  }

  // increment over the length of this encoded string, four characters at a time
  for (var c = 0; c < s.length; c += 4) {

    // each of these four characters represents a 6-bit index in the base62 characters list
    //  which, when concatenated, will give the 24-bit number for the original 3 characters
    var n = (base62inv[s.charAt(c)] << 18) + (base62inv[s.charAt(c+1)] << 12) +
            (base62inv[s.charAt(c+2)] << 6) + base62inv[s.charAt(c+3)];

    // split the 24-bit number into the original three 8-bit (ASCII) characters
    r += String.fromCharCode((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  }
   // remove any zero pad that was added to make this a multiple of 24 bits
  return r.substring(0, r.length - p.length);
}


//     function Shuffle(string toShuffle, int key)
//     {
//         int size = toShuffle.Length;
//         char[] chars = toShuffle.ToArray();
//         var exchanges = GetShuffleExchanges(size, key);
//         for (int i = size - 1; i > 0; i--)
//         {
//             int n = exchanges[size - 1 - i];
//             char tmp = chars[i];
//             chars[i] = chars[n];
//             chars[n] = tmp;
//         }
//         return new string(chars);
//     }

//     public static string DeShuffle(this string shuffled, int key)
//     {
//         int size = shuffled.Length;
//         char[] chars = shuffled.ToArray();
//         var exchanges = GetShuffleExchanges(size, key);
//         for (int i = 1; i < size; i++)
//         {
//             int n = exchanges[size - i - 1];
//             char tmp = chars[i];
//             chars[i] = chars[n];
//             chars[n] = tmp;
//         }
//         return new string(chars);
//     }
// }

Base62 = {

  _Rixits :
  "Rsgwfd2ZCNF8PnIGQHWLc7Er13UtoYm0iuMjkxzB6VAeKOqX9p4ybaDJ5lSvhT", //[A-Z] and [a-z] and [0-9] and -

  fromNumber : function(number) {
    var final = [];
    for (let i = 0; i < number.length; i++) {
      if (isNaN(Number(number[i])) || number[i] === null ||
          number[i] === Number.POSITIVE_INFINITY)
          throw "The input is not valid";
      if (number[i] < 0)
          throw "Can't represent negative numbers now";

      var rixit; // like 'digit', only in some non-decimal radix 
      var residual = Math.floor(number[i]);
      var result = '';
      while (residual != 0) {
          rixit = residual % 62
          result = this._Rixits.charAt(rixit) + result;
          residual = Math.floor(residual / 62);
        }
          final.push(result)
        }
        final = final[0].toString() + "-" + final[1].toString();
      return final;
  },

  toNumber : function(rixits) {
    if(rixits) {
      if(rixits.length >= 15) { //make this num bigger when db rows gets large
        throw "input is not valid";
      }
      if((rixits.match(/-/g) || []).length == 0 || (rixits.match(/-/g) || []).length <= 3) {
        throw "too many -";
      }

      var result = 0;
      var final = [];
      rixits = rixits.split('-');
      for (let i = 0; i < rixits.length; i++) {
        for (var e = 0; e < rixits[i].length; e++) {
            result = (result * 62) + this._Rixits.indexOf(rixits[i][e]);
        }
        final.push(result)
        result = 0;
      }
      return final;
    }
  }
}

var test = Base62.fromNumber([2, 1]) //encode
var test2 = Base62.toNumber("-_") //decode
console.log(test)
console.log(test2)

// console.log(hashids.encode([5, 20]))
// console.log(hashids.decode([10, 20]))


// console.log(Base62.toNumber(test)) //decode

// suite
// .add('enid v2', () => {
//   Base62.fromNumber(12089832)
//   // Base62.fromNumber(1000000000)
//   Base62.fromNumber(133)
// })
// .add('deid v2', () => {
//   Base62.toNumber('k7de')
//   Base62.toNumber('25')
// })
// .on('cycle', function(event) {
//     console.log(String(event.target));
// })
// .run()





// var encoded = hashids.encode([4, 1208838])
// console.log(encoded)
// var decoded = hashids.decode("8EFkyJV")
// console.log(decoded)

//how do you save a favorite if we were to change the hashids?
//I know! save in the users fields as two seperate pieces. One for the shard
//the second for the id to find.

//how do we search things FRMO DIFFERENT TABLES????
//soliution is on stackoverflow

// console.log(toHex(2))