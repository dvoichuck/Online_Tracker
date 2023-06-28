import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios, { AxiosInstance } from 'axios';

const getPlayersRoute = 'players/29?d=0';

interface IPlayers {
  id: number;
  name: string;
  group: string;
  team: number;
  skin: string;
  x: number;
  y: number;
  z: number;
}

let players: IPlayers[] = [];

@Injectable()
export class TasksService {
  private $api: AxiosInstance;

  constructor() {
    this.$api = axios.create({
      withCredentials: true,
      baseURL: 'https://map.minecraft-galaxy.ru/',
    });
    this.$api.interceptors.request.use();
  }
  @Cron('* * * * * *')
  async handleCron() {
    const { data } = await this.$api.get<{
      players: IPlayers[];
    }>(getPlayersRoute);
    const loginPlayers: IPlayers[] = [];
    const currentPlayers = data.players;

    currentPlayers.forEach((current_player) => {
      if (!players.filter(({ id }) => id === current_player.id).length) {
        players.push(current_player);
        loginPlayers.push(current_player);
      }
    });
    players = players.filter((player) => {
      return currentPlayers.filter(({ id }) => id === player.id).length;
    });
    if (loginPlayers.length) {
      if (loginPlayers.length === 1) {
        const player = data.players.find(({ id }) => id === loginPlayers[0].id);
        console.log('Цей хлопак зайшов: ' + player.name);
      } else {
        console.log(
          'Ці хлопаки зайшли: ' +
            loginPlayers
              .map(({ name }) => {
                return name;
              })
              .join(', '),
        );
      }
    }
  }
}
