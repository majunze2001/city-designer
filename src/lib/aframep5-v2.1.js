/* library: aframep5.js
   author: craig kapp
   v0.1: 11/13/2016
   v0.2: 11/7/2017
   v0.3: 11/5/2019
   v2.0: 11/6/2020
   v2.1: 06/08/2021
*/

// A-Frame component to handle interaction events
AFRAME.registerComponent('generic-interaction-handler', {
    schema: {},

    init: function() {
        var el = this.el;

        el.addEventListener('mousedown', function(e) {
            try {
                // invoke the 'clickFunction' defined on this object
                el.eRef.clickFunction(el.eRef);

            } catch (err) {

            }
        });

        el.addEventListener('mouseenter', function(e) {
            try {
                // invoke the 'enterFunction' defined on this object
                el.eRef.enterFunction(el.eRef);
            } catch (err) {

            }
        });

        el.addEventListener('mouseleave', function(e) {
            try {
                // invoke the 'leaveFunction' defined on this object
                el.eRef.leaveFunction(el.eRef);
            } catch (err) {

            }
        });

        el.addEventListener('mouseup', function(e) {
            try {
                // invoke the 'upFunction' defined on this object
                el.eRef.upFunction(el.eRef);
            } catch (err) {

            }
        });
    }
});


// A-Frame components to handle VR controller interaction (right & left hands)
AFRAME.registerComponent('vrcontroller-righthand', {

    schema: {},

    init: function() {
        var el = this.el;

        el.addEventListener('triggerdown', function(e) {
            AFrameP5Utils.controller_rightTriggerDown = true;
        });

        el.addEventListener('triggerup', function(e) {
            AFrameP5Utils.controller_rightTriggerDown = false;
        });

        el.addEventListener('gripdown', function(e) {
            AFrameP5Utils.controller_rightGripDown = true;
        });

        el.addEventListener('gripup', function(e) {
            AFrameP5Utils.controller_rightGripDown = false;
        });

        el.addEventListener('abuttondown', function(e) {
            AFrameP5Utils.controller_aButtonDown = true;
        });

        el.addEventListener('abuttonup', function(e) {
            AFrameP5Utils.controller_aButtonDown = false;
        });

        el.addEventListener('bbuttondown', function(e) {
            AFrameP5Utils.controller_bButtonDown = true;
        });

        el.addEventListener('bbuttonup', function(e) {
            AFrameP5Utils.controller_bButtonDown = false;
        });

        el.addEventListener('thumbstickmoved', function(e) {
	        AFrameP5Utils.controller_rightThumbstickRawData = {
		        x: e.detail.x,
		        y: e.detail.y
	        };
            if (e.detail.y > 0.95) {
	            AFrameP5Utils.controller_rightThumbstickDirection = "DOWN";
            }
            else if (e.detail.y < -0.95) {
	            AFrameP5Utils.controller_rightThumbstickDirection = "UP";
            }
            else if (e.detail.x < -0.95) {
	            AFrameP5Utils.controller_rightThumbstickDirection = "LEFT";
			}
			else if (e.detail.x > 0.95) {
				AFrameP5Utils.controller_rightThumbstickDirection = "RIGHT";
			}
			else {
				AFrameP5Utils.controller_rightThumbstickDirection = false;
			}
        });
    }
});

AFRAME.registerComponent('vrcontroller-lefthand', {

    schema: {},

    init: function() {
        var el = this.el;

        el.addEventListener('triggerdown', function(e) {
            AFrameP5Utils.controller_leftTriggerDown = true;
        });

        el.addEventListener('triggerup', function(e) {
            AFrameP5Utils.controller_leftTriggerDown = false;
        });

        el.addEventListener('gripdown', function(e) {
            AFrameP5Utils.controller_leftGripDown = true;
        });

        el.addEventListener('gripup', function(e) {
            AFrameP5Utils.controller_leftGripDown = false;
        });

        el.addEventListener('xbuttondown', function(e) {
            AFrameP5Utils.controller_xButtonDown = true;
        });

        el.addEventListener('xbuttonup', function(e) {
            AFrameP5Utils.controller_xButtonDown = false;
        });

        el.addEventListener('ybuttondown', function(e) {
            AFrameP5Utils.controller_yButtonDown = true;
        });

        el.addEventListener('ybuttonup', function(e) {
            AFrameP5Utils.controller_yButtonDown = false;
        });

        el.addEventListener('thumbstickmoved', function(e) {
	        AFrameP5Utils.controller_leftThumbstickRawData = {
		        x: e.detail.x,
		        y: e.detail.y
	        };
            if (e.detail.y > 0.95) {
	            AFrameP5Utils.controller_leftThumbstickDirection = "DOWN";
            }
            else if (e.detail.y < -0.95) {
	            AFrameP5Utils.controller_leftThumbstickDirection = "UP";
            }
            else if (e.detail.x < -0.95) {
	            AFrameP5Utils.controller_leftThumbstickDirection = "LEFT";
			}
			else if (e.detail.x > 0.95) {
				AFrameP5Utils.controller_leftThumbstickDirection = "RIGHT";
			}
			else {
				AFrameP5Utils.controller_leftThumbstickDirection = false;
			}
        });

    }

});

// A-Frame component to compute intersection points with objects in the scene
AFRAME.registerComponent('cursor-ray', {

    init: function() {
        let _this = this;
        this.el.addEventListener('raycaster-intersection', function(e) {

          // no existing entity intersections, store this as our currently active entity
          if (_this.entityIntersected == null) {
              _this.entityIntersected = e.detail.intersections[0].object.el;
              return;
          }

          // compute intersection with this new entity
          let intersectionTestNew = _this.el.components.raycaster.getIntersection(e.detail.intersections[0].object.el);

          // compute intersection with our existing entity
          let intersectionTestOld = _this.el.components.raycaster.getIntersection(_this.entityIntersected);

          // is this new entity closer? if so, swap!
          if (intersectionTestNew.distance < intersectionTestOld.distance) {
            _this.entityIntersected = e.detail.intersections[0].object.el;
          }


        });
        this.el.addEventListener('raycaster-intersection-cleared', function(e) {
          //console.log(_this.entityIntersected);
          //console.log(e.detail.clearedEls);
          //console.log(_this.entityIntersected == e.detail.clearedEls[0])
          for (let i = 0; i < e.detail.clearedEls.length; i++) {
            if (e.detail.clearedEls[i] == _this.entityIntersected) {
              _this.entityIntersected = null;
              console.log("cleared!");
              break;
            }
          }
        });
    },

    tick: function() {
        // no intersections
        if (!this.entityIntersected) {
            return;
        }

        // make sure the entity in question has a handler in place for this kind of interaction
        if (this.entityIntersected.eRef.overFunction) {

            // compute intersection
            let intersection = this.el.components.raycaster.getIntersection(this.entityIntersected);

            let intersectionData = {
                distance: intersection.distance,
                point3d: {
                    x: intersection.point.x,
                    y: intersection.point.y,
                    z: intersection.point.z
                },
                uv: {
                    x: intersection.uv.x,
                    y: intersection.uv.y,
                }
            };

            if (this.entityIntersected.eRef.dynamicTexture) {
                intersectionData.point2d = {
                    x: intersection.uv.x * this.entityIntersected.eRef.dynamicTextureWidth,
                    y: this.entityIntersected.eRef.dynamicTextureHeight - intersection.uv.y * this.entityIntersected.eRef.dynamicTextureHeight
                }
            }

            // call the 'overFunction' on this entity
            this.entityIntersected.eRef.overFunction(this.entityIntersected.eRef, intersectionData);
        }

    }
});


AFRAME.registerComponent('rotation-and-position-reader', {

    init: function() {
		// woring variables
        this.position = new THREE.Vector3();
		this.quaternion = new THREE.Quaternion();
		this.scale = new THREE.Vector3();
    },

    tick: function() {
	    // get current world position of the camera
	    this.el.object3D.getWorldPosition(AFrameP5Utils.camera_positionWorld);

      // set the camera semaphore (bug fix for immediate calls to 'World.setUserPosition')
      AFrameP5Utils.camera_semaphore = true;

	    // get current local position of the camera
	    AFrameP5Utils.camera_positionLocal = this.el.object3D.position;

		// get current rotation of the camera by decomposing world position to include position of holder element
		this.el.object3D.matrixWorld.decompose( this.position, this.quaternion, this.scale );
		AFrameP5Utils.camera_rotation = new THREE.Euler().setFromQuaternion( this.quaternion, this.el.object3D.rotation.order );
    }
});



class Light {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'light';

        // process light opts
        AFrameP5Utils.setLight(this.opts, this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}


class Container3D {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'container';

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}


class OBJ {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'obj';

        // set asset id
        this.tag.setAttribute('obj-model', 'obj: #' + opts.asset + '; mtl: #' + opts.mtl);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }
}


class GLTF {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'gltf';

        // set asset id
        this.tag.setAttribute('gltf-model', '#' + opts.asset);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }
}



class Box {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'box';

        // setup geometry parameters
        if (!('width' in opts)) {
            opts.width = 1;
        }
        if (!('depth' in opts)) {
            opts.depth = 1;
        }
        if (!('height' in opts)) {
            opts.height = 1;
        }
        this.width = opts.width;
        this.height = opts.height;
        this.depth = opts.depth;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }
}


class Plane {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'plane';

        // setup geometry parameters
        if (!('width' in opts)) {
            opts.width = 1;
        }
        if (!('height' in opts)) {
            opts.height = 1;
        }
        this.width = opts.width;
        this.height = opts.height;
        this.depth = "none";

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}


class Text {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'text';

        // setup geometry parameters
        if (!('width' in opts)) {
            opts.width = 1;
        }
        if (!('height' in opts)) {
            opts.height = 1;
        }
        this.width = opts.width;
        this.height = opts.height;
        this.depth = "none";

        // set text specific settings
        AFrameP5Utils.setTextOptions(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}



class Sphere {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'sphere';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        if (!('segmentsWidth' in opts)) {
            opts.segmentsWidth = 18;
        }
        this.segmentsWidth = opts.segmentsWidth;

        if (!('segmentsHeight' in opts)) {
            opts.segmentsHeight = 36;
        }
        this.segmentsHeight = opts.segmentsHeight;

        if (!('phiStart' in opts)) {
            opts.phiStart = 0;
        }
        this.phiStart = opts.phiStart;

        if (!('phiLength' in opts)) {
            opts.phiLength = 360;
        }
        this.phiLength = opts.phiLength;

        if (!('thetaStart' in opts)) {
            opts.thetaStart = 0;
        }
        this.thetaStart = opts.thetaStart;

        if (!('thetaLength' in opts)) {
            opts.thetaLength = 360;
        }
        this.thetaLength = opts.thetaLength;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}



class Sky {

    constructor(opts) {

        // store desired options
        if (opts == undefined) {
            opts = {};
        }
        this.opts = opts;

        // create a tag for this entity
        this.tag = document.createElement('a-sky');
        this.tag.id = 'id-' + Math.random().toString(36).substr(2, 16);
        this.id = this.tag.id;

        // store what kind of primitive shape this entity is
        this.prim = 'sky';

        // setup geometry parameters
        if (!('radius' in this.opts)) {
            this.opts.radius = 500;
        }
        this.radius = this.opts.radius;

        // setup material parameters
        if (!('asset' in this.opts)) {
            this.opts.asset = '';
        }
        this.asset = this.opts.asset;

        // dynamic textures
        if ('dynamicTexture' in opts && opts.dynamicTexture == true) {
            this.dynamicTexture = this.opts.dynamicTexture;

            if ('dynamicTextureWidth' in opts) {
                this.dynamicTextureWidth = opts.dynamicTextureWidth;
            } else {
                this.dynamicTextureWidth = 0;
            }

            if ('dynamicTextureWidth' in opts) {
                this.dynamicTextureHeight = opts.dynamicTextureHeight;
            } else {
                this.dynamicTextureHeight = 0;
            }

            AFrameP5Utils.registerDynamicTexture(this);
        } else {
            this.dynamicTexture = false;
        }

        // setup getters & setters
        this.getRadius = function() {
            if ('radius' in this) {
                return this.radius;
            }
            return 'none';
        }

        this.setRadius = function(r) {
            if ('radius' in this) {
                this.radius = r;
                AFrameP5Utils.processSkyChanges(this);
            }
        }

        this.changeRadius = function(r) {
            if ('radius' in this) {
                this.radius += r;
                AFrameP5Utils.processSkyChanges(this);
            }
        }

        this.getAsset = function() {
            if ('asset' in this) {
                return this.asset;
            }
            return "none";
        }
        this.setAsset = function(v) {
            if ('asset' in this) {
                this.asset = v;
                AFrameP5Utils.processSkyChanges(this);
            }
        }

        // update texture (for canvas textures)
        this.updateTexture = function() {
            try {
                this.tag.object3DMap.mesh.material.map.needsUpdate = true;
            } catch (e) {}
        }

        // setup tag with initial values
        AFrameP5Utils.processSkyChanges(this);
    }

}



class Dodecahedron {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'dodecahedron';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}



class Octahedron {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'octahedron';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}


class Tetrahedron {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'tetrahedron';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}


class Circle {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'circle';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        if (!('segments' in opts)) {
            opts.segments = 32;
        }
        this.segments = opts.segments;

        if (!('thetaStart' in opts)) {
            opts.thetaStart = 0;
        }
        this.thetaStart = opts.thetaStart;

        if (!('thetaLength' in opts)) {
            opts.thetaLength = 360;
        }
        this.thetaLength = opts.thetaLength;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}

class Cone {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'cone';

        // setup geometry parameters
        if (!('height' in opts)) {
            opts.height = 2;
        }
        this.height = opts.height;

        if (!('openEnded' in opts)) {
            opts.openEnded = false;
        }
        this.openEnded = opts.openEnded;

        if (!('radiusBottom' in opts)) {
            opts.radiusBottom = 1;
        }
        this.radiusBottom = opts.radiusBottom;

        if (!('radiusTop' in opts)) {
            opts.radiusTop = 1;
        }
        this.radiusTop = opts.radiusTop;

        if (!('segmentsRadial' in opts)) {
            opts.segmentsRadial = 36;
        }
        this.segmentsRadial = opts.segmentsRadial;

        if (!('segmentsHeight' in opts)) {
            opts.segmentsHeight = 18;
        }
        this.segmentsHeight = opts.segmentsHeight;

        if (!('thetaStart' in opts)) {
            opts.thetaStart = 0;
        }
        this.thetaStart = opts.thetaStart;

        if (!('thetaLength' in opts)) {
            opts.thetaLength = 360;
        }
        this.thetaLength = opts.thetaLength;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}

class Cylinder {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'cylinder';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        if (!('height' in opts)) {
            opts.height = 2;
        }
        this.height = opts.height;

        if (!('segmentsRadial' in opts)) {
            opts.segmentsRadial = 36;
        }
        this.segmentsRadial = opts.segmentsRadial;

        if (!('segmentsHeight' in opts)) {
            opts.segmentsHeight = 18;
        }
        this.segmentsHeight = opts.segmentsHeight;

        if (!('openEnded' in opts)) {
            opts.openEnded = false;
        }
        this.openEnded = opts.openEnded;

        if (!('thetaStart' in opts)) {
            opts.thetaStart = 0;
        }
        this.thetaStart = opts.thetaStart;

        if (!('thetaLength' in opts)) {
            opts.thetaLength = 360;
        }
        this.thetaLength = opts.thetaLength;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}

class Ring {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'ring';

        // setup geometry parameters
        if (!('radiusInner' in opts)) {
            opts.radiusInner = 0.5;
        }
        this.radiusInner = opts.radiusInner;

        if (!('radiusOuter' in opts)) {
            opts.radiusOuter = 1;
        }
        this.radiusOuter = opts.radiusOuter;

        if (!('segmentsTheta' in opts)) {
            opts.segmentsTheta = 32;
        }
        this.segmentsTheta = opts.segmentsTheta;

        if (!('segmentsPhi' in opts)) {
            opts.segmentsPhi = 8;
        }
        this.segmentsPhi = opts.segmentsPhi;

        if (!('thetaStart' in opts)) {
            opts.thetaStart = 0;
        }
        this.thetaStart = opts.thetaStart;

        if (!('thetaLength' in opts)) {
            opts.thetaLength = 360;
        }
        this.thetaLength = opts.thetaLength;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}

class Torus {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'torus';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        if (!('radiusTubular' in opts)) {
            opts.radiusTubular = 0.2;
        }
        this.radiusTubular = opts.radiusTubular;

        if (!('segmentsRadial' in opts)) {
            opts.segmentsRadial = 36;
        }
        this.segmentsRadial = opts.segmentsRadial;

        if (!('segmentsTubular' in opts)) {
            opts.segmentsTubular = 32;
        }
        this.segmentsTubular = opts.segmentsTubular;

        if (!('arc' in opts)) {
            opts.arc = 360;
        }
        this.arc = opts.arc;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}

class TorusKnot {

    constructor(opts) {
        // store desired options
        AFrameP5Utils.setEntityOptions(opts, this);

        // store what kind of primitive shape this entity is
        this.prim = 'torusKnot';

        // setup geometry parameters
        if (!('radius' in opts)) {
            opts.radius = 1;
        }
        this.radius = opts.radius;

        if (!('radiusTubular' in opts)) {
            opts.radiusTubular = 0.2;
        }
        this.radiusTubular = opts.radiusTubular;

        if (!('segmentsRadial' in opts)) {
            opts.segmentsRadial = 36;
        }
        this.segmentsRadial = opts.segmentsRadial;

        if (!('segmentsTubular' in opts)) {
            opts.segmentsTubular = 32;
        }
        this.segmentsTubular = opts.segmentsTubular;

        if (!('p' in opts)) {
            opts.p = 2;
        }
        this.p = opts.p;

        if (!('q' in opts)) {
            opts.q = 3;
        }
        this.q = opts.q;

        // set geometry
        AFrameP5Utils.setGeometry(this);

        // set material
        AFrameP5Utils.processMaterial(this);
        AFrameP5Utils.setMaterial(this);

        // set scale
        AFrameP5Utils.setScale(this.opts, this);

        // set position
        AFrameP5Utils.setPosition(this.opts, this);

        // set rotation
        AFrameP5Utils.setRotation(this.opts, this);

        // set visibility
        AFrameP5Utils.setVisibility(this.opts, this);

        // set click handler
        AFrameP5Utils.setClickHandlers(this);

        // init common setters / getters
        AFrameP5Utils.initializerSettersAndGetters(this);
    }

}



// utility class to support the creation of new 3D objects
class AFrameP5Utils {

	// internal map of dynamic textures
    static entitiesUsingDynamicTextures = [];

	// controller state variables
    static controller_rightTriggerDown = false;
    static controller_rightGripDown = false;
    static controller_rightThumbstickDirection = false;
    static controller_rightThumbstickRawData = false;
    static controller_aButtonDown = false;
    static controller_bButtonDown = false;
    static controller_leftTriggerDown = false;
    static controller_leftGripDown = false;
    static controller_leftThumbstickDirection = false;
    static controller_leftThumbstickRawData = false;
    static controller_xButtonDown = false;
    static controller_yButtonDown = false;

    // camera state variables
    static camera_semaphore = false;
    static camera_positionWorld = new THREE.Vector3();
    static camera_rotation = new THREE.Vector3();
    static camera_positionLocal = new THREE.Euler();

    static processSkyChanges(entity) {
        entity.tag.setAttribute('radius', entity.radius);
        entity.tag.setAttribute('src', '#' + entity.asset)
    }


    static setTextOptions(entity) {

        if ('text' in entity.opts) {
            entity.text = entity.opts.text;
        } else {
            entity.text = '';
        }

        if ('red' in entity.opts) {
            entity.red = entity.opts.red;
        } else {
            entity.red = 128;
        }

        if ('green' in entity.opts) {
            entity.green = entity.opts.green;
        } else {
            entity.green = 128;
        }

        if ('blue' in entity.opts) {
            entity.blue = entity.opts.blue;
        } else {
            entity.blue = 128;
        }

        if ('textAlign' in entity.opts) {
            entity.textAlign = entity.opts.textAlign;
        } else {
            entity.textAlign = 'center';
        }

        if ('font' in entity.opts) {
            entity.font = entity.opts.font;
        } else {
            entity.font = 'roboto';
        }

        if ('side' in entity.opts) {
            entity.side = entity.opts.side;
        } else {
            entity.side = 'double';
        }

        if ('opacity' in entity.opts) {
            entity.opacity = entity.opts.opacity;
        } else {
            entity.opacity = 1.0;
        }



        entity.setText = function(t) {
            this.text = t;
            AFrameP5Utils.processTextChanges(this);
        }

        entity.setColor = function(r, g, b) {
            if ('red' in this && 'green' in this && 'blue' in this) {
                this.red = parseInt(r);
                this.green = parseInt(g);
                this.blue = parseInt(b);

                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.setRed = function(r) {
            if ('red' in this) {
                this.red = parseInt(r);
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.setGreen = function(g) {
            if ('green' in this) {
                this.green = parseInt(g);
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.setBlue = function(b) {
            if ('blue' in this) {
                this.blue = parseInt(b);
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.getRed = function() {
            if ('red' in this) {
                return this.red;
            }
            return "none";
        }

        entity.getGreen = function() {
            if ('green' in this) {
                return this.green;
            }
            return "none";
        }

        entity.getBlue = function() {
            if ('blue' in this) {
                return this.blue;
            }
            return "none";
        }

        entity.getOpacity = function() {
            if ('opacity' in this) {
                return this.opacity;
            }
            return "none";
        }
        entity.setOpacity = function(v) {
            if ('opacity' in this) {
                this.opacity = v;
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.getSide = function() {
            if ('side' in this) {
                return this.side;
            }
            return "none";
        }
        entity.setSide = function(v) {
            if ('side' in this) {
                this.side = v;
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.getFont = function() {
            if ('font' in this) {
                return this.font;
            }
            return "none";
        }
        entity.setFont = function(v) {
            if ('font' in this) {
                this.font = v;
                AFrameP5Utils.processTextChanges(this);
            }
        }

        entity.setTextAlign = function(t) {
            this.textAlign = t;
            AFrameP5Utils.processTextChanges(this);
        }

        entity.getText = function() {
            return this.text;
        }

        entity.getTextAlign = function() {
            return this.textAlign;
        }

        AFrameP5Utils.processTextChanges(entity);
    }

    static processTextChanges(entity) {
        entity.tag.setAttribute('text', `value: ${entity.text}; color: rgb(${entity.red}, ${entity.green}, ${entity.blue}); align: ${entity.textAlign}; font: ${entity.font}; side: ${entity.side}; opacity: ${entity.opacity};`);
    }

    static setClickHandlers(entity) {
        if ('clickFunction' in entity.opts) {
            entity.clickFunction = entity.opts.clickFunction;
            entity.tag.eRef = entity;
            entity.tag.setAttribute('generic-interaction-handler', '');
        }
        if ('upFunction' in entity.opts) {
            entity.upFunction = entity.opts.upFunction;
            entity.tag.eRef = entity;
            entity.tag.setAttribute('generic-interaction-handler', '');
        }
        if ('enterFunction' in entity.opts) {
            entity.enterFunction = entity.opts.enterFunction;
            entity.tag.eRef = entity;
            entity.tag.setAttribute('generic-interaction-handler', '');
        }
        if ('leaveFunction' in entity.opts) {
            entity.leaveFunction = entity.opts.leaveFunction;
            entity.tag.eRef = entity;
            entity.tag.setAttribute('generic-interaction-handler', '');
        }
        if ('overFunction' in entity.opts) {
            entity.overFunction = entity.opts.overFunction;
            entity.tag.eRef = entity;
            entity.tag.setAttribute('generic-interaction-handler', '');
        }
    }


    static setEntityOptions(opts, entity) {
        // store desired options
        if (opts == undefined) {
            opts = {};
        }
        entity.opts = opts;

        // create a tag for this entity
        entity.tag = document.createElement('a-entity');
        entity.tag.id = 'id-' + Math.random().toString(36).substr(2, 16);
        entity.id = entity.tag.id;

        // setup a "children" array
        entity.children = [];
    }


    static setGeometry(entity) {
        if (entity.prim == 'sphere') {
            entity.tag.setAttribute('geometry', 'primitive: sphere; radius: ' + entity.radius + '; segmentsWidth: ' + entity.segmentsWidth + '; segmentsHeight: ' + entity.segmentsHeight + '; phiStart: ' + entity.phiStart + '; phiLength: ' + entity.phiLength + '; thetaStart: ' + entity.thetaStart + '; thetaLength: ' + entity.thetaLength);
        } else if (entity.prim == 'circle') {
            entity.tag.setAttribute('geometry', 'primitive: circle; radius: ' + entity.radius + '; segments: ' + entity.segments + '; thetaStart: ' + entity.thetaStart + '; thetaLength: ' + entity.thetaLength);
        } else if (entity.prim == 'ring') {
            entity.tag.setAttribute('geometry', 'primitive: ring; radiusInner: ' + entity.radiusInner + '; radiusOuter: ' + entity.radiusOuter + '; segmentsTheta: ' + entity.segmentsTheta + '; segmentsPhi: ' + entity.segmentsPhi + '; thetaStart: ' + entity.thetaStart + '; thetaLength: ' + entity.thetaLength);
        } else if (entity.prim == 'cone') {
            entity.tag.setAttribute('geometry', 'primitive: cone; height: ' + entity.height + '; openEnded: ' + entity.openEnded + '; radiusBottom: ' + entity.radiusBottom + '; radiusTop: ' + entity.radiusTop + '; segmentsRadial: ' + entity.segmentsRadial + '; segmentsHeight: ' + entity.segmentsHeight + '; thetaStart: ' + entity.thetaStart + '; thetaLength: ' + entity.thetaLength);
        } else if (entity.prim == 'torus') {
            entity.tag.setAttribute('geometry', 'primitive: torus; radius: ' + entity.radius + '; radiusTubular: ' + entity.radiusTubular + '; segmentsRadial: ' + entity.segmentsRadial + '; segmentsTubular: ' + entity.segmentsTubular + '; arc: ' + entity.arc);
        } else if (entity.prim == 'torusKnot') {
            entity.tag.setAttribute('geometry', 'primitive: torusKnot; radius: ' + entity.radius + '; radiusTubular: ' + entity.radiusTubular + '; segmentsRadial: ' + entity.segmentsRadial + '; segmentsTubular: ' + entity.segmentsTubular + '; p: ' + entity.p + '; q: ' + entity.q);
        } else if (entity.prim == 'cylinder') {
            entity.tag.setAttribute('geometry', 'primitive: cylinder; radius: ' + entity.radius + '; height: ' + entity.height + '; openEnded: ' + entity.openEnded + '; segmentsRadial: ' + entity.segmentsRadial + '; segmentsHeight: ' + entity.segmentsHeight + '; thetaStart: ' + entity.thetaStart + '; thetaLength: ' + entity.thetaLength);
        } else if (entity.prim == 'box') {
            entity.tag.setAttribute('geometry', 'primitive: box; depth: ' + entity.depth + '; height: ' + entity.height + '; width: ' + entity.width);
        } else if (entity.prim == 'plane') {
            entity.tag.setAttribute('geometry', 'primitive: plane; height: ' + entity.height + '; width: ' + entity.width);
        } else if (entity.prim == 'octahedron' || entity.prim == 'tetrahedron' || entity.prim == 'dodecahedron') {
            entity.tag.setAttribute('geometry', 'primitive: ' + entity.prim + '; radius: ' + entity.radius);
        }
    }


    static processMaterial(entity) {
        // handle common attributes
        var opts = entity.opts;

        if (!('opacity' in opts)) {
            opts.opacity = 1.0;
        }
        entity.opacity = opts.opacity;

        if (!('transparent' in opts)) {
            opts.transparent = false;
        }
        entity.transparent = opts.transparent;

        if (!('shader' in opts)) {
            opts.shader = 'standard';
        }
        entity.shader = opts.shader;

        if (!('side' in opts)) {
            opts.side = 'front';
        }
        entity.side = opts.side;

        if (!('metalness' in opts)) {
            opts.metalness = 0.1;
        }
        entity.metalness = opts.metalness;

        if (!('roughness' in opts)) {
            opts.roughness = 0.5;
        }
        entity.roughness = opts.roughness;

        if (!('repeatX' in opts)) {
            opts.repeatX = 1;
        }
        entity.repeatX = opts.repeatX;

        if (!('repeatY' in opts)) {
            opts.repeatY = 1;
        }
        entity.repeatY = opts.repeatY;

        // set color values
        if ('red' in opts) {
            entity.red = parseInt(opts.red);
        } else {
            entity.red = 255;
        }
        if ('green' in opts) {
            entity.green = parseInt(opts.green);
        } else {
            entity.green = 255;
        }
        if ('blue' in opts) {
            entity.blue = parseInt(opts.blue);
        } else {
            entity.blue = 255;
        }

        if ('asset' in opts) {
            entity.asset = opts.asset;
        } else {
            entity.asset = 'None';
        }


        // dynamic textures
        if ('dynamicTexture' in opts && opts.dynamicTexture == true) {
            entity.dynamicTexture = entity.opts.dynamicTexture;

            if ('dynamicTextureWidth' in opts) {
                entity.dynamicTextureWidth = opts.dynamicTextureWidth;
            } else {
                entity.dynamicTextureWidth = 0;
            }

            if ('dynamicTextureWidth' in opts) {
                entity.dynamicTextureHeight = opts.dynamicTextureHeight;
            } else {
                entity.dynamicTextureHeight = 0;
            }

            AFrameP5Utils.registerDynamicTexture(entity);
        } else {
            entity.dynamicTexture = false;
        }

    }

    static setMaterial(entity) {
        // set tag
        if (entity.asset == 'None') {
            entity.tag.setAttribute('material', 'opacity: ' + entity.opacity + '; transparent: ' + entity.transparent + '; shader: ' + entity.shader + '; side: ' + entity.side + '; repeat: ' + entity.repeatX + " " + entity.repeatY + '; color: rgb(' + entity.red + ',' + entity.green + ',' + entity.blue + ')');
        } else {
            entity.tag.setAttribute('material', 'opacity: ' + entity.opacity + '; transparent: ' + entity.transparent + '; shader: ' + entity.shader + '; side: ' + entity.side + '; src: #' + entity.asset + '; repeat: ' + entity.repeatX + " " + entity.repeatY + '; color: rgb(' + entity.red + ',' + entity.green + ',' + entity.blue + ')');
        }

    }



    static setLight(opts, entity) {
        if (!('color' in opts)) {
            opts.color = '#fff';
        }
        if (!('intensity' in opts)) {
            opts.intensity = 1.0;
        }
        if (!('type' in opts)) {
            opts.type = 'directional';
        }
        if (!('groundColor' in opts)) {
            opts.groundColor = '#fff';
        }
        if (!('decay' in opts)) {
            opts.decay = 1.0;
        }
        if (!('distance' in opts)) {
            opts.distance = 0.0;
        }
        if (!('angle' in opts)) {
            opts.angle = 60;
        }
        if (!('penumbra' in opts)) {
            opts.penumbra = 0.0;
        }
        if (!('target' in opts)) {
            opts.target = 'null';
        }

        if (opts.type == 'directional') {
            entity.tag.setAttribute('light', 'color: ' + opts.color + '; intensity: ' + opts.intensity + '; type: ' + opts.type);
        } else if (opts.type == 'ambient') {
            entity.tag.setAttribute('light', 'color: ' + opts.color + '; intensity: ' + opts.intensity + '; type: ' + opts.type);
        } else if (opts.type == 'hemisphere') {
            entity.tag.setAttribute('light', 'color: ' + opts.color + '; intensity: ' + opts.intensity + '; type: ' + opts.type + '; groundColor: ' + opts.groundColor);
        } else if (opts.type == 'point') {
            entity.tag.setAttribute('light', 'color: ' + opts.color + '; intensity: ' + opts.intensity + '; type: ' + opts.type + '; distance: ' + opts.distance + '; decay: ' + opts.decay);
        } else if (opts.type == 'spot') {
            entity.tag.setAttribute('light', 'color: ' + opts.color + '; intensity: ' + opts.intensity + '; type: ' + opts.type + '; angle: ' + opts.angle + '; decay: ' + opts.decay + '; distance: ' + opts.distance + '; penumbra: ' + opts.penumbra + '; target: ' + opts.target);
        }
    }


    static setScale(opts, entity) {
        // set scale
        if ('scaleX' in opts) {
            entity.scaleX = opts.scaleX;
        } else {
            entity.scaleX = 1;
        }

        if ('scaleY' in opts) {
            entity.scaleY = opts.scaleY;
        } else {
            entity.scaleY = 1;
        }

        if ('scaleZ' in opts) {
            entity.scaleZ = opts.scaleZ;
        } else {
            entity.scaleZ = 1;
        }

        // set tag attributes
        entity.tag.setAttribute('scale', entity.scaleX + ' ' + entity.scaleY + ' ' + entity.scaleZ);
    }


    static setPosition(opts, entity) {
        // set position
        if ('x' in opts) {
            entity.x = opts.x;
        } else {
            entity.x = 0;
        }
        if ('y' in opts) {
            entity.y = opts.y;
        } else {
            entity.y = 0;
        }
        if ('z' in opts) {
            entity.z = opts.z;
        } else {
            entity.z = 0;
        }

        // set tag attributes
        entity.tag.setAttribute('position', entity.x + ' ' + entity.y + ' ' + entity.z);
    }


    static setRotation(opts, entity) {
        // set rotation
        if ('rotationX' in opts) {
            entity.rotationX = opts.rotationX;
        } else {
            entity.rotationX = 0;
        }
        if ('rotationY' in opts) {
            entity.rotationY = opts.rotationY;
        } else {
            entity.rotationY = 0;
        }
        if ('rotationZ' in opts) {
            entity.rotationZ = opts.rotationZ;
        } else {
            entity.rotationZ = 0;
        }

        // set tag attributes
        entity.tag.setAttribute('rotation', entity.rotationX + ' ' + entity.rotationY + ' ' + entity.rotationZ);
    }


    static setVisibility(opts, entity) {
        // set visibility
        if ('visible' in opts) {
            entity.visible = opts.visible;
            entity.tag.setAttribute('visible', opts.visible);
        } else {
            entity.visible = true;
            entity.tag.setAttribute('visible', true);
        }
    }


    static initializerSettersAndGetters(entity) {
        entity.getWorldPosition = function() {
            var vectorHUD = new THREE.Vector3();
            vectorHUD.setFromMatrixPosition(this.tag.object3D.matrixWorld);
            return vectorHUD;
        }

        entity.nudge = function(nx, ny, nz) {
            this.x += nx;
            this.y += ny;
            this.z += nz;

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }

        entity.constrainPosition = function(xmin, xmax, ymin, ymax, zmin, zmax) {
            if (this.x < xmin) {
                this.x = xmin;
            }
            if (this.y < ymin) {
                this.y = ymin;
            }
            if (this.z < zmin) {
                this.z = zmin;
            }
            if (this.x > xmax) {
                this.x = xmax;
            }
            if (this.y > ymax) {
                this.y = ymax;
            }
            if (this.z > zmax) {
                this.z = zmax;
            }

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }

        entity.setPosition = function(nx, ny, nz) {
            this.x = nx;
            this.y = ny;
            this.z = nz;

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }

        entity.getX = function() {
            return this.x;
        }

        entity.getY = function() {
            return this.y;
        }

        entity.getZ = function() {
            return this.z;
        }

        entity.setX = function(x) {
            this.x = x;

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }

        entity.setY = function(y) {
            this.y = y;

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }

        entity.setZ = function(z) {
            this.z = z;

            this.tag.setAttribute('position', this.x + ' ' + this.y + ' ' + this.z);
        }


        entity.setRotation = function(nx, ny, nz) {
            this.rotationX = nx;
            this.rotationY = ny;
            this.rotationZ = nz;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.rotateX = function(nx) {
            this.rotationX = nx;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.rotateY = function(ny) {
            this.rotationY = ny;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.rotateZ = function(nz) {
            this.rotationZ = nz;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.spinX = function(nx) {
            this.rotationX += nx;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.spinY = function(ny) {
            this.rotationY += ny;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.spinZ = function(nz) {
            this.rotationZ += nz;

            this.tag.setAttribute('rotation', this.rotationX + ' ' + this.rotationY + ' ' + this.rotationZ);
        }

        entity.getRotationX = function() {
            return this.rotationX;
        }

        entity.getRotationY = function() {
            return this.rotationY;
        }

        entity.getRotationZ = function() {
            return this.rotationZ;
        }

        entity.hide = function() {
            this.visible = false;

            this.tag.setAttribute('visible', this.visible);
        }

        entity.show = function() {
            this.visible = true;

            this.tag.setAttribute('visible', this.visible);
        }

        entity.toggleVisibility = function() {
            this.visible = !this.visible;

            this.tag.setAttribute('visible', this.visible);
        }

        entity.getVisibility = function() {
            return this.visible;
        }

        entity.getScale = function() {
            var s = {};
            s.x = this.scaleX;
            s.y = this.scaleY;
            s.z = this.scaleZ;
            return s;
        }

        entity.getScaleX = function() {
            return this.scaleX;
        }

        entity.getScaleY = function() {
            return this.scaleY;
        }

        entity.getScaleZ = function() {
            return this.scaleZ;
        }

        entity.setScale = function(x, y, z) {
            this.scaleX = x;
            this.scaleY = y;
            this.scaleZ = z;

            this.tag.setAttribute('scale', this.scaleX + ' ' + this.scaleY + ' ' + this.scaleZ);
        }

        entity.setScaleX = function(sx) {
            this.scaleX = sx;

            this.tag.setAttribute('scale', this.scaleX + ' ' + this.scaleY + ' ' + this.scaleZ);
        }

        entity.setScaleY = function(sy) {
            this.scaleY = sy;

            this.tag.setAttribute('scale', this.scaleX + ' ' + this.scaleY + ' ' + this.scaleZ);
        }

        entity.setScaleZ = function(sz) {
            this.scaleZ = sz;

            this.tag.setAttribute('scale', this.scaleX + ' ' + this.scaleY + ' ' + this.scaleZ);
        }

        entity.nudgeScale = function(v) {
            this.scaleX += v;
            this.scaleY += v;
            this.scaleZ += v;

            this.tag.setAttribute('scale', this.scaleX + ' ' + this.scaleY + ' ' + this.scaleZ);
        }


        entity.getProperty = function(prop) {
            if (prop in this) {
                return this[prop];
            }
            return 'none';
        }

        // child management
        entity.addChild = function(child) {
            // append to our child array
            this.children.push(child);

            // append to our DOM element
            this.tag.appendChild(child.tag);
        }
        entity.add = entity.addChild

        entity.removeChild = function(child) {
            // first ensure that the item is actually a child
            var isChild = false;
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == child) {
                    isChild = true;
                    break;
                }
            }

            if (isChild) {
                this.children.splice(i, 1);
                this.tag.removeChild(child.tag);
            }
        }
        entity.remove = entity.removeChild


        entity.getChildren = function() {
            var returnChildren = [];
            for (var i = 0; i < this.children.length; i++) {
                returnChildren.push(this.children[i]);
            }

            return returnChildren;
        }



        // text units don't need geometry or material functions
        if (entity.prim == 'text') {
            return;
        }



        // material getters & setters
        entity.setColor = function(r, g, b) {
            if ('red' in this && 'green' in this && 'blue' in this) {
                this.red = parseInt(r);
                this.green = parseInt(g);
                this.blue = parseInt(b);

                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.setRed = function(r) {
            if ('red' in this) {
                this.red = parseInt(r);
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.setGreen = function(g) {
            if ('green' in this) {
                this.green = parseInt(g);
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.setBlue = function(b) {
            if ('blue' in this) {
                this.blue = parseInt(b);
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getRed = function() {
            if ('red' in this) {
                return this.red;
            }
            return "none";
        }

        entity.getGreen = function() {
            if ('green' in this) {
                return this.green;
            }
            return "none";
        }

        entity.getBlue = function() {
            if ('blue' in this) {
                return this.blue;
            }
            return "none";
        }

        entity.getOpacity = function() {
            if ('opacity' in this) {
                return this.opacity;
            }
            return "none";
        }
        entity.setOpacity = function(v) {
            if ('opacity' in this) {
                this.opacity = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getTransparent = function() {
            if ('transparent' in this) {
                return this.transparent;
            }
            return "none";
        }
        entity.setTransparent = function(v) {
            if ('transparent' in this) {
                this.transparent = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getShader = function() {
            if ('shader' in this) {
                return this.shader;
            }
            return "none";
        }
        entity.setShader = function(v) {
            if ('shader' in this) {
                this.shader = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getSide = function() {
            if ('side' in this) {
                return this.side;
            }
            return "none";
        }
        entity.setSide = function(v) {
            if ('side' in this) {
                this.side = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getMetalness = function() {
            if ('metalness' in this) {
                return this.metalness;
            }
            return "none";
        }
        entity.setMetalness = function(v) {
            if ('metalness' in this) {
                this.metalness = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getRoughness = function() {
            if ('roughness' in this) {
                return this.roughness;
            }
            return "none";
        }
        entity.setRoughness = function(v) {
            if ('roughness' in this) {
                this.roughness = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        entity.getRepeatX = function() {
            if ('repeatX' in this) {
                return this.repeatX;
            }
            return "none";
        }
        entity.setRepeatX = function(v) {
            if ('repeatX' in this) {
                this.repeatX = v;
                AFrameP5Utils.setMaterial(this);
            }
        }

        // need to add repeatY zzz

        entity.getAsset = function() {
            if ('asset' in this) {
                return this.asset;
            }
            return "none";
        }
        entity.setAsset = function(v) {
            if ('asset' in this) {
                this.asset = v;
                AFrameP5Utils.setMaterial(this);
            }
        }


        entity.getOpacity = function() {
            return this.opacity;
        }




        // geometry getters & setters
        entity.setWidth = function(nw) {
            if ('width' in this) {
                this.width = nw;
                AFrameP5Utils.setGeometry(this);
            }
        }

        entity.setDepth = function(nd) {
            if ('depth' in this) {
                this.depth = nd;
                AFrameP5Utils.setGeometry(this);
            }
        }

        entity.setHeight = function(nh) {
            if ('height' in this) {
                this.height = nh;
                AFrameP5Utils.setGeometry(this);
            }
        }

        entity.getWidth = function() {
            if ('width' in this) {
                return this.width;
            }
            return 'none';
        }

        entity.getHeight = function() {
            if ('height' in this) {
                return this.height;
            }
            return 'none';
        }

        entity.getDepth = function() {
            if ('depth' in this) {
                return this.depth;
            }
            return 'none';
        }

        entity.getRadius = function() {
            if ('radius' in this) {
                return this.radius;
            }
            return 'none';
        }

        entity.setRadius = function(r) {
            if ('radius' in this) {
                this.radius = r;
                AFrameP5Utils.setGeometry(this);
            }
        }

        entity.changeRadius = function(r) {
            if ('radius' in this) {
                this.radius += r;
                AFrameP5Utils.setGeometry(this);
            }
        }


        entity.getSegmentsWidth = function() {
            if ('segmentsWidth' in this) {
                return this.segmentsWidth;
            }
            return "none";
        }
        entity.getSegmentsHeight = function() {
            if ('segmentsHeight' in this) {
                return this.segmentsHeight;
            }
            return "none";
        }
        entity.getPhiStart = function() {
            if ('phiStart' in this) {
                return this.phiStart;
            }
            return "none";
        }
        entity.getPhiLength = function() {
            if ('phiLength' in this) {
                return this.phiLength;
            }
            return "none";
        }
        entity.getThetaStart = function() {
            if ('thetaStart' in this) {
                return this.thetaStart;
            }
            return "none";
        }
        entity.getThetaLength = function() {
            if ('thetaLength' in this) {
                return this.thetaLength;
            }
            return "none";
        }
        entity.getArc = function() {
            if ('arc' in this) {
                return this.arc;
            }
            return "none";
        }

        entity.setSegmentsWidth = function(v) {
            if ('segmentsWidth' in this) {
                this.segmentsWidth = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setSegmentsHeight = function(v) {
            if ('segmentsHeight' in this) {
                this.segmentsHeight = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setPhiStart = function(v) {
            if ('phiStart' in this) {
                this.phiStart = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setPhiLength = function(v) {
            if ('phiLength' in this) {
                this.phiLength = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setThetaStart = function(v) {
            if ('thetaStart' in this) {
                this.thetaStart = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setThetaLength = function(v) {
            if ('thetaLength' in this) {
                this.thetaLength = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.getSegments = function() {
            if ('segments' in this) {
                return this.segments;
            }
            return "none";
        }
        entity.setSegments = function(v) {
            if ('segments' in this) {
                this.segments = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.getOpenEnded = function() {
            if ('openEnded' in this) {
                return this.openEnded;
            }
            return "none";
        }
        entity.getRadiusBottom = function() {
            if ('radiusBottom' in this) {
                return this.radiusBottom;
            }
            return "none";
        }
        entity.getRadiusTop = function() {
            if ('radiusTop' in this) {
                return this.radiusTop;
            }
            return "none";
        }
        entity.getRadiusInner = function() {
            if ('radiusInner' in this) {
                return this.radiusInner;
            }
            return "none";
        }
        entity.getRadiusOuter = function() {
            if ('radiusOuter' in this) {
                return this.radiusOuter;
            }
            return "none";
        }
        entity.getRadiusTubular = function() {
            if ('radiusTubular' in this) {
                return this.radiusTubular;
            }
            return "none";
        }
        entity.getSegmentsRadial = function() {
            if ('segmentsRadial' in this) {
                return this.segmentsRadial;
            }
            return "none";
        }
        entity.getSegmentsTubular = function() {
            if ('segmentsTubular' in this) {
                return this.segmentsTubular;
            }
            return "none";
        }
        entity.getSegmentsTheta = function() {
            if ('segmentsTheta' in this) {
                return this.segmentsTheta;
            }
            return "none";
        }
        entity.getSegmentsPhi = function() {
            if ('segmentsPhi' in this) {
                return this.segmentsPhi;
            }
            return "none";
        }
        entity.getP = function() {
            if ('p' in this) {
                return this.p;
            }
            return "none";
        }
        entity.getQ = function() {
            if ('q' in this) {
                return this.q;
            }
            return "none";
        }
        entity.setOpenEnded = function(v) {
            if ('openEnded' in this) {
                this.openEnded = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setRadiusBottom = function(v) {
            if ('radiusBottom' in this) {
                this.radiusBottom = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setRadiusTop = function(v) {
            if ('radiusTop' in this) {
                this.radiusTop = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setRadiusInner = function(v) {
            if ('radiusInner' in this) {
                this.radiusInner = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setRadiusOuter = function(v) {
            if ('radiusOuter' in this) {
                this.radiusOuter = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setRadiusTubular = function(v) {
            if ('radiusTubular' in this) {
                this.radiusTubular = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setSegmentsRadial = function(v) {
            if ('segmentsRadial' in this) {
                this.segmentsRadial = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setSegmentsTubular = function(v) {
            if ('segmentsTubular' in this) {
                this.segmentsTubular = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setSegmentsTheta = function(v) {
            if ('segmentsTheta' in this) {
                this.segmentsTheta = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setSegmentsPhi = function(v) {
            if ('segmentsPhi' in this) {
                this.segmentsPhi = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setArc = function(v) {
            if ('arc' in this) {
                this.arc = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setP = function(v) {
            if ('p' in this) {
                this.p = v;
                AFrameP5Utils.setGeometry(this);
            }
        }
        entity.setQ = function(v) {
            if ('q' in this) {
                this.q = v;
                AFrameP5Utils.setGeometry(this);
            }
        }


        // update texture (for canvas textures)
        entity.updateTexture = function() {
            try {
                this.tag.object3DMap.mesh.material.map.needsUpdate = true;
            } catch (e) {}
        }

    }



    static registerDynamicTexture(entity) {
        AFrameP5Utils.entitiesUsingDynamicTextures.push(entity)
    }

    static updateDynamicTextures() {
        for (let i = 0; i < AFrameP5Utils.entitiesUsingDynamicTextures.length; i++) {
            AFrameP5Utils.entitiesUsingDynamicTextures[i].updateTexture();
        }
    }



} // end AFrameP5Utils









function addToWorld(entity) {
    document.getElementById('VRScene').appendChild(entity.tag);
}

function removeFromWorld(entity) {
    document.getElementById('VRScene').removeChild(entity.tag);
}




class World {

    constructor(id, mouseOrGaze = 'mouse') {
        console.log("A-FrameP5 v2.1 (Craig Kapp, 2017-2021)");
        console.log("Documentation: https://cs.nyu.edu/~kapp/aframep5");

        if (id == undefined) {
            id = "VRScene";
        }
        this.scene = document.getElementById(id);

        // set an initial background color
        this.setBackground(255, 255, 255);

        // reference the three.js scene directly
        this.threeSceneReference = this.scene.object3D;

        // allow the user to leave base Y plane using WASD
        this.flying = false;

        // set up our camera
        this.camera = new Camera(mouseOrGaze, this.scene);
        this.scene.appendChild(this.camera.holder);

        // set up an array to hold any dynamic textures we need to be aware of
        this.dynamicTextures = {};

        // assume we are in 'loop' mode (controls whether we will take over calling 'draw' on VR headsets where requestAnimationFrame isn't supported)
        this.loop = true;

        // control semaphores
        this.slideMode = {
            enabled: false
        };


        // set up internal update loop
        this.frameCount = 0;
        this.p5FrameCount = null;
        this.p5FrameCountStalled = 0;
        this.setUserPositionEarly = false;
        var _this = this;
        var _interval = setInterval(function() {

            _this.frameCount++;

            // slideToObject
            if (_this.slideMode.enabled) {
                // nudge the camera in this direction
                _this.camera.nudgePosition(_this.slideMode.slideXInc, _this.slideMode.slideYInc, _this.slideMode.slideZInc);

                // mark this step
                _this.slideMode.currentStep++;

                // have we arrived?
                if (_this.slideMode.currentStep >= _this.slideMode.steps) {
                    _this.slideMode.enabled = false;
                }
            }

            // update dynamic textures, if necessary
            AFrameP5Utils.updateDynamicTextures();

            // determine if we need to step in and call 'draw' for p5 - this happens when viewing an A-Frame sketch on a VR headset in immersive mode
            // due to the face that 'requestAnimationFrame' isn't supported
            if (_this.loop) {
                try {
                    if (_this.p5FrameCount == null) {
                        _this.p5FrameCount = frameCount;
                    } else if (_this.p5FrameCount == frameCount) {
                        _this.p5FrameCountStalled++;
                    } else {
                        _this.p5FrameCount = frameCount;
                        _this.p5FrameCountStalled = 0;
                    }

                    // take over calling the 'draw' function
                    if (_this.p5FrameCountStalled > 60) {
                        redraw();
                        _this.p5FrameCount++;
                    }
                } catch (err) {}
            }

            // setUserPositionEarly
            if (_this.setUserPositionEarly && AFrameP5Utils.camera_semaphore) {
              _this.setUserPosition(_this.setUserPositionEarly.x, _this.setUserPositionEarly.y, _this.setUserPositionEarly.z);
              _this.setUserPositionEarly = false;
            }

        }, 16); // end internal update loop (recalled approx. 60 times a second)


    } // end constructor

    setFlying(v) {
        this.flying = v;
        this.camera.setWASD(v);
    }
    getFlying() {
        return this.flying;
    }
    add(entity) {
        this.scene.appendChild(entity.tag);
    }
    addChild(entity) {
        this.add(entity);
    }
    remove(entity) {
        this.scene.removeChild(entity.tag);
    }
    removeChild(entity) {
        this.remove(entity);
    }

    getUserPosition() {
        return {
            x: this.camera.getX(),
            y: this.camera.getY(),
            z: this.camera.getZ()
        };
    }

    getPointInFrontOfUser() {
        return this.camera.cursor.getWorldPosition();
    }

    setUserPosition(x, y, z) {
        this.camera.setPosition(x, y, z);

        // is this function being called before the camera has a had a chance to run its update cycle?
        // if so, store the value and have our internal update loop handle this when the camera is ready to go
        if (AFrameP5Utils.camera_semaphore == false) {
          this.setUserPositionEarly = {x: x, y: y, z: z};
        }
    }

    getUserRotation() { // zzz
        //return { x:this.camera.rotationX*180/Math.PI, y:this.camera.rotationY*180/Math.PI, z:this.camera.rotationZ*180/Math.PI};
        return {
            x: AFrameP5Utils.camera_rotation.x,
            y: AFrameP5Utils.camera_rotation.y,
            z: AFrameP5Utils.camera_rotation.z
        };
    }

    moveUserForward(d) {
        var vectorHUD = new THREE.Vector3();
        vectorHUD.setFromMatrixPosition(this.camera.cursor.tag.object3D.matrixWorld);

        var vectorCamera = new THREE.Vector3();
        vectorCamera.setFromMatrixPosition(this.camera.cameraEl.object3D.matrixWorld);

        var xDiff = vectorHUD.x - vectorCamera.x;
        var yDiff = vectorHUD.y - vectorCamera.y;
        var zDiff = vectorHUD.z - vectorCamera.z;

        if (this.flying) {
            this.camera.nudgePosition(xDiff * d, yDiff * d, zDiff * d);
        } else {
            this.camera.nudgePosition(xDiff * d, 0, zDiff * d);
        }
    }

    teleportToObject(element) {
        console.log(element.getX(), element.getY(), element.getZ());
        this.camera.setPosition(element.getX(), element.getY(), element.getZ());
    }

    slideToObject(element, time) {

        // only slide if we aren't already sliding
        if (this.slideMode.enabled == false) {
            // compute distance in all axes
            this.slideMode.xDistance = element.getX() - this.camera.getX();
            this.slideMode.yDistance = element.getY() - this.camera.getY();
            this.slideMode.zDistance = element.getZ() - this.camera.getZ();

            // compute necessary # of steps
            this.slideMode.steps = parseInt(time / 16);
            this.slideMode.currentStep = 0;

            // compute increments
            this.slideMode.slideXInc = this.slideMode.xDistance / this.slideMode.steps;
            this.slideMode.slideYInc = this.slideMode.yDistance / this.slideMode.steps;
            this.slideMode.slideZInc = this.slideMode.zDistance / this.slideMode.steps;

            // enter into slide mode
            this.slideMode.enabled = true;
        }
    }

    setMouseControls() {
        this.camera.setMouseControls();
    }

    setGazeControls() {
        this.camera.setGazeControls();
    }

    hideCursor() {
        this.camera.cursor.hide();
    }

    showCursor() {
        this.camera.cursor.show();
    }

    removeDefaultWorldLighting() {
        let allLights = document.querySelectorAll('a-entity[light]');
        for (let i = 0; i < allLights.length; i++) {
            try {
                allLights[i].parentElement.removeChild(allLights[i])
            } catch (err) {}
        }
    }

    createDynamicTextureFromCreateGraphics(cg) {

        let _cg = cg;
        let _id = 'canvas-' + Math.random().toString(36).substr(2, 16);

        // use p5's 'instance mode' to set up a separate sketch framework to render the graphics buffer
        let sketchCode = function(p) {

            let _p5FrameCount = null;
            let _p5FrameCountStalled = 0;

            p.setup = function() {
                let c = p.createCanvas(_cg.width, _cg.height).id(_id);

                // internal monitoring system to ensure that the texture gets updated when VR browsers go into full immersion mode
                // (this disables requestAnimationFrame which p5 relies on)
                setInterval(function() {
                    if (_p5FrameCount == null) {
                        _p5FrameCount = p.frameCount;
                    } else if (_p5FrameCount == p.frameCount) {
                        _p5FrameCountStalled++;
                    } else {
                        _p5FrameCount = p.frameCount;
                        _p5FrameCountStalled = 0;
                    }

                    // take over calling the 'draw' function
                    if (_p5FrameCountStalled > 60) {
                        p.redraw();
                        _p5FrameCount++;
                    }
                }, 16);
            }
            p.draw = function() {
                p.clear();
                p.image(_cg, 0, 0);
            }


        }

        this.dynamicTextures[_id] = new p5(sketchCode);
        return _id;
    }

    isControllerRightTriggerDown() {
        return AFrameP5Utils.controller_rightTriggerDown;
    }

    isControllerLeftTriggerDown() {
        return AFrameP5Utils.controller_leftTriggerDown;
    }

    isControllerRightGripDown() {
        return AFrameP5Utils.controller_rightGripDown;
    }

    isControllerLeftGripDown() {
        return AFrameP5Utils.controller_leftGripDown;
    }

    isControllerAButtonDown() {
        return AFrameP5Utils.controller_aButtonDown;
    }

    isControllerBButtonDown() {
        return AFrameP5Utils.controller_bButtonDown;
    }

    isControllerXButtonDown() {
        return AFrameP5Utils.controller_xButtonDown;
    }

    isControllerYButtonDown() {
        return AFrameP5Utils.controller_yButtonDown;
    }

    getControllerRightThumbstickDirection() {
        return AFrameP5Utils.controller_rightThumbstickDirection;
    }

    getControllerLeftThumbstickDirection() {
        return AFrameP5Utils.controller_leftThumbstickDirection;
    }

    getControllerRightThumbstickRawData() {
        return AFrameP5Utils.controller_rightThumbstickRawData;
    }

    getControllerLeftThumbstickRawData() {
        return AFrameP5Utils.controller_leftThumbstickRawData;
    }

    noLoop() {
        this.loop = false;
        try {
            noLoop();
        } catch (err) {}
    }

    loop() {
        this.loop = true;
        try {
            loop();
        } catch (err) {}
    }

    setBackground(r, g, b) {
        r = parseInt( r )
        g = parseInt( g )
        b = parseInt( b )
        this.scene.setAttribute('background', `color: rgb(${r}, ${g}, ${b})`);
    }

    rotateCameraX(a) {
	    this.camera.rotateX(a);
    }

    rotateCameraY(a) {
	    this.camera.rotateY(a);
    }

    rotateCameraZ(a) {
	    this.camera.rotateZ(a);
    }

}



class Camera {

    constructor(mouseOrGaze, threeScene) {

        // construct a camera rig
        this.holder = document.createElement('a-entity');
        this.holder.setAttribute('position', '0 1 5');

        // construct a camera
        this.cameraEl = document.createElement('a-entity');
        this.cameraEl.setAttribute('look-controls', '');
        this.cameraEl.setAttribute('camera', '');
        this.cameraEl.setAttribute('rotation-and-position-reader', '');
        this.holder.appendChild(this.cameraEl);

        // set rotation of camera
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;

        // default to disallow flying
        this.setWASD(false);

        // construct our cursor graphic
        this.cursor = new Ring({
            x: 0,
            y: 0,
            z: -1.0,
            radiusInner: 0.02,
            radiusOuter: 0.03,
            side: 'double',
            red: 0,
            green: 0,
            blue: 0,
            shader: 'flat',
            opacity: 0.5
        });

        // add ring indicator to our entity holder
        this.cameraEl.appendChild(this.cursor.tag);

        // default to mouse controls
        if (mouseOrGaze == 'gaze') {
            this.setGazeControls();
        } else {
            this.setMouseControls(threeScene);
        }
    }

    setMouseControls(threeScene) {
        this.cursor.hide();
        this.cursor.tag.setAttribute('cursor', 'rayOrigin: mouse');
        this.cursor.tag.setAttribute('cursor-ray', '');
        this.cursor.tag.setAttribute('raycaster', "objects: [generic-interaction-handler]");

        // also set up pointers for VR controllers
        this.leftHand = document.createElement('a-entity');
        this.leftHand.setAttribute('laser-controls', 'hand: left');
        this.leftHand.setAttribute('vrcontroller-lefthand', '');
        this.leftHand.setAttribute('raycaster', 'objects: [generic-interaction-handler]');

        this.rightHand = document.createElement('a-entity');
        this.rightHand.setAttribute('laser-controls', 'hand: right');
        this.rightHand.setAttribute('vrcontroller-righthand', '');
        this.rightHand.setAttribute('raycaster', 'objects: [generic-interaction-handler]');

        let _this = this;
        threeScene.addEventListener('enter-vr', function() {
            _this.rightHand.setAttribute('cursor-ray', '');
            _this.leftHand.setAttribute('cursor-ray', '');
        });

        threeScene.addEventListener('exit-vr', function() {
            _this.rightHand.removeAttribute('cursor-ray');
            _this.leftHand.removeAttribute('cursor-ray');
        });

        this.holder.appendChild(this.leftHand);
        this.holder.appendChild(this.rightHand);
    }

    setGazeControls() {
        this.cursor.tag.setAttribute('cursor', 'fuse: false');
        this.cursor.tag.setAttribute('cursor-ray', '');
        this.cursor.tag.setAttribute('raycaster', "objects: [generic-interaction-handler]");
        this.cursor.show();
    }

    setWASD(flying) {
        this.cameraEl.setAttribute('wasd-controls', 'fly: ' + flying);
    }

    // setters & getters
    setPosition(x, y, z) {
		    // only need to update THREE.JS object
        this.holder.object3D.position.x = x;
        this.holder.object3D.position.y = y;
        this.holder.object3D.position.z = z;

        // reset camera back to its initial origin point
        this.cameraEl.object3D.position.x = 0;
        this.cameraEl.object3D.position.y = 0;
        this.cameraEl.object3D.position.z = 0;
    }

    nudgePosition(x, y, z) {
		// only need to update THREE.JS object
		this.holder.object3D.position.x = AFrameP5Utils.camera_positionWorld.x + x;		// this works, but breaks when WASD is used
        this.holder.object3D.position.y = AFrameP5Utils.camera_positionWorld.y + y;
        this.holder.object3D.position.z = AFrameP5Utils.camera_positionWorld.z + z;

        // fix: reset camera back to its initial origin point
        this.cameraEl.object3D.position.x = 0;
        this.cameraEl.object3D.position.y = 0;
        this.cameraEl.object3D.position.z = 0;
    }

    getX() {
        return AFrameP5Utils.camera_positionWorld.x;
    }

    getY() {
        return AFrameP5Utils.camera_positionWorld.y;
    }

    getZ() {
        return AFrameP5Utils.camera_positionWorld.z;
    }

    rotateX(a) {
	    this.holder.object3D.rotation.x += a * Math.PI / 180;
    }

    rotateY(a) {
	    this.holder.object3D.rotation.y += a * Math.PI / 180;
    }

    rotateZ(a) {
	    this.holder.object3D.rotation.z += a * Math.PI / 180;
    }


}
