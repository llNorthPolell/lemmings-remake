export interface Position{
    x:number,
    y:number
}

export abstract class GameObject {
    protected position : Position;

    constructor(position : Position){
        this.position = position;
    }

    setPosition (position : Position){
        this.position = position;
    }

    getPosition () : Position{
        return this.position;
    }
}


