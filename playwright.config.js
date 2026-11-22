// Тесты гоняют index.html (с css/ и js/) напрямую через file://, без сервера.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 120000,
  // один повтор: тесты тренера (часы Web Audio) и перезагрузки с localStorage на file:// изредка сбоят под нагрузкой.
  // Настоящая ошибка падает и на повторе; прошедший со второго раза тест отчёт помечает как flaky.
  retries: 1,
  reporter: 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
