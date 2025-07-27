import { Icons } from '../Icons';

export const menuItems = [
  {
    label: 'Create Channel',
    icon: Icons.Call,
    onClick: () => console.log('Create Channel'),
  },
  {
    label: 'Server Settings',
    icon: Icons.Setting2,
    onClick: () => console.log('Server Settings'),
  },
  {
    label: 'Leave Server',
    icon: Icons.CallRemove,
    onClick: () => console.log('Leave Server'),
  },
];
