import { analyticsAPI } from './api';

class NotificationSystem {
  constructor() {
    this.permission = 'default';
    this.quotes = [
      "Your mind is a neural masterpiece. Trace its patterns today.",
      "Clarity begins with awareness. Take a moment to sync your thoughts.",
      "Emotional intelligence is the ultimate upgrade. Check your levels.",
      "Balance is not something you find, it's something you create.",
      "The frequency of your mind determines the rhythm of your life.",
      "A quiet mind is a powerful mind. Start a 2-minute breath session.",
      "Your neural records are waiting for your next insight."
    ];
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async scheduleDailyNotifications() {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    console.log('Daily neural sync notifications scheduled.');
    // In a real app, this would be handled by a Service Worker or a backend push service.
    // For this build, we'll simulate the triggers or use intervals if the app is open.
    
    // Example: Trigger one notification immediately for demo
    this.showNotification();
  }

  showNotification() {
    if (this.permission !== 'granted') return;

    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    
    new Notification('MindTrace AI+ Sync', {
      body: quote,
      icon: '/brain-icon.png', // Assuming there's an icon
      badge: '/badge-icon.png',
      tag: 'neural-sync'
    });
  }
}

export const notificationSystem = new NotificationSystem();
