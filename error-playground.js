class CustomError extends Error {
  constructor(description) {
    super(description);
  }
}

class CustomError2 extends Error {
  constructor(description) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// console.log(new CustomError('error message'));
// console.log(new CustomError2('error message'));

err = new CustomError('error message')
err2 = new CustomError2('error message')

console.log(err.name);
console.log(err);
console.log(err2.name);
console.log(err2);