import parse from './parser';

function example(argsStr) {
  console.log(parse(argsStr.split(' ')));
}

example('@lunar');
example('@lunar/music');
example('@this/music');
example('@lab play talamasca');
example('@lab/music');
example('@lab:7750');
example('@lab/music:7750');
example('@lab/music ^^^');
example('@192.168.0.10');
example('/music');

example('@50.50.50.50');
example('@50.50.50.50:5550');
example('@name.eth');
example('@name.com');
example('@lib.name.com');
example('@lib.name.com/books');
example('@lib.name.com/books ^^^^^');
example('@name.com/music');
example('@name.com/music:8870');

example('--catalog catalogPath term1 term2 term3');
example('--no-color term1 term2 term3');
example('--no-color term1 term2 term3 @media=music');
example('--no-color term1 @media=video term2 term3');
example('~term1 "a b c" term2');
example('term1 "d" ~term2');
example('~term1 "a b c" -term2');
example('~term1 -"a b c" -term2');
example('~term1 "a-b-c" -term2');

example('@lib.alexandria.com ~albert ~einstein -"paul dirac"');
