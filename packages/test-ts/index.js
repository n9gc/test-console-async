/**
 * 测试用的 TS 包
 * @license MIT
 * @author accurtype
 */
function hello(n) {
  const helloString = `hello, ${n}!`;
  console.log(helloString);
  return helloString;
}
export {
  hello as default
};
