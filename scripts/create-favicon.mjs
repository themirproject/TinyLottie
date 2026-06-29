import sharp from 'sharp';

async function run() {
  try {
    await sharp('tinylottie.png')
      .resize(32, 32)
      .toFormat('png')
      .toFile('public/favicon.ico');
    console.log('Favicon created successfully in public/favicon.ico');
  } catch (err) {
    console.error('Error generating favicon:', err);
  }
}

run();
