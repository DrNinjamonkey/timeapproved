export class G964 {
  public static listSquared = (m: number, n: number) => {
    let output: any[] = [];

    for (let i = m; i <= n; i++) {
      let sum: number = 0;
      for (let j = 1; j <= i; j++) {
        if (i % j == 0) {
          sum += j * j;
        }
      }
      if (Math.sqrt(sum) % 1 == 0) output.push([i, sum]);
    }
    return output;
  };
}
console.log(G964.listSquared(1, 250));
