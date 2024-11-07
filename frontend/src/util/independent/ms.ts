export class Ms {
  static second = (count = 1) => count * 1_000;   // X * 1000
  static minute = (count = 1) => count * 60_000;  // X * 1000 * 60
  static hour = (count = 1) => count * 3_600_000; // X * 1000 * 60 * 60
  static day = (count = 1) => count * 86_400_000; // X * 1000 * 60 * 60 * 24
}
