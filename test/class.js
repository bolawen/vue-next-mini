function x() {
  console.log(0);
  return new Promise(resolve => {
    console.log(1);
    resolve(2);
    console.log(3);
  });
}

async function y() {
  console.log(4);
  const result = await x();
  console.log(result);
  // return 5;
  // return new Promise(resolve => {
  //   resolve(5);
  // });
  return {
    then(cb) {
      cb(5);
    }
  };
}

y()
  .then(res => {
    console.log(res);
  })
  .then(() => {
    console.log(13);
  })
  .catch(error => {
    console.log(error);
  });

new Promise(resolve => {
  console.log(6);
  resolve();
  console.log(8);
})
  .then(() => {
    console.log(9);
  })
  .then(() => {
    console.log(10);
  })
  .then(() => {
    console.log(11);
  })
  .then(() => {
    console.log(12);
  });

/**
 * @description: 执行过程
 * macrosTack[]  microTask[]
 * 1. 同步执行 y
 * 2. 执行 console.log(4); , 输出 4
 * 3. 同步执行 const result = await x();
 * 4. 进入 x
 * 5. 同步执行 console.log(0);, 输出 0
 * 6. 同步执行 return new Promise
 * 7. 同步执行 console.log(1); , 输出 1
 * 8. 同步执行 resolve(2); ，将 y() 函数内部 await 之后的代码作为一个微任务加入 microTask 队列。 此时 microTask = [(console.log(result); return thenable;)]
 * 9. 同步执行 console.log(3); , 输出 3
 * 10. 同步执行 new Promise
 * 11. 同步执行 console.log(6); , 输出 6
 * 12. 同步执行 resolve(); 将第一个 .then 加入到 microTask 队列。 此时 microTask = [(console.log(result); return thenable;), console.log(9);]
 * 13. 同步执行 console.log(8); ， 输出 8
 * 14. 开始清空 microTask 队列
 * 15. 执行 console.log(result), 输出 2
 * 16. 执行 return thenable;, 将 y 的第一个 .then() 回调加入空一个加入到 microTask 队列。 此时  microTask = [console.log(9);, 空一个 , console.log(res);]
 * 17. 执行 console.log(9)， 输出 9。将 new Promise 的第二个 .then 加入到 microTask 队列。 此时 microTask = [console.log(10);, console.log(res);]
 * 18. 执行 console.log(10), 输出 10。 将 new Promise 的第三个 .then 加入到 microTask 队列. 此时  microTask = [console.log(res);,console.log(11);]
 * 19. 执行 console.log(res);, 输出 5 , 将 y 的第二个 .then 加入到 microTask 队列。 此时, microTask = [console.log(11);,console.log(13);]
 * 20. 执行 console.log(11);, 输出 11 , 将 new Promise 的第四个 .then 加入到 microTask 队列。 此时 microTask = [console.log(13);,console.log(12);]
 * 因此，最终结果为: 4 0 1 3 6 8 2 9 10 5 11 13 12
 */
