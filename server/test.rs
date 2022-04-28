// use std::convert::TryInto;

//import char todigit

// fn encode(int: i64) -> String {
//     if int == 0 {
//         return "0".to_string();
//     }

//     let mut res = String::new();
//     while int > 0 {
//         let c = int % 62;
//         res.push(match c {
//             0..=9 => '0' as i64 + c as i64,
//             10..=35 => 'a' as i64 + c as i64 - 10,
//             36..=61 => 'A' as i64 + c as i64 - 36,
//             _ => panic!("impossible")
//         });
//         int /= 62;
//     }
//     res
// }

// fn decode(str: &str) -> i64 {
//     let mut res = 0;
//     let mut length = str.len();
//     for (i, char) in str.chars().enumerate() {
//         let c = char as i64;
//         if c < 58 { // 0-9
//             res += c - 48;
//         } else if c < 91 { // A-Z
//             res += c - 29;
//         } else { // a-z
//             res += c - 87;
//         }
//         res *= 62;
//         length -= 1;
//         res += length as i64 * i64::pow(62, i.try_into().unwrap());
//     }
//     res
// }

fn main() {

    println!("{:?}", 'C' as u32 - '0' as u32);

    // println!("{:?}", encode(0));
    // println!("{:?}", encode(1024));
    // println!("{:?}", encode(123456789));
    // println!("{:?}", encode(1234567890123456789));
    // println!("{:?}", decode("0"));
    // println!("{:?}", decode("1"));
    // println!("{:?}", decode("S"));
    // println!("{:?}", decode("Sd"));
    // println!("{:?}", decode("Sda"));
    // println!("{:?}", decode("SdaA"));
    // println!("{:?}", decode("SdaAF"));
    // println!("{:?}", decode("SdaAFJ"));
    // println!("{:?}", decode("SdaAFJU"));
    // println!("{:?}", decode("SdaAFJU1"));
    // println!("{:?}", decode("SdaAFJU12"));
    // println!("{:?}", decode("SdaAFJU123"));
    // println!("{:?}", decode("SdaAFJU1234"));
    // println!("{:?}", decode("SdaAFJU12345"));
    // println!("{:?}", decode("SdaAFJU123456"));
    // println!("{:?}", decode("SdaAFJU1234567"));
    // println!("{:?}", decode("SdaAFJU12345678"));
    // println!("{:?}", decode("SdaAFJU123456789"));
    // println!("{:?}", decode("SdaAFJU123456789a"));
    // println!("{:?}", decode("SdaAFJU123456789ab"));
    // println!("{:?}", decode("SdaAFJU123456789abc"));
    // println!("{:?}", decode("SdaAFJU123456789abcd"));
    // println!("{:?}", decode("SdaAFJU123456789abcde"));
    // println!("{:?}", decode("SdaAFJU123456789abcdef"));
    // println!("{:?}", decode("SdaAFJU123456789abcdefg"));
    // println!("{:?}", decode("SdaAFJU123456789abcdefgh"));
    // println!("{:?}", decode("SdaAFJU123456789abcdefghi"));
    // println!("{:?}", decode("SdaAFJU123456789abcdefghij"));
}