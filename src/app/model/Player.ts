export class Player {
  private static idGenerator = 0;
  name: string = 'Unnamed'
  history: number[] = []
  dealer: boolean = false
  id?: number = Player.idGenerator++;

}
