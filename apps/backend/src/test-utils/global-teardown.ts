export async function teardown() {
  await Promise.all(global.containers.map((container) => container.stop({ timeout: 10000 })));
}
