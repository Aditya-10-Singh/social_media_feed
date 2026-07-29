// Web Push API Integration with VAPID configuration
import webpush from 'web-push';

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BCxV5P8mO-Ww1Xk79-VapidPublicMockKeyForPulseSocialWebPush',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'MockPrivateKeyForPulseSocial'
};

try {
  webpush.setVapidDetails(
    'mailto:support@pulsesocial.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (err) {
  console.log('WebPush VAPID initialized in mock mode');
}

export const sendPushNotification = async (subscription, payload) => {
  if (!subscription || !subscription.endpoint) return false;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Push notification delivery error:', error.message);
    return false;
  }
};

export const getVapidPublicKey = () => vapidKeys.publicKey;
