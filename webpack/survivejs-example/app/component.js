/*module.exports = function () {
  var element = document.createElement('h1');

  element.innerHTML = 'Hello Webpack';

  return element;
};*/

export default function () {
  var element = document.createElement('h1');

  element.innerHTML = 'Hello Webpack!';

  return element
}