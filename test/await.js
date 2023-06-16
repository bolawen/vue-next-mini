async function x() {
  console.log(1);
  //   await {
  //     then(cb) {
  //       cb(2);
  //     }
  //   };
  await new Promise(resolve => {
    resolve(2);
  });
  console.log(3);
}

x();

new Promise(resolve => {
  console.log(4);
  resolve();
  console.log(5);
})
  .then(() => {
    console.log(6);
  })
  .then(() => {
    console.log(7);
  })
  .then(() => {
    console.log(8);
  })
  .then(() => {
    console.log(9);
  });

/**
 * @description: 执行过程
 */
