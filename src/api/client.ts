import axios from "axios";

export const baseURL = "http://172.20.10.3:8000";

const client = axios.create({ baseURL });

export default client;
