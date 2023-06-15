// function Point(x, y) {
//   this.x = x;
//   this.y = y;
// }

// Point.prototype.getX = function () {
//   return this.x;
// };
// Point.prototype.setX = function (value) {
//   this.x = value;
// };
// Point.prototype.toString = function () {
//   return `(${this.x},${this.y})`;
// };

// const point = new Point(10, 10);
// console.log(point.toString());
// point.setX(20);
// console.log(point.getX());

// function Point(name) {
//   console.log(new.target);
// }

// Point(); // undefined

// const point = new Point(); // Point

class Point {
  constructor() {
    if (new.target === Point) {
      throw new Error('本类不能实例化');
    }
  }
}

class ThreePoint extends Point {
  constructor() {
    super();
  }
}

// const point = new Point();
const threePoint = new ThreePoint();

// function Point() {
//   if (new.target !== Point) {
//     console.log('必须通过 new 调用');
//     return;
//   }
//   console.log('new 调用之后');
// }

// Point(); // 必须通过 new 调用
// const point = new Point(); // new 调用之后
