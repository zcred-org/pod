/**
 * https://www.npmjs.com/package/npm-check-updates#options
 */
module.exports = {
  /**
   * Перезапись package.json обновленными версиями вместо простого вывода в консоль.
   */
  upgrade: true,
  /**
   * Выбор пакетов для обновления в интерактивном режиме.
   */
  interactive: true,
  /**
   * Группировать обновления по Major, Minor и Patch версиям.
   */
  format: 'group',
  /**
   * Игнорировать обновления определенных пакетов.
   */
  reject: [],
};
