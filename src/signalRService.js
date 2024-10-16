import * as signalR from '@microsoft/signalr';
import { server_port } from './Constants.ts';

const connection = new signalR.HubConnectionBuilder()
    .withUrl(server_port)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

export default connection;