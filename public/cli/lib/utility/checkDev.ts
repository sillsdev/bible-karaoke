export default async function checkDev(): Promise<boolean> {
  // Importing isDev causes an error running tests as we don't run in an
  // electron environment. Ava sets the NODE_ENV to 'test'.
  if (process.env.NODE_ENV === 'test') {
    return false;
  } else {
    const isDev = await import('electron-is-dev');
    return isDev.default;
  }
}
