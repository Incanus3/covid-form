import { APP_TYPE_COVID_TEST, APP_TYPE_VACCINATION } from './constants'

const config = {
  base_url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:9292',
  app_type: (
    process.env.REACT_APP_TYPE === 'vaccination' ? APP_TYPE_VACCINATION : APP_TYPE_COVID_TEST
  ),
};

export default config;
