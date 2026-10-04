// Page script for add_device.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam , guardedSubmit } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) window.lucide.createIcons();

      guardedSubmit(document.getElementById('add-device-form'), (e) => {
        e.preventDefault();
        const deviceName = document.getElementById('device-name').value;
        const newId = Date.now();
        
        dbData.currentUser.devices.push({
          id: newId,
          user_id: dbData.currentUser.id,
          device_name: deviceName,
          created_at: new Date().toISOString(),
          wg_uuid: `wg-peer-${Math.random().toString(36).substring(2, 10)}`,
          wg_api_name: deviceName.toLowerCase().replace(/\s+/g, '_'),
          wg_address: `10.10.10.${Math.floor(Math.random() * 200 + 20)}/32`,
          revoked_at: null,
          auto_revoked: false,
          launcher_token: null,
          launcher_script: null,
          launcher_token_expires_at: null,
          is_revoked: false,
          launcher_available: true
        });

        window.location.href = `device_created.html?id=${newId}`;
      });
    });
  
