export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Free delivery unlocked',
    body: 'Your first order ships with ₦0 delivery today.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Price drop on rice',
    body: 'Basmati Rice is now ₦500 off at Market Square Ikoyi.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n3',
    title: 'Order delivered',
    body: 'Order #GS-88291 was delivered. Rate your rider.',
    time: 'Mon',
    read: true,
  },
];
