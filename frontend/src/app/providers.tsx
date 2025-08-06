'use client';

import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </Provider>
  );
}