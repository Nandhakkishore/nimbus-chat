const os = require('os');
const fs = require('fs');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal) {
        if (!alias.address.startsWith('127.') && !alias.address.startsWith('169.254.')) {
          return alias.address;
        }
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
if (fs.existsSync('.env')) {
  fs.unlinkSync('.env');
}
fs.writeFileSync('.env.local', `REACT_NATIVE_PACKAGER_HOSTNAME=${localIp}\n`);
console.log(`\n📡 [Nimbus Chat Mobile] Configured for LAN IP: ${localIp}`);
console.log(`📱 Connect your mobile phone to the same Wi-Fi and scan the QR code below.\n`);
