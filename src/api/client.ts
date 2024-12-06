import axios from "axios";

export const baseURL = "http://192.168.1.14:8000";


const client = axios.create({ baseURL });

export default client;
