export default class Button extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Rectangle;
    name:string;
    display: Phaser.GameObjects.Text;

    constructor(
        context: any, 
        name: string, 
        display: string,
        position: {x:number,y:number},
        width : number,
        height: number,
        bgcolor: number,
        onPointerDown?: ()=>void,
        onPointerUp?: ()=>void,
        onPointerHover?: ()=>void,
        onPointerExit? : ()=>void){
    
        super(context.scene,position.x,position.y);
        this.name=name;
        this.bg = context.scene.add.rectangle(
            0,
            0,
            width,
            height,
            bgcolor
        ).setOrigin(0);

        this.display = context.scene.add.text(
            0,
            0,
            display
        );

        this.add(this.bg);
        this.add(this.display);

        this.setInteractive(new Phaser.Geom.Rectangle(0,0,width,height),Phaser.Geom.Rectangle.Contains)
            .on(
                Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
                ()=>{if(onPointerDown)onPointerDown()}
                
            )
            .on(
                Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
                ()=>{if(onPointerUp)onPointerUp()}
            )
            .on(
                Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
                ()=>{if(onPointerHover)onPointerHover()}
            )
            .on(
                Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
                ()=>{if(onPointerExit)onPointerExit()}
            );
        
    }
}