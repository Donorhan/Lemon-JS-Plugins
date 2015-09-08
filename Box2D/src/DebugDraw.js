var DebugDraw = function( physicWorld, renderer )
{
    // A reference to the Box2D's world.
    this.world = physicWorld;

    // A reference to a Lemon-JS renderer.
    this.renderer = renderer;

    // The Box2D debug instance.
    this.debugDraw = new Box2D.JSDraw();

    // Default flags: solids only.
    this.debugDraw.SetFlags(0x0001 + 0x0010 + 0x0008);

    // Enable debug draw.
    this.world.SetDebugDraw(this.debugDraw);

    // Resulting geometry.
    this.geometry = new Lemon.Geometry();

    // Alpha rendering by default.
    this.blendMode = new Lemon.BlendMode(Lemon.BlendMode.Mode.Alpha);

    // Shader to use.
    this.program = Lemon.ProgramLibrary.load('DebugDrawShader', '../../Box2D/assets/DebugDraw.vert', '../../Box2D/assets/DebugDraw.frag');

    // Link class methods to Box2D's object.
    this.init();
};

DebugDraw.DrawingModes = { Triangles: 0x01, Lines: 0x02, Points: 0x04 };

/**
* Init object.
*/
DebugDraw.prototype.init = function()
{
    // Link methods.
    var _this = this;

    this.debugDraw.DrawSegment = function( vertices, vertexCount, color )
    {
        _this.drawSegment(vert1, vert2, Box2D.wrapPointer(color, Box2D.b2Color));
    };

    this.debugDraw.DrawPolygon = function( vertices, vertexCount, color )
    {
        _this.drawPolygon(vertices, vertexCount, false, Box2D.wrapPointer(color, Box2D.b2Color));
    };

    this.debugDraw.DrawSolidPolygon = function( vertices, vertexCount, color ) 
    {
        _this.drawPolygon(vertices, vertexCount, true, Box2D.wrapPointer(color, Box2D.b2Color));
    };

    this.debugDraw.DrawCircle = function( center, radius, color ) 
    {
        _this.drawCircle(center, radius, Box2D.b2Vec2(0,0), false, Box2D.wrapPointer(color, Box2D.b2Color));
    };

    this.debugDraw.DrawSolidCircle = function( center, radius, axis, color ) 
    {
        _this.drawCircle(center, radius, axis, true, Box2D.wrapPointer(color, Box2D.b2Color));
    };

    this.debugDraw.DrawTransform = function( transform ) 
    {
        _this.drawTransform(transform);
    };

    // Prepare data.
    var format = new Lemon.VertexFormat();
    format.add(new Lemon.VertexElement(Lemon.VertexElement.Usage.Position, 0, Lemon.VertexElement.Type.Float, 2, false));
    this.geometry.setVertexFormat(format);
}

/**
* Draw segment.
* @param {Box2D.b2Vec2} vert1 Segment start.
* @param {Box2D.b2Vec2} vert2 Segment end.
* @param {Array.<number>} color A array with r, g, b values.
*/
DebugDraw.prototype.drawSegment = function( vert1, vert2, color )
{
    var vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
    var vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);

    this.geometry.setPositions([vert1V.get_x(), vert1V.get_y(), vert2.get_x(), vert2.get_y()]);
    this.geometry.setIndices([0, 1]);
    this.drawMesh(DebugDraw.DrawingModes.Line, indices.length, [color.get_r(), color.get_g(), color.get_b()]);
};

/**
* Draw polygons.
* @param {Array.<Box2D.b2Vec2>} vertices An array with vertices's position.
* @param {number} vertexCount Vertex count.
* @param {boolean} fill True to draw as a filled object.
* @param {Array.<number>} color A array with r, g, b values.
*/
DebugDraw.prototype.drawPolygon = function( vertices, vertexCount, fill, color )
{
    // Vertices.
    var positions = [];
    for( var i = 0, j = 0; i < vertexCount; i++, j += 2 )
    {
        var vert = Box2D.wrapPointer(vertices+(i*8), Box2D.b2Vec2);
        positions[j+0] = vert.get_x();
        positions[j+1] = vert.get_y();
    }
    this.geometry.setPositions(positions);

    // Indices.
    var indices = [];
    for( var i = 0; i < vertexCount; i++ )
        indices[i] = i;
    this.geometry.setIndices(indices);

    this.drawMesh(DebugDraw.DrawingModes.Lines, indices.length, [color.get_r(), color.get_g(), color.get_b()]);
};

/**
* Draw circles.
* @param {Box2D.b2Vec2} center Position on x.
* @param {number} radius Radius.
* @param {Box2D.b2Vec2} axis Axis.
* @param {boolean} fill True to draw as filled object.
* @param {Array.<number>} color A array with r, g, b values.
*/
DebugDraw.prototype.drawCircle = function( center, radius, axis, fill, color )
{
    var centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
    var axisV   = Box2D.wrapPointer(axis, Box2D.b2Vec2);

    var precision   = 16;
    var k_increment = 2.0 * Math.PI / precision;
    var theta       = 0.0;

    // Vertices.
    var positions = [];
    for( var i = 0, j = 0; i < precision; i++, j += 2 )
    {
        positions[j+0] = centerV.get_x() + radius * Math.cos(theta);
        positions[j+1] = centerV.get_y() + radius * Math.sin(theta);
        theta         += k_increment;
    }
    this.geometry.setPositions(positions);

    // Indices.
    var indices = [];
    for( var i = 0; i < precision; i++ )
        indices[i] = i;
    this.geometry.setIndices(indices);

    this.drawMesh(DebugDraw.DrawingModes.Lines, indices.length, [color.get_r(), color.get_g(), color.get_b()]);
};

/**
* Draw axes.
* @param {number} x Position on x.
* @param {number} y Position on y.
* @param {number} angle Rotation.
*/
DebugDraw.prototype.drawAxes = function( x, y, angle )
{
    var sin     = Math.sin(angle);
    var cos     = Math.cos(angle);
    var newX    = x;
    var newY    = y;

    function transform(x, y) 
    { 
        return { x: x * cos + y * sin, y: -x * sin + y * cos }; 
    }

    var origin  = transform(newX, newY);
    var xAxis   = transform(newX + 0.1, newY);
    var yAxis   = transform(newX, newY + 0.1);

    this.geometry.setIndices([0, 1]);

    this.geometry.setPositions([origin.x, origin.y, xAxis.x, xAxis.y]);
    this.drawMesh(2, [0.75, 0, 0]);

    this.geometry.setPositions([origin.x, origin.y, yAxis.x, yAxis.y]);
    this.drawMesh(DebugDraw.DrawingModes.Line, 2, [0, 0.75, 0]);
};

/**
* Draw transform: body's rotation and position.
* @param {Box2D.b2Transform} transform Transform data.
*/
DebugDraw.prototype.drawTransform = function( transform ) 
{
    var trans   = Box2D.wrapPointer(transform, Box2D.b2Transform);
    var pos     = trans.get_p();
    var rot     = trans.get_q();
    this.drawAxes(pos.get_x(), pos.get_y(), rot.GetAngle());    
};

/**
* Draw 
* @private
* @param {DebugDraw.DrawingModes|number} mode Drawing modes to use.
* @param {number} indexCount Index count to use.
* @param {Array.<number>} color A array with r, g, b values.
*/
DebugDraw.prototype.drawMesh = function( mode, indexCount, color )
{
    var graphicAPI = this.renderer.getRenderAPI();
    var programCode = graphicAPI.setProgram(this.program);
    if( programCode === -1 )
        return;

    // Must send/update shared uniforms.
    if( programCode == 1 )
        graphicAPI.setUniform(this.program, 'uCamera', Lemon.Type.Matrix, graphicAPI.getActiveCamera().getViewProjectionMatrix());

    graphicAPI.setUniform(this.program, 'uColor', Lemon.Type.Float, color);

    graphicAPI.setBlendMode(this.blendMode);
    graphicAPI.setGeometry(this.geometry);

    if( mode & DebugDraw.DrawingModes.Triangles )
        graphicAPI.drawIndexedPrimitives(Lemon.DrawingMode.TrianglesFan, 0, indexCount); 

    if( mode & DebugDraw.DrawingModes.Lines )
        graphicAPI.drawIndexedPrimitives(Lemon.DrawingMode.LinesLoop, 0, indexCount); 

    if( mode & DebugDraw.DrawingModes.Points )
        graphicAPI.drawIndexedPrimitives(Lemon.DrawingMode.Points, 0, indexCount); 
};

/**
* Ask to draw debug scene.
*/
DebugDraw.prototype.draw = function()
{
    this.world.DrawDebugData();
};
