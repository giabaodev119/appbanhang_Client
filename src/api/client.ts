import axios from "axios";

export const baseURL = "http://10.0.118.28:8000";

const client = axios.create({ baseURL });

export default client;
