var PhysicModule = function()
{
    // Init Box2D (emscripten job).
    using(Box2D, "b2.+");

    // Box2D world.
    this.world = new b2World( new b2Vec2(0.0, -9.81) );

    // Physic bodies.
    this.bodies = [];
};

/**
* Init module.
*/
PhysicModule.prototype.init = function() { };

/**
* Update module.
* @param {number} deltaTime Time elapsed between two frames.
*/
PhysicModule.prototype.update = function( deltaTime )
{
    this.world.Step(1.0 / 60.0, 3.0, 2.0);  // Box simulation must have a fixed delta time.
};

/**
* Create a Box2D bloc.
* @param {Array.<number>} position Position on both axis.
* @param {number} rotation Rotation in degree.
* @param {Array.<number>} size Size on both axis.
* @param {boolean} isStatic True to reate a static body.
* @param {Object=} userData User data: You can pass a graphic object to get it later during physic/graphic synchronisation.
* @return {b2Body} A Box2D body instance.
*/
PhysicModule.prototype.createBloc = function( position, rotation, size, isStatic, userData )
{
    var bodyDef = new b2BodyDef();
    bodyDef.set_type(isStatic ? b2_staticBody : b2_dynamicBody);

    var fixture = new b2FixtureDef();
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(size[0] - 0.01, size[1] - 0.01, new b2Vec2(0, 0), 0);
        fixture.set_shape(shape);
        fixture.set_density(1.0);
        fixture.set_friction(0.3);
        fixture.set_restitution(0.2);
        fixture.set_isSensor(false);
    }

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixture);
    body.SetFixedRotation(false);
    body.userData = userData; // "SetUserData" method didn't work with this version of Box2D (bug from emscripten)
    this.bodies.push(body);

    // Set position and rotation.
    body.SetTransform( new b2Vec2(position[0], position[1]), rotation * Math.PI / 180 );

    return body;
};

/**
* Create a Box2D circle.
* @param {Array.<number>} position Position on both axis.
* @param {number} rotation Rotation in degree.
* @param {number} radius Radius.
* @param {boolean} isStatic True to reate a static body.
* @param {Object=} userData User data: You can pass a graphic object to get it later during physic/graphic synchronisation.
* @return {b2Body} A Box2D body instance.
*/
PhysicModule.prototype.createCircle = function( position, rotation, radius, isStatic, userData )
{
    var bodyDef = new b2BodyDef();
    bodyDef.set_type(isStatic ? b2_staticBody : b2_dynamicBody);

    var fixture = new b2FixtureDef();
    {
        var shape = new b2CircleShape();
        shape.set_m_radius(radius);
        fixture.set_shape(shape);
        fixture.set_density(1.0);
        fixture.set_friction(0.3);
        fixture.set_restitution(0.2);
        fixture.set_isSensor(false);
    }

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixture);
    body.SetFixedRotation(false);
    body.userData = userData; // "SetUserData" method didn't work with this version of Box2D (bug from emscripten)
    this.bodies.push(body);

    // Set position and rotation.
    body.SetTransform( new b2Vec2(position[0], position[1]), rotation * Math.PI / 180 );

    return body;
};

/**
* Get physic bodies.
* @return {Array.<b2Body>} All the bodies in this module.
*/
PhysicModule.prototype.getBodies = function()
{
    return this.bodies;
};

/**
* Get the Box2D world.
* @return {b2World} A Box2D world instance.
*/
PhysicModule.prototype.getWorld = function()
{
    return this.world;
};