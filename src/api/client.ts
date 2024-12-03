import axios from "axios";

export const baseURL = "http://10.0.133.157:8000";

const client = axios.create({ baseURL });

export default client;
