import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: 'Qu1ck',
  logoUrl: 'https://ucarecdn.com/c413e4eb-b635-4912-b0f6-624a2e840fb9/logo.png',
  logoForm: 'https://ucarecdn.com/39c3cb28-b950-431f-bcfe-1052653b0922/DeliveryBackpackMockup.jpg',
  url: env.appUrl,
};

export default app;
