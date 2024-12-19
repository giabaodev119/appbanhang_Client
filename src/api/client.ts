import axios from "axios";


export const baseURL = "http://172.20.10.2:8000";

const client = axios.create({ baseURL });

export default client;
