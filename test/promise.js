new Promise(resolve => {
  console.log('0.1');
  resolve();
  console.log('0.2');
})
  .then(() => {
    console.log(a);
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });
