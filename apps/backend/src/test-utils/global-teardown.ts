export async function teardown() {
  if (global.dbPool) {
    await global.dbPool.end();
  }
  await Promise.all(global.containers.map((container) => container.stop({ timeout: 10000 })));
}
