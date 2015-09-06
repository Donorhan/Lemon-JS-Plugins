var GraphicModule = function()
{
    this.scene      = new Lemon.Scene();
    this.renderer   = new Lemon.RenderCanvas("simulation");
    this.camera     = new Lemon.Camera(Lemon.Camera.Type.Perspective);
};

/**
* Init module.
*/
GraphicModule.prototype.init = function()
{
    // Set path to shaders and load the default shader.
    Lemon.ProgramLibrary.folderPath = '../extlibs/shaders/';
    Lemon.ProgramLibrary.load("DefaultShader", 'default.vert', 'default.frag');

    // Init camera.
    this.camera.move(0, 0, 1.0);
    this.camera.lookAt(0, 0, 0);
    this.camera.setViewport(0, 0, this.renderer.getSize()[0], this.renderer.getSize()[1]);
    this.camera.setType(Lemon.Camera.Type.Orthographic);
    this.camera.zoom(0.25);
};

/**
* Update module.
* @param {number} deltaTime Time elapsed between two frames.
*/
GraphicModule.prototype.update = function( deltaTime )
{
    // Logic.
    this.scene.update(deltaTime);

    // Draw scene.
    this.renderer.clear(new Lemon.Color(30, 30, 30));
    this.renderer.render(this.scene, this.camera);
    this.renderer.display();
};

/**
* Get a reference to the renderer.
* @return {Lemon.RenderCanvas} A Lemon.RenderCanvas instance.
*/
GraphicModule.prototype.getRenderer = function()
{
    return this.renderer;
};
