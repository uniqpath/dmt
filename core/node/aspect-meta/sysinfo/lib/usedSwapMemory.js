import si from 'systeminformation';

export function usedSwapMemory() {
  return new Promise((success, reject) => {
    si.mem().then(({ swapused, swaptotal }) => {
      const usedSwapPerc = Math.round((100 * swapused) / swaptotal);
      success(usedSwapPerc);
    });
  });
}
