import axios from 'axios';
import { COUNTRY_HOST } from '../configs/constants';

const clientInstance = axios.create({
  baseURL: COUNTRY_HOST
});

clientInstance.interceptors.response.use(response => {
  //   store.dispatch(clientLoaded());
  return response.data;
});

export default clientInstance;
