// Page script for device_created.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const devId = parseInt(urlParams.get('id')) || dbData.currentUser.devices[0]?.id;
      const device = dbData.currentUser.devices.find(d => d.id === devId) || dbData.currentUser.devices[0];

      if (device) {
        document.getElementById('device-title').textContent = `Set up "${device.device_name}"`;
        document.getElementById('wg-config').value = `[Interface]\nPrivateKey = MOCK_KEY_${device.id}==\nAddress = ${device.wg_address}\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = MOCK_SERVER_KEY==\nEndpoint = vpn.company.com:51820\nAllowedIPs = 10.10.10.0/24`;
      }

      document.getElementById('copy-btn').addEventListener('click', () => {
        const text = document.getElementById('wg-config').value;
        navigator.clipboard.writeText(text);
        document.getElementById('copy-text').textContent = 'Copied!';
        setTimeout(() => { document.getElementById('copy-text').textContent = 'Copy config'; }, 2000);
      });

      document.getElementById('launcher-card').hidden = !(device && device.launcher_available);

      if (device) document.getElementById('launcher-btn').href = `launcher.cmd?id=${device.id}`; // Flask: url_for('device_launcher_cmd', device_id=device.id)

      if (window.lucide) window.lucide.createIcons();
    });
  
