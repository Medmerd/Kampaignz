import { contextBridge, ipcRenderer } from 'electron';

type Campaign = {
  id: number;
  name: string;
  created_at: string;
};

const api = {
  createCampaign: (name: string) =>
    ipcRenderer.invoke('campaigns:create', name) as Promise<Campaign>,
  listCampaigns: () => ipcRenderer.invoke('campaigns:list') as Promise<Campaign[]>,
  getCampaign: (id: number) =>
    ipcRenderer.invoke('campaigns:get', id) as Promise<Campaign>,
  updateCampaignName: (id: number, name: string) =>
    ipcRenderer.invoke('campaigns:updateName', id, name) as Promise<Campaign>,
};

contextBridge.exposeInMainWorld('api', api);

export type KampaignzApi = typeof api;
